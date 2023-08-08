import { Router } from "express";

import config from "../config";

const router = Router();

const setupFile = `
io.write("Please give the computer a name: ")
local computerName = io.read("*l")
io.write("Please assign a group: ")
local group = io.read("*l")
local configFile = fs.open("/config.json", "w")
configFile.writeLine("{")
configFile.writeLine('  "PORT": ${config.PORT},')
configFile.writeLine('  "PASSWORD": "${config.NODE_PASSWORD}",')
configFile.writeLine('  "WS_URL": "${config.WEBSOCKET_URL}/node",')
configFile.writeLine('  "HTTP_URL": "${config.HTTP_URL}",')
configFile.writeLine('  "COMPUTER_NAME": "' .. computerName .. '",')
configFile.writeLine('  "GROUP": "' .. group .. '"')
configFile.writeLine("}")
configFile.close()

shell.run("wget ${config.HTTP_URL}/boot.lua /startup/boot.lua")

fs.delete("/setup")
os.reboot()
`;

router.get("/", (req, res) => {
  res.send(setupFile);
});

export default router;
