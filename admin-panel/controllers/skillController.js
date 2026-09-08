const Skill = require('../models/Skill');

const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({}).sort({ order: 1, createdAt: -1 });
    res.json(skills);
  } catch (error) {
    console.error('Get skills failed:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const createSkill = async (req, res) => {
  const { name, category, icon, role } = req.body;

  try {
    const skill = new Skill({
      name,
      category,
      icon,
      role: role || '',
    });

    const createdSkill = await skill.save();
    res.status(201).json(createdSkill);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateSkill = async (req, res) => {
  const { name, category, icon, role } = req.body;

  try {
    const skill = await Skill.findById(req.params.id);

    if (skill) {
      skill.name = name || skill.name;
      skill.category = category || skill.category;
      skill.icon = icon !== undefined ? icon : skill.icon;
      skill.role = role !== undefined ? role : skill.role;

      const updatedSkill = await skill.save();
      res.json(updatedSkill);
    } else {
      res.status(404).json({ message: 'Skill not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (skill) {
      await Skill.deleteOne({ _id: skill._id });
      res.json({ message: 'Skill removed' });
    } else {
      res.status(404).json({ message: 'Skill not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const reorderSkills = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: 'orderedIds must be an array' });
    }

    const updatePromises = orderedIds.map((id, index) => {
      return Skill.findByIdAndUpdate(id, { order: index });
    });

    await Promise.all(updatePromises);
    res.json({ message: 'Skills reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { getSkills, createSkill, updateSkill, deleteSkill, reorderSkills };
