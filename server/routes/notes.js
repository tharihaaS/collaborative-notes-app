const express = require('express');
const Note = require('../models/Note');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all notes (owned + collaborated) with optional search
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;

    let query;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query = {
        $and: [
          { $or: [{ owner: req.user.id }, { collaborators: req.user.id }] },
          { $or: [{ title: regex }, { content: regex }] }
        ]
      };
    } else {
      query = {
        $or: [{ owner: req.user.id }, { collaborators: req.user.id }]
      };
    }

    const notes = await Note.find(query)
      .populate('owner', 'username email')
      .populate('collaborators', 'username email')
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('collaborators', 'username email');

    if (!note) return res.status(404).json({ message: 'Note not found' });

    const hasAccess = note.owner._id.equals(req.user.id) ||
      note.collaborators.some(c => c._id.equals(req.user.id));
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.create({ title, content, tags, owner: req.user.id });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const hasAccess = note.owner.equals(req.user.id) ||
      note.collaborators.some(c => c.equals(req.user.id));
    if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

    const updated = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.owner.equals(req.user.id)) return res.status(403).json({ message: 'Only owner can delete' });

    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add collaborator by email
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.owner.equals(req.user.id)) return res.status(403).json({ message: 'Only owner can add collaborators' });

    const collaborator = await User.findOne({ email: req.body.email });
    if (!collaborator) return res.status(404).json({ message: 'User not found' });
    if (note.collaborators.includes(collaborator._id))
      return res.status(400).json({ message: 'Already a collaborator' });

    note.collaborators.push(collaborator._id);
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove collaborator
router.delete('/:id/collaborators/:userId', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (!note.owner.equals(req.user.id)) return res.status(403).json({ message: 'Only owner can remove collaborators' });

    note.collaborators = note.collaborators.filter(c => !c.equals(req.params.userId));
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;