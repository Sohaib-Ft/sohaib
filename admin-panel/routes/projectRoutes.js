const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject, reorderProjects } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getProjects) // Public access (for portfolio)
  .post(upload.single('image'), createProject);

// Bulk reorder must be declared BEFORE the /:id route
router.put('/reorder', reorderProjects);

router.route('/:id')
  .put(upload.single('image'), updateProject)
  .delete(deleteProject);

module.exports = router;
