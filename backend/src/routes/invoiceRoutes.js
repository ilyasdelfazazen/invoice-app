const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceNumero,
  updateInvoiceType,
  updateInvoiceStatus,
  deleteInvoice,
  getDashboardStats
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard/stats', getDashboardStats);
router.get('/',                getInvoices);
router.get('/:id',             getInvoiceById);
router.post('/',               createInvoice);
router.put('/:id',             updateInvoice);
router.put('/:id/numero',      updateInvoiceNumero);
router.put('/:id/type',        updateInvoiceType);
router.put('/:id/status',      updateInvoiceStatus);
router.delete('/:id',          deleteInvoice);

module.exports = router;
