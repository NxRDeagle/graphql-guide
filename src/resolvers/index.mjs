import { hashPassword } from "../utils/password.mjs";
import Event from "../models/events.mjs";
import User from "../models/users.mjs";
import Booking from "../models/booking.mjs";
import {
  mockUserId,
  transformBooking,
  transformEvent,
} from "../utils/index.mjs";

export default {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(transformEvent);
    } catch (err) {
      throw err;
    }
  },

  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(transformBooking);
    } catch (err) {
      throw err;
    }
  },

  createEvent: async ({ eventInput }) => {
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

  bookEvent: async ({ eventId }) => {
    try {
      const event = await Event.findOne({ _id: eventId });
      if (!event) {
        throw new Error("Event not found.");
      }
      const booking = new Booking({
        user: mockUserId,
        event,
      });
      const result = await booking.save();
      return transformBooking(result);
    } catch (err) {
      throw err;
    }
  },

  cancelBooking: async ({ bookingId }) => {
    try {
      const booking = await Booking.findById(bookingId).populate("event");
      if (!booking) {
        throw new Error("Booking not found.");
      }
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  },
};
