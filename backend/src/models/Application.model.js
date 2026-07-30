const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Specialty Coffee Equipment SARL'
  },
  logo: {
    type: String,
    required: false,
  },
  icon: {
    type: String,
    required: false,
  },
  telephone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },

  //Infos sur societe proprietiare

  // --- address ---
  address: {
    type: String,
    default: 'Mag nr 15 ZAE, Fahs Anjra, Bahraouyenne Route de Tetouan, Suite a Tanger 90000'
  },

  // --- legal identifiers ---
  ice: {
    type: String,
    default: '002003637000059'
  },
  rc: {
    type: String,
    default: '86823'
  },
  if: {
    type: String,
    default: '25042896'
  },
  cnss: {
    type: String,
    default: '5890133'
  },
  tp: {
    type: String,
    default: '50472574'
  },

  // --- banking ---
  bank_name: {
    type: String,
    default: 'BMCE Bank'
  },
  bank_rib: {
    type: String,
    default: '011 640 00000121000199 52 78'
  },
});

module.exports = mongoose.model('Application', applicationSchema);