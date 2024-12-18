import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import pick from "../../shared/pick";
import { adminFilterableFields } from "./admin.constant";

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    //for pick function ==>> jegulo match korbe sudhu seiguloi dibe nahole dibe na
    const filter = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await AdminService.getAdminFromDB(filter, options);
    res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.name || "Failed to fetch admins",
      error: error,
    });
  }
};

const getAdminById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await AdminService.getByIdFromDB(id);
    res.status(200).json({
      success: true,
      message: "Admins fetched by id",

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

const updateAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await AdminService.updateAdminIntoDB(id, req.body);
    res.status(200).json({
      success: true,
      message: "Admin data updated successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.name || "Failed to update admin",
      error: error,
    });
  }
};

const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await AdminService.deleteAdminFromDB(id);
    res.status(200).json({
      success: true,
      message: "Admin data deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.name || "Failed to delete admin",
      error: error,
    });
  }
};

export const AdminController = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};
