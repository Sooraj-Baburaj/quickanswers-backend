import typesenseClient from "./client.js";

const questionSchema = {
  name: "questions",
  fields: [
    { name: "question", type: "string" },
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
