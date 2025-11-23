import { Router } from "express";
import { UserController } from "../controllers/userController";
import { auth } from "../middleware/auth";

const router = Router();

router.post("/register", UserController.register);
router.post("/login", UserController.login);

router.get("/me", auth, UserController.getProfile);
router.put("/me", auth, UserController.editProfile);
router.post("/me/addPoints", auth, UserController.addPoints);

export default router;
