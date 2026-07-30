const Invoice     = require('../models/Invoice.model');
const InvoiceLine = require('../models/InvoiceLine.model');
const Client      = require('../models/Client.model');

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({
    numero: { $regex: `^${year}/` }
  });
  const next = String(count + 1).padStart(3, '0');
  return `${year}/${next}`;
};

const calculateTotals = (lines, tvaRate = 0.20) => {
  const total_ht = lines.reduce((sum, line) => {
    const brut = line.quantity * line.unit_price_ht;
    const discount = brut * (line.discount_pct || 0);
    return sum + (brut - discount);
  }, 0);
  const tva_amount = parseFloat((total_ht * tvaRate).toFixed(2));
  const total_ttc  = parseFloat((total_ht + tva_amount).toFixed(2));
  return { total_ht: parseFloat(total_ht.toFixed(2)), tva_amount, total_ttc };
};

const getInvoices = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) query.numero = { $regex: search, $options: 'i' };

    const invoices = await Invoice.find(query)
      .populate('client_id', 'name company')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (err) {
    next(err);
  }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client_id');

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const lines = await InvoiceLine.find({ invoice_id: invoice._id })
      .populate('product_id', 'ref designation unit');

    res.json({ invoice, lines });
  } catch (err) {
    next(err);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const { lines, tva_rate, ...invoiceData } = req.body;

    if (!lines || lines.length === 0) {
      return res.status(400).json({ message: 'Invoice must have at least one line' });
    }

    const client = await Client.findById(invoiceData.client_id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    invoiceData.code_client = client.code_client;

    if (invoiceData.numero && invoiceData.numero.trim()) {
      const existing = await Invoice.findOne({ numero: invoiceData.numero.trim() });
      if (existing) return res.status(409).json({ message: 'Numero already used by another invoice' });
      invoiceData.numero = invoiceData.numero.trim();
    } else {
      invoiceData.numero = await generateInvoiceNumber();
    }

    const rate = tva_rate || 0.20;
    const totals = calculateTotals(lines, rate);

    const invoice = await Invoice.create({
      ...invoiceData,
      tva_rate: rate,
      ...totals
    });

    const invoiceLines = lines.map(line => ({
      ...line,
      invoice_id: invoice._id,
      discount_amount: parseFloat(
        (line.quantity * line.unit_price_ht * (line.discount_pct || 0)).toFixed(2)
      ),
      line_total_ht: parseFloat(
        (line.quantity * line.unit_price_ht * (1 - (line.discount_pct || 0))).toFixed(2)
      )
    }));

    await InvoiceLine.insertMany(invoiceLines);

    res.status(201).json({ message: 'Invoice created', invoice });
  } catch (err) {
    next(err);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const { lines, tva_rate, ...invoiceData } = req.body;

    if (!invoiceData.numero?.trim()) {
      return res.status(400).json({ message: 'Numéro requis' });
    }
    if (!invoiceData.date) {
      return res.status(400).json({ message: 'Date requise' });
    }
    if (!lines || lines.length === 0) {
      return res.status(400).json({ message: 'Au moins une ligne requise' });
    }

    const existing = await Invoice.findOne({
      numero: invoiceData.numero.trim(),
      _id: { $ne: req.params.id }
    });
    if (existing) return res.status(409).json({ message: 'Numéro déjà utilisé' });

    const rate = tva_rate ?? 0.20;
    const totals = calculateTotals(lines, rate);

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { ...invoiceData, numero: invoiceData.numero.trim(), tva_rate: rate, ...totals },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await InvoiceLine.deleteMany({ invoice_id: req.params.id });
    const invoiceLines = lines.map(line => ({
      ...line,
      invoice_id: invoice._id,
      discount_amount: parseFloat(
        (line.quantity * line.unit_price_ht * (line.discount_pct || 0)).toFixed(2)
      ),
      line_total_ht: parseFloat(
        (line.quantity * line.unit_price_ht * (1 - (line.discount_pct || 0))).toFixed(2)
      )
    }));
    const savedLines = await InvoiceLine.insertMany(invoiceLines);

    res.json({ message: 'Invoice updated', invoice, lines: savedLines });
  } catch (err) { next(err); }
};

const updateInvoiceNumero = async (req, res, next) => {
  try {
    const { numero } = req.body;
    if (!numero || !numero.trim()) {
      return res.status(400).json({ message: 'Numero is required' });
    }

    const existing = await Invoice.findOne({ numero: numero.trim(), _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(409).json({ message: 'Numero already used by another invoice' });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { numero: numero.trim() },
      { new: true }
    );

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Numero updated', invoice });
  } catch (err) {
    next(err);
  }
};

const updateInvoiceType = async (req, res, next) => {
  try {
    const { type } = req.body;
    if (!['proforma', 'facture'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { type },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Type updated', invoice });
  } catch (err) { next(err); }
};

const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'sent', 'paid', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Status updated', invoice });
  } catch (err) {
    next(err);
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    await InvoiceLine.deleteMany({ invoice_id: req.params.id });

    res.json({ message: 'Invoice and lines deleted' });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const totalInvoices  = await Invoice.countDocuments();
    const totalFacture   = await Invoice.countDocuments({ type: 'facture' });
    const totalProforma  = await Invoice.countDocuments({ type: 'proforma' });

    const revenueResult = await Invoice.aggregate([
      { $group: { _id: '$type', total: { $sum: '$total_ttc' } } }
    ]);

    const revenueFacture  = revenueResult.find(r => r._id === 'facture')?.total  || 0;
    const revenueProforma = revenueResult.find(r => r._id === 'proforma')?.total || 0;
    const revenue = revenueFacture + revenueProforma;

    res.json({ totalInvoices, totalFacture, totalProforma, revenue, revenueFacture, revenueProforma });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  updateInvoiceNumero,
  updateInvoiceType,
  updateInvoiceStatus,
  deleteInvoice,
  getDashboardStats
};
