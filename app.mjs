import express from "express";
import bodyParser from "body-parser";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import "dotenv/config";

const app = express();

const events = [];

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
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      events: () => events,
      createEvent: ({ eventInput }) => {
        const event = {
          _id: Math.random().toString(), // should be generated in DB
          title: eventInput.title,
          description: eventInput.description,
          price: +eventInput.price,
          date: eventInput.date,
        };
        events.push(event);
        return event;
      },
    },
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
