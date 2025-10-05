import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { errorHandler } from "@/utils/errorHandler";

interface JwtPayload {
  userid: string;
  iat: number;
  exp: number;
}

/**
 * Middleware para validar token JWT e extrair userId
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @returns userId ou null se inválido/expirado
 */
export const authMiddleware = (req: NextApiRequest, res: NextApiResponse): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    errorHandler(res, { message: "Token não fornecido", code: 401 });
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    errorHandler(res, { message: "Formato do token inválido", code: 401 });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      errorHandler(res, { message: "Sessão expirada", code: 401 });
      return null;
    }

    return decoded.userid;
  } catch (err) {
    errorHandler(res, { message: "Usuário sem permissão", code: 401 });
    return null;
  }
};
