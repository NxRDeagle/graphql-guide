import Event from "../models/events.mjs";
import Booking from "../models/booking.mjs";
import { transformBooking, transformEvent } from "../utils/index.mjs";

export const bookings = async (_args, request) => {
  if (!request.isAuth) {
    throw new Error("Not authenticated.");
  }
  try {
    const bookings = await Booking.find({ user: request.userId }).populate(
      "event"
    );
    return bookings.map(transformBooking);
  } catch (err) {
    throw err;
  }
};

export const bookEvent = async ({ eventId }, request) => {
  if (!request.isAuth) {
    throw new Error("Not authenticated.");
  }
  try {
    const event = await Event.findOne({ _id: eventId });
    if (!event) {
      throw new Error("Event not found.");
    }
    const booking = new Booking({
      user: request.userId,
      event,
    });
    const result = await booking.save();
    return transformBooking(result);
  } catch (err) {
    throw err;
  }
};

export const cancelBooking = async ({ bookingId }, request) => {
  if (!request.isAuth) {
    throw new Error("Not authenticated.");
  }
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
