import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      index: true,
      unique: true,
    },
    description: {
      type: String,
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
    viewCount: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    viewedByGuests: [{ type: [String] }],
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
