import crypto from "crypto";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import User from "../models/users.js";

export const createUser = async (req, res) => {
  try {
    if (!req.body.email) {
      res.status(400).json({ message: "Email is required", error: true });
    } else if (!req.body.password) {
      res.status(400).json({ message: "Password is required", error: true });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        email: req.body.email,
        password: hashedPassword,
      });
      await user.save();
      res.status(200).json({ message: "success", user, error: false });
    }
  } catch (error) {
    if (error?.code === 11000) {
      res.status(400).json({ message: "Email already exists!", error: true });
    } else {
      res.status(500).json({ error });
    }
  }
};

export const userAuth = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        const token = jwt.sign({ email: user.email }, process.env.SECRET);
        res.status(200).json({
          user_access_token: token,
          message: "token created succesfully",
        });
      } else {
        res.status(400).json({ message: "Invalid credentials", error: true });
      }
    } else {
      res.status(400).json({ message: "User doesn't exist", error: true });
    }
  } catch (error) {
    res.status(500).json({ error, message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found", error: true });
    }

    const token = crypto.randomBytes(20).toString("hex");
    const resetToken = jwt.sign({ token, email }, process.env.SECRET, {
      expiresIn: "1h",
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    console.log(
      process.env.NODEMAILER_EMAIL,
      process.env.NODEMAILER_EMAIL_PASSWORD,
      "email, pass"
    );
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.NODEMAILER_EMAIL,
      subject: "Reset Password",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n
        ${process.env.FRONTEND_DOMAIN}/reset/${resetToken}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ message: "Reset link sent successfully", error: false });
  } catch (error) {
    console.log(error, ":err");
    res.status(500).json({ error, message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Invalid or expired token", error: true });
      }

      const user = await User.findOne({
        email: decoded.email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired token", error: true });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res
        .status(200)
        .json({ message: "Password reset successfully", error: false });
    });
  } catch (error) {
    res.status(500).json({ error, message: "Internal server error" });
  }
};

/**************Dashboard************/

export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}, "email");
    res.status(200).json({ users, status: "success" });
  } catch (error) {
    res.status(500).json({ error, message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (user) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(400).json({ message: "User not found", error: true });
    }
  } catch (error) {
    res.status(500).json({ error, message: "Internal server error" });
  }
};
