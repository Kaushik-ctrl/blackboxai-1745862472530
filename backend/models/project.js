const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  clientName: { type: String, required: true, trim: true },
  clientEmail: { type: String, required: true, trim: true, lowercase: true },
  clientPhone: { type: String, trim: true },
  requirements: { type: String, required: true, trim: true },
  budget: { type: Number, required: false },
  status: { type: String, enum: ['new', 'in progress', 'completed', 'cancelled'], default: 'new' },
  fileUrl: { type: String, required: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', projectSchema);
