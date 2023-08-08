import { EventEmitter, WebSocket } from "ws";
type group = "FARM" | "MINE" | "REDSTONE";

type iPeripheral = "MODEM";

type turtleTool =
  | "PICKAXE"
  | "AXE"
  | "SHOVEL"
  | "SWORD"
  | "HOE"
  | "CRAFT"
  | "NONE";

interface looseNode {
  id: string;
  name: string;
  group: group;
  type: "COMPUTER" | "TURTLE" | "PERIPHERAL";
  peripherals?: iPeripheral[];
  turtleTool?: turtleTool;
}

export interface iPacket {
  type: "HEARTBEAT" | "GET_DATA" | "SET_DATA" | "EXECUTE";
  data: any;
}

const nodeList = new Map<string, ccNode>();

export class ccNode extends EventEmitter {
  id: string;
  name: string;
  group: group;
  type: "COMPUTER" | "TURTLE" | "PERIPHERAL";
  peripherals: iPeripheral[];
  turtleTool: turtleTool;

  ws: WebSocket;

  constructor(ws, settings: looseNode) {
    super();
    this.ws = ws;
    this.id = settings.id;
    this.name = settings.name;
    this.group = settings.group;
    this.type = settings.type;
    this.peripherals = settings.peripherals || [];
    this.turtleTool = settings.turtleTool || "NONE";

    this.ws.on("message", (data) => {
      let packet: iPacket = JSON.parse(data.toString());
      this.emit(packet.type, packet.data);
    });

    nodeList.set(this.id, this);
  }

  static get(id: string): ccNode {
    return nodeList.get(id);
  }

  static getAll(): ccNode[] {
    return Array.from(nodeList.values());
  }

  static delete(id: string): void {
    let node = nodeList.get(id);
    if (node) {
      node.ws.close();
      nodeList.delete(id);
    }
  }

  static deleteAll(): void {
    nodeList.forEach((node) => {
      node.ws.close();
    });
    nodeList.clear();
  }

  send(packet: iPacket): void {
    this.ws.send(JSON.stringify(packet));
  }
}
