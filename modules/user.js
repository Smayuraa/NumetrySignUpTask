const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String }, // Field to store file path or URL
});

const User = mongoose.model('User', userSchema);

module.exports = User;
