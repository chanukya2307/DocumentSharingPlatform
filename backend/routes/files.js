const express = require('express');
const router = express.Router();
const File = require('../models/File');

// Get files by username
router.get('/:username', async (req, res) => {
  try {
    const files = await File.find({ username: req.params.username });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving files' });
  }
});

// Delete file
router.delete('/:filename', async (req, res) => {
  try {
    const deleted = await File.findOneAndDelete({ filename: req.params.filename });
    if (!deleted) return res.status(404).json({ message: 'File not found' });
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

module.exports = router;
