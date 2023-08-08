import { Router } from "express";

import config from "../config";

const router = Router();

const nodeFile = `
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

shell.run("wget ${config.HTTP_URL}/node/boot.lua /startup/boot.lua")

fs.delete("/setup")
os.reboot()
`;

const adminFile = `
local configFile = fs.open("/config.json", "w")
configFile.writeLine("{")
configFile.writeLine('  "PORT": ${config.PORT},')
configFile.writeLine('  "PASSWORD": "${config.ADMIN_PASSWORD}",')
configFile.writeLine('  "WS_URL": "${config.WEBSOCKET_URL}/admin",')
configFile.writeLine('  "HTTP_URL": "${config.HTTP_URL}"')
configFile.writeLine("}")
configFile.close()

shell.run("wget ${config.HTTP_URL}/admin/boot.lua /startup/boot.lua")

fs.delete("/setup")
os.reboot()
`;

router.get("/node", (req, res) => {
  res.send(nodeFile);
});

router.get("/admin", (req, res) => {
  res.send(adminFile);
});

export default router;
