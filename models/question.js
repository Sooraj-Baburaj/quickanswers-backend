import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      index: true,
      unique: true,
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    answerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    },
  },
  { timestamps: true }
);

questionSchema.index({ question: 1 }, { unique: true });

const Question = mongoose.model("Question", questionSchema);

export default Question;
