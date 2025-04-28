const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Subscriber = require('../models/subscriber');
const { body, validationResult } = require('express-validator');

// Helper function to generate tokens
function generateToken() {
  return crypto.randomBytes(20).toString('hex');
}

// POST /api/subscribers - subscribe with double opt-in
router.post(
  '/',
  [body('email').isEmail().withMessage('Valid email is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      let subscriber = await Subscriber.findOne({ email });

      if (subscriber) {
        if (subscriber.verified) {
          return res.status(400).json({ error: 'Email already subscribed and verified' });
        } else {
          // Resend verification email
          // TODO: Send verification email with subscriber.verificationToken
          return res.status(200).json({ message: 'Verification email resent' });
        }
      }

      const verificationToken = generateToken();

      subscriber = new Subscriber({
        email,
        verified: false,
        verificationToken,
      });

      await subscriber.save();

      // TODO: Send verification email with verificationToken

      res.status(201).json({ message: 'Subscription received. Please check your email to verify.' });
    } catch (error) {
      console.error('Error subscribing:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/subscribers/verify/:token - verify subscription
router.get('/verify/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const subscriber = await Subscriber.findOne({ verificationToken: token });

    if (!subscriber) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    subscriber.verified = true;
    subscriber.verificationToken = undefined;
    await subscriber.save();

    res.status(200).json({ message: 'Subscription verified successfully' });
  } catch (error) {
    console.error('Error verifying subscription:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/subscribers/unsubscribe/:token - unsubscribe
router.get('/unsubscribe/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const subscriber = await Subscriber.findOne({ unsubscribeToken: token });

    if (!subscriber) {
      return res.status(400).json({ error: 'Invalid or expired unsubscribe token' });
    }

    await Subscriber.deleteOne({ _id: subscriber._id });

    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
