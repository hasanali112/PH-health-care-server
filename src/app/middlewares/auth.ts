import { NextFunction, Request, Response } from "express";
import { JwtHelper } from "../helper/jwtHelper";
import config from "../config";
import ApiError from "../errors/ApiErrors";

const auth = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(404, "You are not authorized ");
      }
      const verifyUser = JwtHelper.verifyToken(
        token,
        config.jwt.jwt_access_secret as string
      );
      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new ApiError(404, "You are not authorized ");
      }

      req.user = verifyUser;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
