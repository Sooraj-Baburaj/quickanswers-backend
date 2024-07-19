import Answer from "../models/answer.js";
import Question from "../models/question.js";
import generateContentStream from "../utils/generateContentStream.js";

export const createQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res
        .status(400)
        .json({ message: "Question is required", error: true });
    } else if (question.length < 10) {
      return res.status(400).json({
        message: "Question should have at least 10 letters",
        error: true,
      });
    }

    const newQuestion = new Question({
      question,
      askedBy: req.user.id,
    });

    const result = await generateContentStream(question);

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

    const newAnswer = new Answer({
      answer,
      questionId: newQuestion._id,
    });

    await newQuestion.save();
    await newAnswer.save();

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: true });
  }
};
