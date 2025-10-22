
import { Router } from "express";
import { signin, signup } from "../services/authService.js";

const authRouter: Router = Router()

authRouter.post("/signin", signin);
authRouter .post("/signup", signup);

export default authRouter;