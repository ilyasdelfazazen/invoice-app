const express = require('express');
const router = express.Router();
const {
  getOperationById,
  getOperations,
  getOperationTotals,
  createOperation,
  updateOperation,
  markAsPaid,
  deleteOperation
} = require('../controllers/operationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/totals',   getOperationTotals);
router.get('/',         getOperations);
router.get('/:id',      getOperationById);
router.post('/',        createOperation);
router.put('/:id',      updateOperation);
router.put('/:id/pay',  markAsPaid);
router.delete('/:id',   deleteOperation);

module.exports = router;
