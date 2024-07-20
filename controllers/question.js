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

export const searchQuestions = async (req, res) => {
  try {
    const { search } = req.body;

    if (!search) {
      return res
        .status(400)
        .json({ message: "search is required", error: true });
    }

    if (search?.length < 3) {
      return res
        .status(400)
        .json({ message: "search atleast 3 letters", error: true });
    }

    typesenseClient
      .collections("questions")
      .documents()
      .search({ q: search, query_by: "question,embedding" })
      .then(
        (data) => {
          return res.status(200).json({ data, error: false });
        },
        (err) => {
          console.log("Search Error:", err);
          return res
            .status(400)
            .json({ message: "Search Failed", error: true });
        }
      );
  } catch (error) {
    console.error("Search Question Error:", error);
    res.status(500).json({ message: "Server error", error: true });
  }
};
