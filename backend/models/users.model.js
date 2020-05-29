import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  devPreferences: {
    type: String,
    required: false,
    default: null
  }
});

const Users = mongoose.model('Users', UserSchema);

export default Users;