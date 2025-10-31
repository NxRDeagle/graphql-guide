import { hashPassword } from "../utils/password.mjs";
import User from "../models/users.mjs";

export const createUser = async ({ userInput }) => {
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
};
