import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_TOKEN);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateBlog = async (req, res) => {
  const { content } = req.body;
  if (content) {
    try {
      const result = await model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: content }] }],
      });

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      let text = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        console.log(chunkText);
        res.write(chunkText ?? "");
        text += chunkText;
      }

      console.log(text);

      res.end();
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    res.status(404).json({ message: "Content cannot be empty" });
  }
};
