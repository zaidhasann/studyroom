import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    startedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: Date,
        leftAt: Date,
      },
    ],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0, // in minutes
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    pausedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Session', sessionSchema);
