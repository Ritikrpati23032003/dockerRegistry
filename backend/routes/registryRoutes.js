const express = require('express');
const router = express.Router();
const { listRepositories, getRepositoryDetails, getTagDetails, deleteTag, getStatistics, triggerGC } = require('../controllers/registryController');
const authenticateToken = require('../middleware/auth');

// Note: Repo names can contain slashes. Express routing with params containing slashes requires care.
// We will use `encodeURIComponent` on client side, so backend receives "library%2Fubuntu".
// Express decodes params automatically.
// So `/repositories/:name` should work.

router.get('/repositories', authenticateToken(['admin', 'maintainer', 'user']), listRepositories);
router.get('/statistics', authenticateToken(['admin', 'maintainer', 'user']), getStatistics);
router.post('/gc', authenticateToken(['admin']), triggerGC);
router.get('/repositories/:name', authenticateToken(['admin', 'maintainer', 'user']), getRepositoryDetails);
router.get('/repositories/:name/tags/:tag', authenticateToken(['admin', 'maintainer', 'user']), getTagDetails);
router.delete('/repositories/:name/tags/:tag', authenticateToken(['admin']), deleteTag);

module.exports = router;