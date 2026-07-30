const mongoose = require('mongoose');

const invoiceLineSchema = new mongoose.Schema({
  invoice_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // snapshot at invoice creation — price may change later
  ref: {
    type: String,
    default: ''
  },
  designation: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  unit_price_ht: {
    type: Number,
    required: true
  },
  discount_pct: {
    type: Number,
    default: 0
    // ex: 0.10 = 10%
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  line_total_ht: {
    type: Number,
    default: 0
    // (quantity × unit_price_ht) - discount_amount
  },

});


module.exports = mongoose.model('InvoiceLine', invoiceLineSchema);