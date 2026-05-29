import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    activeSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Math', 'Science', 'Literature', 'History', 'Languages', 'Programming', 'Arts', 'General'],
      default: 'General',
    },
    maxMembers: {
      type: Number,
      default: 20,
      min: 2,
      max: 100,
    },
    password: {
      type: String,
      default: null, // null means no password
    },
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Room', roomSchema);
