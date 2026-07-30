const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true,
    // ex: "Trip La Marzocco Milan", "Pentair facture", "Boekhouding 2019"
  },

  amount: {
    type: Number,
    required: true,
    // always stored in the original currency value
  },

  date: {
    type: Date,
    required: true,
    default: Date.now
  },

  status: {
    type: String,
    enum: ['open', 'paid'],
    default: 'open'
    // open → still owed / unpaid
    // paid → settled
  },

  paid_at: {
    type: Date,
    default: null
  },

  context: {
    type: String,
    default: ''
    // ex: "Italie octobre 2021", "London novembre 2019"
    // groups related expenses together visually
  },

  category: {
    type: String,
    enum: ['personal', 'business'],
    default: 'business'
  }

}, { timestamps: true });

module.exports = mongoose.model('Operation', operationSchema);