import typesenseClient from "./client.js";

const answerSchema = {
  name: "answers",
  fields: [
    { name: "answer", type: "string" },
    { name: "validityPercentage", type: "int32" },
    {
      name: "embedding",
      type: "float[]",
      embed: {
        from: ["answer"],
        model_config: {
          model_name: "ts/all-MiniLM-L12-v2",
        },
      },
    },
  ],
  default_sorting_field: "validityPercentage",
};

typesenseClient
  .collections()
  .create(answerSchema)
  .then(
    (data) => {},
    (err) => {}
  );
