import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { errorHandler } from "@/utils/errorHandler";

export const getUserIdFromHeader = (
  req: NextApiRequest,
  res: NextApiResponse
): string | null => {
  const authHeader = req.headers.authorization; 
  const token = authHeader?.split(" ")[1];

  if (!token) {
    errorHandler(res, { message: "Token não fornecido", code: 401 });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userid: string };
    return decoded.userid;
  } catch (err) {
    errorHandler(res, { message: "Token inválido", code: 401 });
    return null;
  }
};
