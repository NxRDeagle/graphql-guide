import { hashPassword } from "./password.mjs";
import Event from "../models/events.mjs";
import User from "../models/users.mjs";

const getEvents = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    if (!events) {
      throw new Error("Events not found.");
    }
    return events.map((event) => ({
      ...event._doc,
      _id: event.id,
      date: new Date(event._doc.date).toISOString(),
      creator: getUser(event.creator),
    }));
  } catch (err) {
    throw err;
  }
};

const getUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: getEvents(user._doc.createdEvents),
    };
  } catch (err) {
    throw err;
  }
};

export default {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => ({
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: getUser(event._doc.creator),
      }));
    } catch (err) {
      throw err;
    }
  },

  createEvent: async ({ eventInput }) => {
    const userId = "68ffcf9197a3a3ec4cf16ef8"; // todo
    const event = new Event({
      title: eventInput.title,
      description: eventInput.description,
      price: +eventInput.price,
      date: new Date(eventInput.date),
      creator: userId,
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(),
        creator: getUser(result._doc.creator),
      };
      const creator = await User.findById(userId);
      if (!creator) {
        throw new Error("User not found.");
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },

  createUser: async ({ userInput }) => {
    try {
      const existingUser = await User.findOne({ email: userInput.email });
      if (existingUser) {
        throw new Error("User exists already.");
      }
      const hashedPassword = hashPassword(userInput.password);
      const user = new User({
        email: userInput.email,
        password: hashedPassword,
      });
      const result = await user.save();
      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw err;
    }
  },
};
