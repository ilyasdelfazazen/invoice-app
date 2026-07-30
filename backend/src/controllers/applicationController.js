const Application = require('../models/Application.model');

const getPublicApplication = async (req, res, next) => {
  try {
    const app = await Application.findOne().select('name logo');
    res.json({ name: app?.name || '', logo: app?.logo || '' });
  } catch (err) {
    next(err);
  }
};

const getApplication = async (req, res, next) => {
  try {
    let app = await Application.findOne();
    if (!app) {
      app = await Application.create({});
    }
    res.json(app);
  } catch (err) {
    next(err);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    let app = await Application.findOne();
    if (!app) {
      app = await Application.create(req.body);
    } else {
      Object.assign(app, req.body);
      await app.save();
    }
    res.json({ message: 'Application updated', app });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicApplication, getApplication, updateApplication };
