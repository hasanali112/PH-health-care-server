import { UserService } from "./user.service";
import catchAysnc from "../../shared/catchAsync";

//create admin
const createAdmin = catchAysnc(async (req, res) => {
  const result = await UserService.createAdmin(req);
  res.status(201).json({
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

//create doctor
const createDoctor = catchAysnc(async (req, res) => {});

export const UserController = {
  createAdmin,
  createDoctor,
};
