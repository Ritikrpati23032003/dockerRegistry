CREATE TABLE IF NOT EXISTS registry_stats (
    id SERIAL PRIMARY KEY,
    repository VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster aggregation
CREATE INDEX IF NOT EXISTS idx_registry_stats_timestamp ON registry_stats(timestamp);
CREATE INDEX IF NOT EXISTS idx_registry_stats_action ON registry_stats(action);
