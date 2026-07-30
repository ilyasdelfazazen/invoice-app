require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin.model');
const Application = require('./models/Application.model');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existingAdmin = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await Admin.create({ username: process.env.ADMIN_USERNAME, password: hashed });
    console.log(`Admin created: ${process.env.ADMIN_USERNAME}`);
  } else {
    console.log('Admin already exists');
  }

  const existingApp = await Application.findOne();
  if (!existingApp) {
    await Application.create({});
    console.log('Application seeded with defaults');
  } else {
    console.log('Application already exists');
  }

  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
