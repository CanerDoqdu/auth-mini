import bcrypt from "bcrypt";

import {
  createUser,
  findUserById,
  findUserByUsername,
  type UserStoreEnv,
} from "../lib/userStore";

export interface IUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

type SignupInput = {
  username: string;
  email: string;
  password: string;
};

const User = {
  async signup(
    username: string,
    email: string,
    password: string,
    env?: UserStoreEnv,
  ): Promise<IUser> {
    const input: SignupInput = { username, email, password };
    return createUser(input, env);
  },

  async login(
    username: string,
    password: string,
    env?: UserStoreEnv,
  ): Promise<IUser> {
    const user = await findUserByUsername(username, env);

    if (!user) {
      throw new Error("Invalid username or password");
    }

    try {
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        throw new Error("Invalid username or password");
      }

      return user;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Invalid username or password"
      ) {
        throw error;
      }

      console.error("Password verification error:", error);
      throw error;
    }
  },

  async findById(userId: string, env?: UserStoreEnv): Promise<IUser | null> {
    return findUserById(userId, env);
  },
};

export default User;
