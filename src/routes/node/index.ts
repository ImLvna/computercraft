import { Router } from "express";

import { ccNode } from "../../shared/nodes";
import { registerPacket, registerPacketIncoming } from "../../types/packets";

import config from "../../config";

const nodeRouter = Router();

nodeRouter.use((req, res, next) => {
  // Check for auth
  if (req.headers.authorization !== config.NODE_PASSWORD) {
    res.status(401).send("Unauthorized");
    console.log("Unauthorized node connection attempt");
    return;
  }
  next();
});

nodeRouter.ws("/", (ws, req) => {
  ws.once("message", (msg) => {
    let packet: registerPacketIncoming = JSON.parse(msg.toString());
    let node = new ccNode(ws, packet.data);
    node.send<registerPacket>({
      type: "REGISTER",
      incoming: false,
      data: {
        SUCCESS: true,
      },
    });
    ws.on("close", () => {
      ccNode.delete(node.id);
    });
  });
});

export default nodeRouter;
