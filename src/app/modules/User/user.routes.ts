import { NextFunction, Request, Response, Router } from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../helper/fileUploader";
import { UserValidation } from "./user.validation";

const router = Router();

router.post(
  "/",
  fileUploader.upload.single("file"),
  // auth("ADMIN", "SUPER_ADMIN"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = UserValidation.createAdminValidation.parse(
      JSON.parse(req.body.data)
    );
    return UserController.createAdmin(req, res, next);
  }
);

export const UserRoutes = router;
