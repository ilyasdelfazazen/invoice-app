const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  ref: {
    type: String,
    required: true,
    unique: true,
    trim: true
    // ex: LAM300560
  },
  designation: {
    type: String,
    required: true,
    trim: true
    // ex: LA MARZOCCO ESPRESSO COFFEE MACHINE LINEA CLASSIC...
  },
  unit_price_ht: {
    type: Number,
    required: true,
    default: 0
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);