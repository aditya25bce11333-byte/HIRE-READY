const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // never return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  targetRole: {
    type: String,
    enum: ['SDE', 'Data Scientist', 'DevOps', 'PM'],
    default: 'SDE',
  },
  avatar: { type: String, default: '' },
  resumeText: { type: String, default: '' }, // extracted resume text
  streak: { type: Number, default: 0 },
  lastSessionDate: { type: Date },
  totalSessions: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  settings: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    pressureMode: { type: Boolean, default: false },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    notifications: { type: Boolean, default: true },
  },
  isEmailVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Update streak on session
userSchema.methods.updateStreak = function() {
  const now = new Date();
  const last = this.lastSessionDate;
  if (!last) {
    this.streak = 1;
  } else {
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) this.streak += 1;
    else if (diffDays > 1) this.streak = 1;
  }
  this.lastSessionDate = now;
};

// Compare password
userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Account lockout
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Sanitize output
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
