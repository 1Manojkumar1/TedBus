import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    googleId: { type: String },
    age: { type: Number },
    gender: { type: String },
    dateOfBirth: { type: String },
    phoneNumber: { type: String },
    profilePicture: { type: String },
  },
  { timestamps: true }
);

export const Customer = mongoose.model('Customers', customerSchema);
