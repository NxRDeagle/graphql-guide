import express from "express";
import bodyParser from "body-parser";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import mongoose from "mongoose";
import Event from "./models/events.mjs";
import User from "./models/users.mjs";
import { hashPassword } from "./utils/index.mjs";
import "dotenv/config";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
      creator: String
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type User {
      _id: ID!
      email: String!
      password: String
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      events: () =>
        Event.find()
          .then((events) => {
            return events.map((event) => ({
              ...event._doc,
              _id: event._doc._id.toString(),
            }));
          })
          .catch((error) => {
            console.log(error);
            throw error;
          }),

      createEvent: async ({ eventInput }) => {
        const event = new Event({
          title: eventInput.title,
          description: eventInput.description,
          price: +eventInput.price,
          date: new Date(eventInput.date),
          creator: "68ffcf7d94080da6015c88eb", // todo
        });
        let createdEvent;
        return await event
          .save()
          .then((result) => {
            createdEvent = { ...result._doc, _id: result._doc._id.toString() };
            return User.findById("68ffcf7d94080da6015c88eb");
          })
          .then((user) => {
            if (!user) {
              throw new Error("User not found.");
            }
            user.createdEvents.push(event);
            return user.save();
          })
          .then((_result) => {
            return createdEvent;
          })
          .catch((error) => {
            console.log(error);
            throw error;
          });
      },

      createUser: async ({ userInput }) => {
        return await User.findOne({ email: userInput.email })
          .then((user) => {
            if (user) {
              throw new Error("User already exists.");
            }
            return hashPassword(userInput.password);
          })
          .then((hashedPassword) => {
            const user = new User({
              email: userInput.email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => ({
            ...result._doc,
            _id: result._doc._id.toString(),
            password: null,
          }))
          .catch((error) => {
            console.log(error);
            throw error;
          });
      },
    },

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
