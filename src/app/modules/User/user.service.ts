import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../../shared/prisma";

const createAdmin = async (payload: any) => {
  const hasedPassword: string = await bcrypt.hash(payload.password, 10);
  const userData = {
    email: payload.admin.email,
    password: hasedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: payload.admin,
    });

    return createdAdminData;
  });

  return result;
};

export const UserService = {
  createAdmin,
};
