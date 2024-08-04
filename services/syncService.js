import mongoose from "mongoose";
import typesenseClient from "../typesense/client.js";

const getAnswerText = async (answerId) => {
  const answer = await mongoose.connection
    .collection("answers")
    .findOne({ _id: answerId });
  return answer ? answer.answer : "";
};

export const synchronizeInitialData = async () => {
  const questions = await mongoose.connection
    .collection("questions")
    .find()
    .toArray();
  for (const question of questions) {
    await typesenseClient
      .collections("questions")
      .documents()
      .upsert({
        id: question._id.toString(),
        question: question.question,
        description: question.description,
        answer: question.answerId ? await getAnswerText(question.answerId) : "",
      });
  }
};
