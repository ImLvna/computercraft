import express from "express";
import expressWs from "express-ws";

import { existsSync } from "fs";

import config from "./config";

const app = express();
expressWs(app);

import * as routes from "./routes";

app.use(express.json());

if (existsSync("../public")) app.use(express.static("../public"));
else app.use(express.static("public"));

app.use("/admin", routes.adminRouter);
app.use("/node", routes.nodeRouter);
app.use("/setup", routes.setupRouter);

app.listen(config.PORT, () => {
  console.log(`Listening on port ${config.PORT}`);
});
