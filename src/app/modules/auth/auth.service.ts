import prisma from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { JwtHelper } from "../../helper/jwtHelper";
import { UserStatus } from "@prisma/client";
import config from "../../config";
import ApiError from "../../errors/ApiErrors";
import emailSender from "./emailSender";

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

const changedPassword = async (user: any, payload: any) => {
  const isExistUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const comparePassword = await bcrypt.compare(
    payload.oldPassword,
    isExistUser.password
  );

  if (!comparePassword) {
    throw new ApiError(404, "Old password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

  await prisma.user.update({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
    data: {
      password: hashedPassword,
      needsPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully",
  };
};

const forgotPassword = async (payload: any) => {
  const isExistUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const resetPasswordToken = JwtHelper.generateToken(
    { email: isExistUser.email },
    config.jwt.reset_password_secret as string,
    config.jwt.reset_password_expires_in as string
  );

  const resetPasswordLink =
    config.reset_password_link +
    `?email=${isExistUser.email}&token=${resetPasswordToken}`;

  await emailSender(
    isExistUser.email,
    `<div>
        <p>Dear Users,</p>
        <p>You password reset link 
            <a href=${resetPasswordLink}>
              <button>
                    Reset Password
              </button>
            </a> 
        </p>
    </div>`
  );
};

const resetPassword = async (token: string, payload: any) => {
  const decodedData = JwtHelper.verifyToken(
    token,
    config.jwt.reset_password_secret as string
  );

  const isUserExist = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  await prisma.user.update({
    where: {
      email: isUserExist.email,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password reset successfully",
  };
};

export const AuthService = {
  loginUser,
  refreshToken,
  changedPassword,
  forgotPassword,
  resetPassword,
};
