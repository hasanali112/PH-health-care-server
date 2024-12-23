import { Request } from "express";
import catchAysnc from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";

const loginUser = catchAysnc(async (req, res) => {
  const result = await AuthService.loginUser(req.body);

  const { refreshToken } = result;

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const refreshTokenCreate = catchAysnc(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Token created in successfully",
    data: {
      accessToken: result,
    },
  });
});

const changedPassword = catchAysnc(
  async (req: Request & { user?: any }, res) => {
    const user = req.user;
    const result = await AuthService.changedPassword(user, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  }
);

const forgetPassword = catchAysnc(
  async (req: Request & { user?: any }, res) => {
    const result = await AuthService.forgotPassword(req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "",
      data: result,
    });
  }
);

const resetUserPassword = catchAysnc(async (req: Request, res) => {
  const token = req.headers.authorization;

  const result = await AuthService.resetPassword(token as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password reset successfully",
    data: result,
  });
});

export const AuthController = {
  loginUser,
  refreshTokenCreate,
  changedPassword,
  forgetPassword,
  resetUserPassword,
};
