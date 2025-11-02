import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../utils/password.mjs";
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

export const login = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User does not exist.");
    }
    const isEqualPasswords = comparePassword(password, user.password);
    if (!isEqualPasswords) {
      throw new Error("Password is incorrect.");
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    return {
      userId: user.id,
      token,
      tokenExpiration: 1,
    };
  } catch (err) {
    throw err;
  }
};
