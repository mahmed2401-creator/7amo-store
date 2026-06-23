const Message = require('../models/Message');

// @desc    Submit a new message
// @route   POST /api/messages
// @access  Public
const submitMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private/Admin
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = { submitMessage, getMessages };
