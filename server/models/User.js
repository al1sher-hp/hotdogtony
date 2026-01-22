const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () {
      // Password required for employee, boss, super-admin
      return ['employee', 'boss', 'super-admin'].includes(this.role);
    }
  },
  role: {
    type: String,
    enum: ['customer', 'employee', 'boss', 'super-admin'],
    default: 'customer'
  },
  favoriteItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  magicLinkToken: String,
  magicLinkExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving (only for staff)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
