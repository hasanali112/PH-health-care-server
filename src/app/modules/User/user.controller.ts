import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAysnc from "../../shared/catchAsync";

const createAdmin = catchAysnc(async (req: Request, res: Response) => {
  const result = await UserService.createAdmin(req);
  res.status(201).json({
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

export const UserController = {
  createAdmin,
};
