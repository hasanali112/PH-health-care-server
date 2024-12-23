import { Router } from "express";
import { AuthController } from "./auth.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/login", AuthController.loginUser);
router.post("/refresh-token", AuthController.refreshTokenCreate);
router.post(
  "/change-password",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
  AuthController.changedPassword
);

router.post("/forgot-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetUserPassword);

export const AuthRoutes = router;
