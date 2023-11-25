import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_TOKEN,
});

export async function getRespose() {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "Write me a blog about Diet and gym" },
    ],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0], "////", completion);
}
