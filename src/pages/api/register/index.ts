import { ErrorPayload, RegisterResponse, User, UserBody } from '@/models/server';
import { registerNewUser } from '@/persistance/user';
import { getUserByUsername } from '@/provider/user';
import { registerSchema } from '@/schemas/user';
import { validateBody } from '@/utils/bodyParser';
import { errorHandler } from '@/utils/errorHandler';
import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { data, errors } = await validateBody(registerSchema, req);
  
  if (errors) {
    const errorMessages = Object.values(errors).flat().join(', ');
    const errorData: ErrorPayload = {
      message: errorMessages,
      code: 400,
      error: "Invalid body schema"
    };
    return errorHandler(res, errorData);
  }

  const checkUser = await getUserByUsername(data?.username as string);

  if(checkUser){
    const errorData: ErrorPayload = {
      message: 'Este nome de usuário já esta em uso, por favor informe outro username',
      code: 400,
      error: "Invalid user name"
    };
    return errorHandler(res, errorData);
  }


  const userInserted = await registerNewUser(data as UserBody);

  if(!userInserted || userInserted === null){
    const errorData: ErrorPayload = {
      message: "Erro ao registrar novo usuário",
      code: 500,
      error: "Error inserting new user"
    };
    return errorHandler(res, errorData);
  }

  res.status(200).json({ message: 'Cadastro realizado com sucesso!', token: 'token'});
}
