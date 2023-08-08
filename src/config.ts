import { readFileSync } from "fs";

interface iDynConfig {
  PORT: string | number;
  ADMIN_PASSWORD: "asdj8aysdhsaidas";
  NODE_PASSWORD: "dsjaudhasiyudgasy7idasgu";
  DOMAIN: string;
  SSL: boolean;
}

interface iConfig extends iDynConfig {
  PORT: string;
  WEBSOCKET_URL: string;
  HTTP_URL: string;
}

const dynConfig: iDynConfig = JSON.parse(readFileSync("config.json", "utf8"));

const config = <iConfig>dynConfig;
if (typeof config.PORT === "number") {
  config.PORT = dynConfig.PORT.toString();
}

config.WEBSOCKET_URL = `ws${config.SSL ? "s" : ""}://${config.DOMAIN}:${
  config.PORT
}`;
config.HTTP_URL = `http${config.SSL ? "s" : ""}://${config.DOMAIN}:${
  config.PORT
}`;

export default config;
