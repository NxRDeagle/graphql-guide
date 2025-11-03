import { getUser, getEvent } from "./helpers.mjs";
import { dateToString } from "./date.mjs";

export const transformEvent = (event) => ({
  ...event._doc,
  _id: event.id,
  date: dateToString(event._doc.date),
  creator: getUser(event.creator),
});

export const transformBooking = (booking) => {
  const event = booking._doc.event;
  if (booking._doc.event && typeof booking._doc.event === "object") {
    return {
      ...booking._doc,
      _id: booking.id,
      user: getUser(booking._doc.user),
      event: event ? transformEvent(event) : getEvent(event),
      createdAt: dateToString(booking._doc.createdAt),
      updatedAt: dateToString(booking._doc.updatedAt),
    };
  }
};
