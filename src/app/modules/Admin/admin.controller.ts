import { NextFunction, Request, Response } from "express";
import { AdminService } from "./admin.service";
import pick from "../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import sendResponse from "../../shared/sendResponse";

const getAllAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //for pick function ==>> jegulo match korbe sudhu seiguloi dibe nahole dibe na
    const filter = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await AdminService.getAdminFromDB(filter, options);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admins fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await AdminService.getByIdFromDB(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await AdminService.updateAdminIntoDB(id, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin data updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await AdminService.deleteAdminFromDB(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin data deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const SoftDeleteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await AdminService.softDeleteFromDB(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Admin data deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const AdminController = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  SoftDeleteAdmin,
};
