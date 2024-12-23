import { Router } from "express";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/", auth("ADMIN", "SUPER_ADMIN"), UserController.createAdmin);

export const UserRoutes = router;
