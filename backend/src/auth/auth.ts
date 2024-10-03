import jwt, { decode } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../models/User";
import { ObjectId } from "mongodb";
import { expressjwt } from "express-jwt";
import { collections } from "../services/database.service";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const authenticateJWT = expressjwt({
  secret: JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth",
});

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const existingUser = await collections.users?.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const hashedPassword = await hashPassword(password);

    const result = await collections.users?.insertOne({
      username,
      passwordHash: hashedPassword,
    });
    const newUser = await collections.users?.findOne({
      _id: result?.insertedId,
    });

    const token = generateToken(String(newUser?._id));
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user", message: error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await collections.users?.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    res.json({ token, refreshToken });
  } catch (error) {
    res.status(500).json({ error: "Failed to log in", message: error });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      jwt.verify(refreshToken, JWT_SECRET, (err: any, decoded: any) => {
        if (err || !decoded.userId) {
          return res.status(403).json({ error: "Invalid refresh token" });
        }

        const userId = decoded.userId;

        const newAccessToken = generateToken(userId);
        res.json({ token: newAccessToken });
      });
    } else {
      res.status(401).json({ error: "Refresh token required" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await collections.users?.find({}).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", message: error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await collections.users?.findOne({ _id: new ObjectId(id) });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user", message: error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const result = await collections.users?.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { username } },
      { returnDocument: "after" }
    );
    if (result!.value) {
      res.json(result!.value);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update user", message: error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await collections.users?.deleteOne({
      _id: new ObjectId(id),
    });
    if (result && result.deletedCount > 0) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user", message: error });
  }
};
