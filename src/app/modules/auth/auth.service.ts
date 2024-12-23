import prisma from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { JwtHelper } from "../../helper/jwtHelper";
import { UserStatus } from "@prisma/client";
import config from "../../config";

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

  const accessToken = JwtHelper.generateToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string
  );

  const refreshToken = JwtHelper.generateToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret as string,
    config.jwt.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needsPasswordChange,
  };
};

const refreshToken = async (payload: any) => {
  let decodedData;
  try {
    decodedData = JwtHelper.verifyToken(
      payload,
      config.jwt.jwt_refresh_secret as string
    );
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

  const accessToken = JwtHelper.generateToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string
  );

  return accessToken;
};

export const AuthService = {
  loginUser,
  refreshToken,
};
