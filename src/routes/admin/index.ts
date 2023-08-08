import config from "../../config";
import { Router } from "express";

const adminRouter = Router();

adminRouter.use((req, res, next) => {
  // Check for auth
  if (req.headers.authorization !== config.ADMIN_PASSWORD) {
    res.status(401).send("Unauthorized");
    return;
  }
  next();
});

export default adminRouter;
