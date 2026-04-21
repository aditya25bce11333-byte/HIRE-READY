const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  fillerWords: [String],
  sentiment: String,
});

const evaluationSchema = new mongoose.Schema({
  technicalAccuracy: { type: Number, min: 0, max: 100 },
  communication: { type: Number, min: 0, max: 100 },
  confidence: { type: Number, min: 0, max: 100 },
  overallScore: { type: Number, min: 0, max: 100 },
  fitScore: { type: Number, min: 0, max: 10 },
  answerQuality: { type: Number, min: 0, max: 100 },
  strengths: [String],
  weaknesses: [String],
  fillerWordCount: { type: Number, default: 0 },
  detectedFillerWords: [String],
  improvementRoadmap: [String],
  feedback: String,
  trend: String,
  completedAt: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  pressureMode: { type: Boolean, default: false },
  rounds: [{ type: String }], // e.g. ['Technical', 'HR']
  messages: [messageSchema],
  codeSubmissions: [{
    language: String,
    code: String,
    question: String,
    aiReview: String,
    submittedAt: { type: Date, default: Date.now },
  }],
  evaluation: evaluationSchema,
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' },
  duration: { type: Number, default: 0 }, // seconds
  antiCheat: {
    tabSwitches: { type: Number, default: 0 },
    pasteAttempts: { type: Number, default: 0 },
    flagged: { type: Boolean, default: false },
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
