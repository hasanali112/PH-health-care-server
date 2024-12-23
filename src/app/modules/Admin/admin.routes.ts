import { NextFunction, Request, Response, Router } from "express";
import { AdminController } from "./admin.controller";
import { AnyZodObject, z } from "zod";
import validateRequest from "../../middlewares/validateRequest";
import { AdminValidation } from "./admin.validation";

const router = Router();

router.get("/", AdminController.getAllAdmins);
router.get("/:id", AdminController.getAdminById);
router.patch(
  "/:id",
  validateRequest(AdminValidation.update),
  AdminController.updateAdmin
);
router.delete("/:id", AdminController.deleteAdmin);
router.delete("/soft/:id", AdminController.SoftDeleteAdmin);

export const AdminRoutes = router;
