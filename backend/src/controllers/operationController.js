const Operation = require('../models/Operation.model');

const getOperationById = async (req, res, next) => {
  try {
    const operation = await Operation.findById(req.params.id);
    if (!operation) return res.status(404).json({ message: 'Operation not found' });
    res.json(operation);
  } catch (err) {
    next(err);
  }
};

const getOperations = async (req, res, next) => {
  try {
    const { search, status, category } = req.query;
    let query = {};

    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { context: { $regex: search, $options: 'i' } },
    ];
    if (status) query.status = status;
    if (category) query.category = category;

    const operations = await Operation.find(query).sort({ date: -1 });
    res.json(operations);
  } catch (err) {
    next(err);
  }
};

const getOperationTotals = async (req, res, next) => {
  try {
    const result = await Operation.aggregate([
      { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const totals = { open: 0, paid: 0, countOpen: 0, countPaid: 0 };
    result.forEach(r => {
      if (r._id === 'open')  { totals.open = r.total; totals.countOpen = r.count; }
      if (r._id === 'paid')  { totals.paid = r.total; totals.countPaid = r.count; }
    });

    res.json(totals);
  } catch (err) {
    next(err);
  }
};

const createOperation = async (req, res, next) => {
  try {
    const operation = await Operation.create(req.body);
    res.status(201).json({ message: 'Operation created', operation });
  } catch (err) {
    next(err);
  }
};

const updateOperation = async (req, res, next) => {
  try {
    const operation = await Operation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!operation) return res.status(404).json({ message: 'Operation not found' });
    res.json({ message: 'Operation updated', operation });
  } catch (err) {
    next(err);
  }
};

const markAsPaid = async (req, res, next) => {
  try {
    const operation = await Operation.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paid_at: new Date() },
      { new: true }
    );
    if (!operation) return res.status(404).json({ message: 'Operation not found' });
    res.json({ message: 'Marked as paid', operation });
  } catch (err) {
    next(err);
  }
};

const deleteOperation = async (req, res, next) => {
  try {
    const operation = await Operation.findByIdAndDelete(req.params.id);
    if (!operation) return res.status(404).json({ message: 'Operation not found' });
    res.json({ message: 'Operation deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOperationById,
  getOperations,
  getOperationTotals,
  createOperation,
  updateOperation,
  markAsPaid,
  deleteOperation
};
