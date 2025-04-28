const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Project = require('../models/project');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST /api/projects - handle project inquiry submission
router.post(
  '/',
  upload.single('file'),
  [
    body('clientName').trim().notEmpty().withMessage('Client name is required'),
    body('clientEmail').isEmail().withMessage('Valid client email is required'),
    body('clientPhone').optional().trim(),
    body('requirements').trim().notEmpty().withMessage('Project requirements are required'),
    body('budget').optional().isNumeric().withMessage('Budget must be a number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const { clientName, clientEmail, clientPhone, requirements, budget } = req.body;
    const fileUrl = req.file ? req.file.path : null;

    try {
      const project = new Project({
        clientName,
        clientEmail,
        clientPhone,
        requirements,
        budget,
        fileUrl,
      });
      await project.save();

      // TODO: Send admin notification

      res.status(201).json({ message: 'Project inquiry received' });
    } catch (error) {
      console.error('Error saving project inquiry:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
