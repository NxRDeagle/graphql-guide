import express from "express";
import bodyParser from "body-parser";
import { graphqlHTTP } from "express-graphql";
import mongoose from "mongoose";
import schema from "./schema/index.mjs";
import rootValue from "./resolvers/index.mjs";
import { isAuthMiddleware } from "./middlewares/isAuth.mjs";
import "dotenv/config";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  if (request.method === "OPTIONS") {
    return response.sendStatus(200);
  }
  next();
});

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
