import Message from '../models/Message.js';

export const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = req.query.limit || 50;

    const messages = await Message.find({ roomId })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      messages: messages.reverse(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { roomId, message } = req.body;

    if (!roomId || !message) {
      return res.status(400).json({ message: 'Room ID and message are required' });
    }

    const newMessage = new Message({
      roomId,
      sender: req.user._id,
      senderName: req.user.name,
      message,
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate('sender', 'name email');

    res.status(201).json({
      message: 'Message sent',
      data: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only delete your own messages' });
    }

    await message.deleteOne();

    res.status(200).json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete message', error: error.message });
  }
};
