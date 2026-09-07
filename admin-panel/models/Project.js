const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
  github: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
