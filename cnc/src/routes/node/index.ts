import { Router } from "express";

import { ccNode } from "../../shared/nodes";

const nodeRouter = Router();

nodeRouter.use((req, res, next) => {
  // Check for auth
  if (req.headers.authorization !== process.env.NODE_PASSWORD) {
    res.status(401).send("Unauthorized");
    return;
  }
  next();
});

nodeRouter.ws("/", (ws, req) => {
  ws.once("message", (msg) => {
    let packet = JSON.parse(msg.toString());
    if (packet.type === "REGISTER") {
      let node = new ccNode(ws, packet.data);
      ws.on("close", () => {
        ccNode.delete(node.id);
      });
    }
  });
});

export default nodeRouter;
