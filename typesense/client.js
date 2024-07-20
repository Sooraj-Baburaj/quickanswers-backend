import TypeSense from "typesense";
import dotenv from "dotenv";

dotenv.config();

const typesenseClient = new TypeSense.Client({
  nodes: [
    {
      host: process.env.TYPESENSE_HOST,
      port: process.env.TYPESENSE_PORT,
      protocol: process.env.TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 5,
});

export default typesenseClient;
