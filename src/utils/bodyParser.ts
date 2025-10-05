import type { NextApiRequest } from "next";
import { ZodType, ZodError } from "zod";

export async function validateBody<T>(
  schema: ZodType<T>,
  req: NextApiRequest
): Promise<{ data: T | null; errors: Record<string, string[]> | null }> {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const data = schema.parse(body);
    return { data, errors: null };
  } catch (err) {
    if (err instanceof ZodError) {
      const zodErr = err as ZodError<unknown>;
      const fieldErrors: Record<string, string[]> = {};

      zodErr.issues.forEach(issue => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "general";
        if (!fieldErrors[path]) fieldErrors[path] = [];
        fieldErrors[path].push(issue.message);
      });

      return { data: null, errors: fieldErrors };
    }

    return { data: null, errors: { general: ["Invalid JSON"] } };
  }
}
