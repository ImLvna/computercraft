import config from "../../config";
import { Router } from "express";

import { ccNode } from "../../util/nodes";

const adminRouter = Router();

adminRouter.use((req, res, next) => {
  // Check for auth
  if (req.headers.authorization !== config.ADMIN_PASSWORD) {
    res.status(401).send("Unauthorized");
    return;
  }
  next();
});

adminRouter.post("/packet/:id", (req, res) => {
  const node = ccNode.get(req.params.id);
  node.send(req.body);
});

export default adminRouter;
