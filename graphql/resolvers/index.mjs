import { createUser, login } from "./auth.mjs";
import { bookEvent, bookings, cancelBooking } from "./bookings.mjs";
import { createEvent, events } from "./events.mjs";

export default {
  events,
  bookings,
  createEvent,
  createUser,
  bookEvent,
  cancelBooking,
  login,
};
