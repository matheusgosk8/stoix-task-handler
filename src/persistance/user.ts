// src/persistence/userRepository.ts
import { db } from "@/config/db/database";
import { users } from "@/config/db/schema";
import bcrypt from 'bcrypt'
import type { User, UserBody } from "@/models/server";

export const registerNewUser = async (data: UserBody) => {
  try {

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const result = await db.insert(users).values({
      username: data.username,
      password: hashedPassword,
    }).returning(); 
    return result[0];
  } catch (error) {
    console.error("Error on creating user!", error);
    return null;
  }
};
