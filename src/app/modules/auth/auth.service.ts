import prisma from "../../shared/prisma";
import bcrypt from "bcryptjs";
import generateToken from "../../helper/jwtHelper";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";

type TLoginUser = {
  email: string;
  password: string;
};

const loginUser = async (payload: TLoginUser) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const comparePassword = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!comparePassword) {
    throw new Error("Invalid email or password");
  }

  const jwtPayload = {
    email: userData.email,
    role: userData.role,
  };

  const accessToken = generateToken(jwtPayload, "accessSecret", "1h");

  const refreshToken = generateToken(jwtPayload, "refreshSecret", "7d");

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needsPasswordChange,
  };
};

const refreshToken = async (payload: any) => {
  let decodedData;
  try {
    decodedData = jwt.verify(payload, "refreshSecret") as JwtPayload;
  } catch (error) {
    throw new Error("You are not authorized");
  }

  const isUserExist = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const jwtPayload = {
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const accessToken = generateToken(jwtPayload, "accessSecret", "1h");

  return accessToken;
};

export const AuthService = {
  loginUser,
  refreshToken,
};
