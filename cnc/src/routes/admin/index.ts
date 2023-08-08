import { Router } from "express";

const adminRouter = Router();

adminRouter.use((req, res, next) => {
  // Check for auth
  if (req.headers.authorization !== process.env.ADMIN_AUTH) {
    res.status(401).send("Unauthorized");
    return;
  }
  next();
});

export default adminRouter;
