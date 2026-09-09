const Project = require('../models/Project');
const { uploadToR2, deleteFromR2 } = require('../utils/r2Storage');

// Get all projects
const getProjects = async (req, res) => {
  try {
    console.log(`[getProjects] db=${require('mongoose').connection.name} host=${require('mongoose').connection.host} coll=${Project.collection.name}`);
    const rawCount = await Project.estimatedDocumentCount();
    const projects = await Project.find({}).lean();
    console.log(`[getProjects] estimated count=${rawCount} returned=${projects.length}`);
    let needsBackfill = false;
    const normalized = projects.map((p) => {
      if (p.order === undefined || p.order === null) {
        needsBackfill = true;
        return p;
      }
      return p;
    });
    if (needsBackfill) {
      try {
        const ops = normalized
          .filter((p) => p.order === undefined || p.order === null)
          .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
          .map((p, i) => ({
            updateOne: {
              filter: { _id: p._id },
              update: { $set: { order: i } },
            },
          }));
        if (ops.length > 0) await Project.bulkWrite(ops);
      } catch (e) {
        console.error('Order backfill failed:', e.message);
      }
    }
    normalized.sort((a, b) => {
      const ao = Number.isFinite(a.order) ? a.order : Number.POSITIVE_INFINITY;
      const bo = Number.isFinite(b.order) ? b.order : Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      if ((b.featured ? 1 : 0) !== (a.featured ? 1 : 0)) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    res.json(normalized);
  } catch (error) {
    console.error('Update project failed:', error);
    res.status(500).json({ message: 'Unable to update project', error: error.message });
  }
};

const reorderProjects = async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body?.order;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order payload' });
    }

    const ops = items
      .filter((it) => it && it.id)
      .map((it) => ({
        updateOne: {
          filter: { _id: it.id },
          update: { $set: { order: Number.isFinite(it.order) ? it.order : 0 } },
        },
      }));

    if (ops.length === 0) {
      return res.status(400).json({ message: 'No valid items in payload' });
    }

    await Project.bulkWrite(ops);
    const projects = await Project.find({}).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, github, tags } = req.body;
    let tagsArray = tags;
    if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(tag => tag.trim());
    }

    const lastProject = await Project.findOne({}).sort({ order: -1 }).select('order').lean();
    const nextOrder = lastProject && Number.isFinite(lastProject.order) ? lastProject.order + 1 : 0;

    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    const project = new Project({
      title,
      description,
      github,
      tags: tagsArray,
      isPrivate: req.body.isPrivate === 'true' || req.body.isPrivate === true,
      featured: req.body.featured === 'true' || req.body.featured === true,
      order: req.body.order !== undefined ? Number(req.body.order) : nextOrder,
      image: imageUrl,
    });

    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { title, description, github, tags } = req.body;

    const project = await Project.findById(req.params.id);

    if (project) {
      project.title = title || project.title;
      project.description = description || project.description;
      project.github = github || project.github;
      if (req.body.isPrivate !== undefined) {
        project.isPrivate = req.body.isPrivate === 'true' || req.body.isPrivate === true;
      }
      if (req.body.featured !== undefined) {
        project.featured = req.body.featured === 'true' || req.body.featured === true;
      }

      if (tags) {
        project.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
      }

      if (req.file) {
        if (project.image) {
          await deleteFromR2(project.image);
        }
        project.image = await uploadToR2(req.file.buffer, req.file.originalname, req.file.mimetype);
      }

      const updatedProject = await project.save();
      res.json(updatedProject);
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    console.error('Delete project failed:', error);
    res.status(500).json({ message: 'Unable to delete project', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (project) {
      if (project.image) {
        await deleteFromR2(project.image);
      }
      await Project.deleteOne({ _id: project._id });
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject, reorderProjects };