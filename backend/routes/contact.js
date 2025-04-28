const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
const { body, validationResult } = require('express-validator');

// POST /api/contact - handle contact form submission
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, message } = req.body;

    try {
      const contact = new Contact({ name, email, phone, message });
      await contact.save();

      // TODO: Send email notification to admin

      res.status(201).json({ message: 'Contact inquiry received' });
    } catch (error) {
      console.error('Error saving contact inquiry:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
