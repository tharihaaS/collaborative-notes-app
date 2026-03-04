const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  content:     { type: String, default: '' },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags:        [String],
}, { timestamps: true });

// Enables full-text search on title and content
noteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', noteSchema);