import { Router } from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../helper/fileUploader";

const router = Router();

router.post(
  "/",
  fileUploader.single("file"),
  auth("ADMIN", "SUPER_ADMIN"),
  UserController.createAdmin
);

export const UserRoutes = router;
