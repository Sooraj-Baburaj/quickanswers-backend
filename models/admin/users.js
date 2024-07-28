import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema({
  profilePhoto: {
    type: String,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const AdminUser = mongoose.model("AdminUser", adminUserSchema);

export default AdminUser;
