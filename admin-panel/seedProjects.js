const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('./models/Project');

dotenv.config();

const projects = [
  {
    title: 'CMMS',
    description: 'A comprehensive maintenance management platform designed to streamline equipment tracking, work orders, preventive maintenance scheduling, and asset lifecycle management.',
    image: '/images/cmms.png',
    tags: ['Laravel', 'React', 'MySQL', 'REST API'],
    github: 'https://github.com/Sohaib-Ft',
    featured: true,
    order: 0,
  },
  {
    title: 'LinkedU',
    description: 'A professional networking platform tailored for university students and graduates to connect, share opportunities, and build their academic and professional network.',
    image: '/images/linkedu.png',
    tags: ['Node.js', 'React', 'MongoDB', 'Express'],
    github: 'https://github.com/Sohaib-Ft',
    featured: true,
    order: 1,
  },
  {
    title: 'Book Review',
    description: 'An interactive book review application where users can browse, rate, and review books. Features include reading lists, personalized recommendations, and community discussions.',
    image: '/images/book-review.png',
    tags: ['PHP', 'Laravel', 'PostgreSQL', 'Bootstrap'],
    github: 'https://github.com/Sohaib-Ft',
    featured: true,
    order: 2,
  },
  {
    title: 'OFPPT Cours',
    description: 'An e-learning platform providing comprehensive course summaries and study materials for OFPPT students, featuring organized modules, progress tracking, and downloadable resources.',
    image: '/images/ofppt.png',
    tags: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    github: 'https://github.com/Sohaib-Ft',
    featured: false,
    order: 3,
  },
];

const seedProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await Project.deleteMany({});
    console.log('Cleared existing projects');

    await Project.insertMany(projects);
    console.log(`Seeded ${projects.length} projects successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedProjects();
