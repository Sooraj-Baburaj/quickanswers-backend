import generateContentStream from "../utils/generateContentStream.js";

export const generateBlog = async (req, res) => {
  const { content } = req.body;
  if (content) {
    try {
      const result = await generateContentStream(content);

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
