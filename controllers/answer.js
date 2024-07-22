import Answer from "../models/answer.js";
import Question from "../models/question.js";
import typesenseClient from "../typesense/client.js";
import generateContentStream from "../utils/generateContentStream.js";

/******** GET ANSWER ***********/
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

    const answer = await Answer.findOne({ questionId })
      .sort({
        validityPercentage: -1,
      })
      .lean();

    if (!answer) {
      return res.status(404).json({ message: "No answer found", error: false });
    }

    if (!answer.viewedBy.includes(userId)) {
      await Answer.updateOne(
        { _id: answer._id },
        {
          $inc: { viewCount: 1 },
          $push: { viewedBy: userId },
        }
      );
      answer.viewCount += 1;
      answer.viewedBy.push(userId);
    }

    answer.upvotes = answer.upvotes.length;
    answer.downvotes = answer.downvotes.length;

    return res.status(200).json({
      data: answer,
      message: "Answer retrieved successfully",
      error: false,
    });
  } catch (error) {
    console.error("Get Answer Error:", error);
    res.status(500).json({ message: "Server error", error: true });
  }
};

/******** GENERATE ANSWER ***********/
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

/****** RELATED ANSWERS ******/
export const listOtherAnswers = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);

    if (!question) {
      return res
        .status(400)
        .json({ message: "Question doesn't exist!", error: true });
    }

    const answers = await Answer.find({
      questionId,
      _id: { $ne: question.answerId },
    });

    res.status(200).json({
      data: answers,
      error: false,
      message: "Answers listed succesfully",
    });
  } catch (error) {
    console.error("Related Answer Error:", error);
    res.status(500).json({ message: "Server error", error: true });
  }
};
