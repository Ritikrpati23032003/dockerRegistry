const registryService = require('../services/registryService');
const axios = require('axios');

const listRepositories = async (req, res) => {
    try {
        const repos = await registryService.getCatalog();

        // Fetch stats for all repos in one query for efficiency
        const statsResult = await pool.query(`
            SELECT repository, action, COUNT(*) as count 
            FROM registry_stats 
            WHERE action IN ('push', 'pull') 
            GROUP BY repository, action
        `);

        // Create a map for quick lookup: repoName -> { push: N, pull: M }
        const statsMap = {};
        statsResult.rows.forEach(row => {
            if (!statsMap[row.repository]) {
                statsMap[row.repository] = { push: 0, pull: 0 };
            }
            statsMap[row.repository][row.action] = parseInt(row.count);
        });

        // Enrich with basic tag info for the dashboard
        const enrichedRepos = await Promise.all(repos.map(async (name) => {
            try {
                const tags = await registryService.getTags(name);
                const repoStats = statsMap[name] || { push: 0, pull: 0 };
                return {
                    name,
                    tagsCount: tags.length,
                    tags: tags.slice(0, 5),
                    pushCount: repoStats.push,
                    pullCount: repoStats.pull
                };
            } catch (e) {
                return { name, tagsCount: 0, tags: [], pushCount: 0, pullCount: 0 };
            }
        }));

        res.json(enrichedRepos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch repositories' });
    }
};

const getRepositoryDetails = async (req, res) => {
    try {
        const { name } = req.params;
        const tags = await registryService.getTags(name);

        // Return public registry URL for UI
        const registryHost = process.env.REGISTRY_HOST || 'localhost:5432';

        res.json({ name, tags, registryHost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch repository details' });
    }
};

const getTagDetails = async (req, res) => {
    try {
        const { name, tag } = req.params;
        const { manifest, digest } = await registryService.getManifest(name, tag);

        let created = null;
        let history = [];

        // Try to fetch Config Blob to get Creation Date and History
        // V2 Schema 2
        if (manifest.config && manifest.config.digest) {
            try {
                const config = await registryService.getBlob(name, manifest.config.digest);
                if (config.created) created = config.created;
                if (config.history) history = config.history;
                var architecture = config.architecture;
                var os = config.os;
            } catch (e) {
                console.warn(`Failed to fetch config blob for ${name}:${tag}`, e.message);
            }
        }
        // V1 Compatibility (Schema 1)
        else if (manifest.history && manifest.history.length > 0) {
            try {
                const v1Compatibility = JSON.parse(manifest.history[0].v1Compatibility);
                if (v1Compatibility.created) created = v1Compatibility.created;
                if (v1Compatibility.architecture) architecture = v1Compatibility.architecture;
                if (v1Compatibility.os) os = v1Compatibility.os;
            } catch (e) { }
        }

        // Fetch repo stats
        const repoStatsResult = await pool.query(
            "SELECT action, COUNT(*) as count FROM registry_stats WHERE repository = $1 AND action IN ('push', 'pull') GROUP BY action",
            [name]
        );
        const repoStats = { push: 0, pull: 0 };
        repoStatsResult.rows.forEach(row => {
            repoStats[row.action] = parseInt(row.count);
        });

        // Try to identify who pushed this tag
        // Heuristic: Find the push event closest to the creation time (within reasonable margin or just slightly before/after)
        // Since clocks might drift or auth happens before upload complete, we look for the latest push BEFORE or AT creation time, 
        // OR if that fails, maybe the first one AFTER (if created time is build time and push happened later).
        // Actually, 'created' in generic config is usually build time. Push happens LATER.
        // So we want the first push event AFTER the created date.
        let pushedBy = 'Unknown';
        if (created) {
            const createdDate = new Date(created);
            // Find push events after creation.
            const pusherResult = await pool.query(
                "SELECT username FROM registry_stats WHERE repository = $1 AND action = 'push' AND timestamp >= $2 ORDER BY timestamp ASC LIMIT 1",
                [name, createdDate]
            );
            if (pusherResult.rows.length > 0) {
                pushedBy = pusherResult.rows[0].username;
            } else {
                // Fallback: Check if there was a push slightly before (in case created date is slightly in future or skew)
                // Or just return the last person to push to this repo if we can't match? No, that's misleading.
                // Maybe "Unknown (Historic)"
            }
        }

        res.json({
            name,
            tag,
            digest,
            size: manifest.layers?.reduce((acc, l) => acc + l.size, 0) || 0,
            created,
            architecture,
            os,
            history,
            manifest, // Return raw manifest
            stats: repoStats,
            pushedBy
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch tag details' });
    }
}

const deleteTag = async (req, res) => {
    try {
        const { name, tag } = req.params;
        // 1. Get digest
        const { digest } = await registryService.getManifest(name, tag);
        if (!digest) return res.status(404).json({ message: 'Tag not found' });

        // 2. Delete
        await registryService.deleteImage(name, digest);
        res.json({ message: 'Image deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete image' });
    }
};

const pool = require('../config/db');

const getStatistics = async (req, res) => {
    try {
        const totalPushes = await pool.query("SELECT COUNT(*) FROM registry_stats WHERE action = 'push'");
        const totalPulls = await pool.query("SELECT COUNT(*) FROM registry_stats WHERE action = 'pull'");
        const recentActivity = await pool.query("SELECT * FROM registry_stats ORDER BY timestamp DESC LIMIT 10");

        res.json({
            totalPushes: parseInt(totalPushes.rows[0].count),
            totalPulls: parseInt(totalPulls.rows[0].count),
            recentActivity: recentActivity.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch statistics' });
    }
};

const triggerGC = async (req, res) => {
    try {
        const socketPath = '/var/run/docker.sock';
        const containerName = 'registry';

        // 1. Create Exec Instance
        const execCreateUrl = `http://localhost/containers/${containerName}/exec`;
        const execCreateConfig = {
            socketPath,
            headers: { 'Content-Type': 'application/json' }
        };
        const execCreateBody = {
            AttachStdout: true,
            AttachStderr: true,
            Cmd: ["bin/registry", "garbage-collect", "/etc/docker/registry/config.yml"]
        };

        const createRes = await axios.post(execCreateUrl, execCreateBody, execCreateConfig);
        const execId = createRes.data.Id;

        // 2. Start Exec Instance
        const execStartUrl = `http://localhost/exec/${execId}/start`;
        const execStartConfig = {
            socketPath,
            headers: { 'Content-Type': 'application/json' }
        };
        const execStartBody = {
            Detach: false,
            Tty: false
        };

        const startRes = await axios.post(execStartUrl, execStartBody, execStartConfig);

        // Axios returns the stream/response data. For simple GC output, it usually fits in data.
        // Docker API returns raw stream with header. We might see some binary chars.
        // For now, let's just return the data as is or stringified.
        res.json({ message: 'Garbage Collection triggered', output: startRes.data });

    } catch (err) {
        console.error('GC Trigger Error:', err.message);
        if (err.response) {
            console.error('Docker API Error:', err.response.data);
            return res.status(500).json({ message: 'Failed to trigger GC: ' + (err.response.data.message || err.message) });
        }
        res.status(500).json({ message: 'Failed to trigger GC' });
    }
};

module.exports = { listRepositories, getRepositoryDetails, getTagDetails, deleteTag, getStatistics, triggerGC };
