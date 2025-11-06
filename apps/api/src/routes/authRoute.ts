
import { Router } from "express";
import { getUser, signin, signup } from "../services/authService.js";
import { authMiddleware } from "../middleware.js";

const authRouter: Router = Router()

authRouter.post("/signin", signin);
authRouter .post("/signup", signup);
authRouter.get("/me" ,authMiddleware , getUser)

export default authRouter;