import Event from "../models/events.mjs";
import Booking from "../models/booking.mjs";
import {
  mockUserId,
  transformBooking,
  transformEvent,
} from "../utils/index.mjs";

export const bookings = async () => {
  try {
    const bookings = await Booking.find().populate("user").populate("event");
    return bookings.map(transformBooking);
  } catch (err) {
    throw err;
  }
};

export const bookEvent = async ({ eventId }) => {
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
};

export const cancelBooking = async ({ bookingId }) => {
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
};
