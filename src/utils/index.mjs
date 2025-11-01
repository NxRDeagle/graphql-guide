import { getUser, getEvent } from "./helpers.mjs";
import { dateToString } from "./date.mjs";

export const transformEvent = (event) => ({
  ...event._doc,
  _id: event.id,
  date: dateToString(event._doc.date),
  creator: getUser(event.creator),
});

export const transformBooking = (booking) => ({
  ...booking._doc,
  _id: booking.id,
  user: getUser(booking._doc.user),
  event: getEvent(booking._doc.event),
  createdAt: dateToString(booking._doc.createdAt),
  updatedAt: dateToString(booking._doc.updatedAt),
});
