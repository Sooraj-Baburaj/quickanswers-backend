import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_TOKEN,
});

const getRespose = async (content) => {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "you generate blogs, the responses should be in html with the content inside appropriate html tags",
      },
      { role: "user", content },
    ],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0];
};

export const generateBlog = async (req, res) => {
  const { content } = req.body;
  console.log(content, ":content");
  if (content) {
    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "you generate blogs, the responses should be in html with the content inside appropriate html tags",
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

      for await (const part of stream) {
        res.write(`${part.choices[0]?.delta?.content}`);
      }

      res.end();
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    res.status(404).json({ message: "Content cannot be empty" });
  }
};
