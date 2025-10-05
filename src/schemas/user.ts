import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "Username precisa ter ao menos 3 caracteres"),
  password: z.string().min(6, "Senha precisa ter ao menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Senha precisa ter ao menos 6 caracteres"),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username não informado"),
  password: z.string().min(6, "Senha não informada"),
});
