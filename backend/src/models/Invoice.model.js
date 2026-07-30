const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true,
    // ex: 2026/007
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  code_client: {
    type: String,
    default: ''
    // snapshot from client at invoice creation time
  },
  bl_number: {
    type: String,
    default: ''
    // BL N field visible on the invoice
  },

  // --- payment ---
  payment_mode: {
    type: String,
    default: 'Virement bancaire'
  },
  payment_conditions: {
    type: String,
    default: '50% à la commande, Reste à la Livraison'
  },
  bank_name: {
    type: String,
    default: 'BMCE Bank'
  },
  bank_rib: {
    type: String,
    default: ''
  },

  // --- type ---
  type: {
    type: String,
    enum: ['proforma', 'facture'],
    default: 'proforma'
  },

  // --- status ---
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    default: 'draft'
  },

  // --- totals ---
  total_ht: {
    type: Number,
    default: 0
  },
  tva_rate: {
    type: Number,
    default: 0.20
  },
  tva_amount: {
    type: Number,
    default: 0
  },
  total_ttc: {
    type: Number,
    default: 0
  },

  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);