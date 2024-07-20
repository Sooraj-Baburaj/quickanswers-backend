import Answer from "../models/answer.js";
import Question from "../models/question.js";
import typesenseClient from "../typesense/client.js";
import generateContentStream from "../utils/generateContentStream.js";

export const getAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    const userId = req.user.id;

    if (!question) {
      return res
        .status(400)
        .json({ message: "Question not found", error: true });
    }

    const userAnswer = await Answer.findOne({
      questionId,
      askedBy: userId,
    }).lean();

    if (userAnswer) {
      userAnswer.upvotes = userAnswer.upvotes.length;
      userAnswer.downvotes = userAnswer.downvotes.length;
      return res.status(200).json({
        data: userAnswer,
        message: "Answer retrieved successfully",
        error: false,
      });
    }

    const topAnswer = await Answer.findOne({ questionId })
      .sort({
        validityPercentage: -1,
      })
      .lean();

    if (topAnswer) {
      topAnswer.upvotes = topAnswer.upvotes.length;
      topAnswer.downvotes = topAnswer.downvotes.length;
      return res.status(200).json({
        data: topAnswer,
        message: "Answer retrieved successfully",
        error: false,
      });
    }

    res.status(404).json({ message: "No answer found", error: false });
  } catch (error) {
    console.error("Generate Answer Error:", error);
    res.status(500).json({ message: "Server error", error: true });
  }
};

export const generateAnswer = async (req, res) => {
  try {
    const { questionId } = req.body;
    const question = await Question.findById(questionId);

    if (!question) {
      return res
        .status(404)
        .json({ message: "Question not found", error: true });
    }

    const result = await generateContentStream(question.question);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    let answer = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText ?? "");
      answer += chunkText;
    }
    // res.write("event: end\ndata: end\n\n");
    res.end();

    const newAnswer = new Answer({
      answer,
      questionId,
    });

    await newAnswer.save();

    try {
      await typesenseClient.collections("answers").documents().create({
        id: newAnswer._id.toString(),
        answer,
        validityPercentage: newAnswer.validityPercentage,
      });
    } catch (typesenseError) {
      console.error(
        "Failed to sync with Typesense",
        typesenseError,
        "AnswerId:",
        newAnswer._id
      );
    }
  } catch (error) {
    console.error("Generate Answer Error:", error);
    res.status(500).json({ message: "Server error", error: true });
  }
};
