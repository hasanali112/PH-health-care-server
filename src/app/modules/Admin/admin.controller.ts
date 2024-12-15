import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import pick from "../../shared/pick";

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    //for pick function ==>> jegulo match korbe sudhu seiguloi dibe nahole dibe na
    const filter = pick(req.query, [
      "name",
      "email",
      "searchTerm",
      "contactNumber",
    ]);
    const result = await AdminService.getAdminFromDB(filter);
    res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.name || "Failed to fetch admins",
      error: error,
    });
  }
};

export const AdminController = {
  getAllAdmins,
};
