import Event from "../models/events.mjs";
import User from "../models/users.mjs";
import { transformEvent } from "./index.mjs";

export const getEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error("Event not found.");
    }
    return transformEvent(event);
  } catch (err) {
    throw err;
  }
};

export const getEvents = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    if (!events) {
      throw new Error("Events not found.");
    }
    return events.map(transformEvent);
  } catch (err) {
    throw err;
  }
};

export const getUser = async (userId) => {
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
