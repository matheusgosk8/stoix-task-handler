import { ErrorPayload } from "@/models/server";
import type { NextApiResponse } from "next";


export function errorHandler(res: NextApiResponse, payload: ErrorPayload) {
  const { error, message, code } = payload;
  const statusCode = code || 500;

  return res.status(statusCode).json({
    error: error || "InternalError",
    message,
    code: statusCode,
  });
}
