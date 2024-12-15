import { Request, Response } from "express";
import { AdminService } from "./admin.service";

const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
) => {
  const result: Partial<T> = {};

  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }

  return result;
};

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const filter = pick(req.query, ["name", "email", "searchTerm"]);
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
