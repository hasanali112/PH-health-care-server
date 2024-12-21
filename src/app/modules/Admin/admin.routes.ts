import { Router } from "express";
import { AdminController } from "./admin.controller";

const router = Router();

router.get("/", AdminController.getAllAdmins);
router.get("/:id", AdminController.getAdminById);
router.patch("/:id", AdminController.updateAdmin);
router.delete("/:id", AdminController.deleteAdmin);
router.delete("/soft/:id", AdminController.SoftDeleteAdmin);

export const AdminRoutes = router;
