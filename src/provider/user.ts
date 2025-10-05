import { db } from "@/config/db/database";
import { users } from "@/config/db/schema";
import { eq } from "drizzle-orm";

export const getUserByUsername = async (username: string) => {
  try {
    const user = await db
      .select({
        id: users.id,
        username: users.username,
        password: users.password
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return user[0] || null;

  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
