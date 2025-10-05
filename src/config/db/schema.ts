import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});


export const task = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    done: boolean("done").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  });