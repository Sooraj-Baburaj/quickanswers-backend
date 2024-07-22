import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    answer: {
      type: String,
      index: true,
      required: true,
    },
    validityPercentage: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    downvotes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    verifiedByQuickAnswers: {
      type: Boolean,
      default: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    viewCount: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Answer = mongoose.model("Answer", answerSchema);

export default Answer;
