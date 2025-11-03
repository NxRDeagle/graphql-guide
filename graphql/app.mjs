import express from "express";
import bodyParser from "body-parser";
import { graphqlHTTP } from "express-graphql";
import mongoose from "mongoose";
import schema from "./schema/index.mjs";
import rootValue from "./resolvers/index.mjs";
import { isAuthMiddleware } from "./middlewares/isAuth.mjs";
import { corsMiddleware } from "./middlewares/cors.mjs";
import "dotenv/config";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(corsMiddleware);

app.use(isAuthMiddleware);

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
  })
);

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected to db"))
  .catch((err) => console.log(`Error: ${err}`));

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
