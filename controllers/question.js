import { transformTypesenseResult } from "../helpers/tranformTypesenseResult.js";
import Question from "../models/question.js";
import typesenseClient from "../typesense/client.js";

export const putQuestion = async (req, res) => {
  const { id, question, description } = req.body;
  if (!question) {
    return res
      .status(400)
      .json({ message: "Question is required", error: true });
  }
  if (question.length < 5) {
    return res.status(400).json({
      message: "Question should have at least 5 letters",
      error: true,
    });
  }

  try {
    if (id) {
      // If id is provided, update the existing question
      const existingQuestion = await Question.findById(id);
      if (!existingQuestion) {
        return res
          .status(404)
          .json({ message: "Question not found", error: true });
      }

      existingQuestion.question = question;
      existingQuestion.description =
        description || existingQuestion.description;

      await existingQuestion.save();

      try {
        await typesenseClient
          .collections("questions")
          .documents(existingQuestion._id.toString())
          .update({
            question,
            description: description || existingQuestion.description,
            updatedAt: new Date().getTime(),
          });
      } catch (typesenseError) {
        console.error(
          "Failed to sync with Typesense",
          typesenseError,
          "QuestionId:",
          existingQuestion._id
        );
      }

      return res.status(200).json({
        data: existingQuestion,
        message: "Question updated successfully!",
        error: false,
      });
    } else {
      // If no id is provided, create a new question
      const newQuestion = new Question({
        question,
        askedBy: req.user.id,
        description,
      });

      await newQuestion.save();

      return res.status(200).json({
        data: newQuestion,
        message: "Question created successfully!",
        error: false,
      });
    }
  } catch (error) {
    console.error("Create/Update Question Error:", error);
    if (error.code === 11000) {
      // Handle duplicate key error (question in this case)
      const existingQuestion = await Question.findOne({ question });
      return res.status(409).json({
        data: existingQuestion,
        message: "Question already exists!",
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
      const questionResult = await typesenseClient
        .collections("questions")
        .documents()
        .search({
          q: search,
          query_by: "question,embedding",
          vector_query: "embedding:([], alpha: 0.5, distance_threshold:0.60)",
          sort_by: "_vector_distance:asc",
          page,
          per_page,
        });

      if (questionResult) {
        return res.status(200).json({
          data: transformTypesenseResult(questionResult),
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
