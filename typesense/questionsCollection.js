import typesenseClient from "./client.js";

const questionSchema = {
  name: "questions",
  fields: [
    { name: "question", type: "string" },
    { name: "description", type: "string" },
    { name: "answer", type: "string" },
    { name: "viewCount", type: "int32" },
    {
      name: "createdAt",
      type: "int32",
    },
    {
      name: "embedding",
      type: "float[]",
      embed: {
        from: ["question"],
        model_config: {
          model_name: "ts/all-MiniLM-L12-v2",
        },
      },
    },
  ],
};

typesenseClient
  .collections()
  .create(questionSchema)
  .then(
    (data) => {},
    (err) => {}
  );
