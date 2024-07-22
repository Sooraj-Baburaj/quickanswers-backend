import { transformTypesenseResult } from "../helpers/tranformTypesenseResult.js";
import Question from "../models/question.js";
import typesenseClient from "../typesense/client.js";

export const createQuestion = async (req, res) => {
  const question = req.body?.question;
  if (!question) {
    return res
      .status(400)
      .json({ message: "Question is required", error: true });
  }
  if (question.length < 10) {
    return res.status(400).json({
      message: "Question should have at least 10 letters",
      error: true,
    });
  }

  try {
    const newQuestion = new Question({
      question,
      askedBy: req.user.id,
    });

    await newQuestion.save();

    try {
      await typesenseClient.collections("questions").documents().create({
        id: newQuestion._id.toString(),
        question,
      });
    } catch (typesenseError) {
      console.error(
        "Failed to sync with Typesense",
        typesenseError,
        "QuestionId:",
        newQuestion._id
      );
    }

    res.status(200).json({
      data: newQuestion,
      message: "Question created successfully!",
      error: false,
    });
  } catch (error) {
    console.error("Create Question Error:", error);
    if (error.code === 11000) {
      // Handle duplicate key error
      const existingQuestion = await Question.findOne({ question });
      return res.status(200).json({
        data: existingQuestion,
        message: "Question fetched successfully!",
        error: false,
      });
    }
    res.status(500).json({ message: "Server error", error: true });
  }
};

/******** SEARCH QUESTION *******/
export const searchQuestions = async (req, res) => {
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
      const [questionResult, answerResult] = await Promise.all([
        typesenseClient.collections("questions").documents().search({
          q: search,
          query_by: "question,embedding",
          vector_query: "embedding:([], alpha: 0.5, distance_threshold:0.60)",
          sort_by: "_vector_distance:asc",
          page,
          per_page,
        }),
        typesenseClient.collections("answers").documents().search({
          q: search,
          query_by: "answer,embedding",
          vector_query: "embedding:([], alpha: 0.5, distance_threshold:0.60)",
          sort_by: "_vector_distance:asc",
          page,
          per_page,
        }),
      ]);

      if (questionResult || answerResult) {
        return res.status(200).json({
          data: {
            questions: transformTypesenseResult(questionResult),
            answers: transformTypesenseResult(answerResult),
          },
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
