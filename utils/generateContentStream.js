import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_TOKEN);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateContentStream = (content) => {
  return model.generateContentStream({
    contents: [{ role: "user", parts: [{ text: content }] }],
  });
};

export default generateContentStream;
