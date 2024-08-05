import { transformTypesenseResult } from "../helpers/tranformTypesenseResult.js";
import Answer from "../models/answer.js";
import Question from "../models/question.js";
import typesenseClient from "../typesense/client.js";
import generateContentStream from "../utils/generateContentStream.js";

/******** GET ANSWER ***********/
export const getAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await Question.findById(questionId);

    const user = req.user;

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

    if (!user?.isGuest) {
      if (!question.viewedBy.includes(user.id)) {
        await Question.updateOne(
          { _id: answer._id },
          {
            $inc: { viewCount: 1 },
            $push: { viewedBy: user.id },
          }
        );
        question.viewCount += 1;
        question.viewedBy.push(user.id);
      }
    } else {
      if (!question.viewedByGuests.includes(user.id)) {
        await Question.updateOne(
          { _id: answer._id },
          {
            $inc: { viewCount: 1 },
            $push: { viewedByGuests: user.id },
          }
        );
        question.viewCount += 1;
        question.viewedByGuests.push(user.id);
      }
    }

    try {
      await typesenseClient
        .collections("questions")
        .documents(question._id.toString())
        .update({
          viewCount: question.viewCount,
        });
    } catch (typesenseError) {
      console.error(
        "Failed to sync with Typesense",
        typesenseError,
        "QuestionId:",
        existingQuestion._id
      );
    }

    question.upvotes = question.upvotes.length;
    question.downvotes = question.downvotes.length;

    return res.status(200).json({
      data: { question, answer },
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

    if (!question.answerId) {
      question.answerId = newAnswer._id;
      await question.save();
    }

    try {
      await typesenseClient.collections("questions").documents().create({
        id: question._id.toString(),
        question: question.question,
        description: question.description,
        createdAt: question.createdAt.getTime(),
        answer,
      });
    } catch (typesenseError) {
      console.error(
        "Failed to sync with Typesense",
        typesenseError,
        "QuestionId:",
        question._id
      );
    }

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

/******** SEARCH ANSWER *******/
export const searchAnswer = async (req, res) => {
  try {
    const { search, page = 1, per_page = 10 } = req.body;

    if (!search) {
      return res
        .status(400)
        .json({ message: "search is required", error: true });
    }

    if (search.length < 3) {
      return res
        .status(400)
        .json({ message: "search at least 3 letters", error: true });
    }

    try {
      const answerResult = await typesenseClient
        .collections("answers")
        .documents()
        .search({
          q: search,
          query_by: "answer,embedding",
          vector_query: "embedding:([], alpha: 0.5, distance_threshold:0.60)",
          sort_by: "_vector_distance:asc",
          page,
          per_page,
        });

      if (answerResult) {
        return res.status(200).json({
          data: transformTypesenseResult(answerResult),
          error: false,
        });
      }

      return res.status(400).json({ message: "Search Failed", error: true });
    } catch (err) {
      console.log("Search Error:", err);
      return res.status(500).json({ message: "Server error", error: true });
    }
  } catch (error) {
    console.error("Search Question Error:", error);
    return res.status(500).json({ message: "Server error", error: true });
  }
};
