import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_TOKEN,
});

export const generateBlog = async (req, res) => {
  const { content } = req.body;
  if (content) {
    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You only give response in html. You are generating blogs. Every response should be in html.",
          },
          { role: "user", content },
        ],
        stream: true,
      });

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      let finalStreamContent = "";

      for await (const part of stream) {
        res.write(part.choices[0]?.delta?.content ?? "");
        finalStreamContent += part.choices[0]?.delta?.content ?? "";
      }

      console.log(finalStreamContent);

      res.end();
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    res.status(404).json({ message: "Content cannot be empty" });
  }
};
