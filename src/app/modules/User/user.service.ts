import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../../shared/prisma";
import { fileUploader } from "../../helper/fileUploader";

const createAdmin = async (req: any) => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hasedPassword: string = await bcrypt.hash(req.body.password, 10);
  const userData = {
    email: req.body.admin.email,
    password: hasedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};

export const UserService = {
  createAdmin,
};
