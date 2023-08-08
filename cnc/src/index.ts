import express from "express";
import expressWs from "express-ws";
import { config } from "dotenv";

config({
  path: `${__dirname}/../.env`,
});
const app = express();
expressWs(app);

import * as routes from "./routes";

app.use(express.json());

app.use("/admin", routes.adminRouter);
app.use("/node", routes.nodeRouter);

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
