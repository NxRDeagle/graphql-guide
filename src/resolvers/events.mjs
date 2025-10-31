import Event from "../models/events.mjs";
import User from "../models/users.mjs";
import { mockUserId, transformEvent } from "../utils/index.mjs";

export const events = async () => {
  try {
    const events = await Event.find();
    return events.map(transformEvent);
  } catch (err) {
    throw err;
  }
};

export const createEvent = async ({ eventInput }) => {
  const event = new Event({
    title: eventInput.title,
    description: eventInput.description,
    price: +eventInput.price,
    date: new Date(eventInput.date),
    creator: mockUserId,
  });
  let createdEvent;
  try {
    const result = await event.save();
    createdEvent = transformEvent(result);
    const creator = await User.findById(mockUserId);
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
};
