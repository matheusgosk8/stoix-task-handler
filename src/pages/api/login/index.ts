import { ErrorPayload, LogInApiResponse } from '@/models/server'
import { getUserByUsername } from '@/provider/user'
import { loginSchema } from '@/schemas/user'
import { validateBody } from '@/utils/bodyParser'
import { errorHandler } from '@/utils/errorHandler'
import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import { generateToken } from '@/utils/createUserToken'



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogInApiResponse>
) {

  if (req.method === 'POST') {

    const { data, errors } = await validateBody(loginSchema, req);

    if (errors) {
      const errorMessages = Object.values(errors).flat().join(', ');
      const errorData: ErrorPayload = {
        message: errorMessages,
        code: 400,
        error: "Invalid body schema"
      };
      return errorHandler(res, errorData);
    }

    //Aqui casteei porque o username já é verificado acima
    const user = await getUserByUsername(data?.username as string);

    if (!user || user === null) {
      const errorData: ErrorPayload = {
        message: 'Usuário não encontrado',
        code: 403,
        error: "User not found"
      };
      return errorHandler(res, errorData);
    }

    const checkPassword = await bcrypt.compare(data?.password as string, user?.password);

    if (!checkPassword) {
      const errorData: ErrorPayload = {
        message: 'Senha inválida',
        code: 403,
        error: "Password not match"
      };
      return errorHandler(res, errorData);
    }

    const tokenPayload = {
      userid: user.id
    }

    const token = generateToken(tokenPayload);
    const responseData : LogInApiResponse= {
      message: 'Login realizado com sucesso',
      user:{
        id: user.id,
        username: user.username,
        token
      }
    }
    res.status(200).json(responseData);

  }

}