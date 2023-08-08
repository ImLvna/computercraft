import { EventEmitter, WebSocket } from "ws";

import {
  incomingPacket,
  outgoingPacket,
  group,
  iPeripheral,
  turtleTool,
  evalPacketIncoming,
  evalPacket,
  dummyPacketIncoming,
  peripheralDirection,
} from "../types/packets";

interface looseNode {
  id: string;
  name: string;
  group: group;
  type: "COMPUTER" | "TURTLE" | "PERIPHERAL";
  peripherals: {
    [key in peripheralDirection]: iPeripheral;
  };
  turtleTool?: turtleTool;
}

const nodeList = new Map<string, ccNode>();
const groupList = new Map<group, ccNode[]>();

export declare interface ccNode {
  on(event: string, listener: (packet: incomingPacket) => void): this;
  once(event: string, listener: (packet: incomingPacket) => void): this;
}
export class ccNode extends EventEmitter {
  id: string;
  name: string;
  group: group;
  type: "COMPUTER" | "TURTLE" | "PERIPHERAL";
  peripherals: {
    [key in peripheralDirection]: iPeripheral;
  };
  turtleTool: turtleTool;

  ws: WebSocket;

  constructor(ws, settings: looseNode) {
    super();
    this.ws = ws;
    this.id = settings.id;
    this.name = settings.name;
    this.group = settings.group;
    this.type = settings.type;
    this.peripherals = settings.peripherals;

    if (this.type === "TURTLE") {
      this.turtleTool = settings.turtleTool!;
    } else {
      this.turtleTool = "NONE";
    }

    this.ws.on("message", (data) => {
      let packet: incomingPacket = JSON.parse(data.toString());
      this.emit(packet.type, packet);
    });

    nodeList.set(this.id, this);
    if (groupList.has(this.group)) {
      groupList.get(this.group).push(this);
    } else {
      groupList.set(this.group, [this]);
    }
  }

  /**
   * Restart the node
   */
  restart(): void {
    this.send({
      type: "RESTART",
      incoming: false,
      data: {},
    });
    this.ws.close();
    let groups = groupList.get(this.group);
    groups.splice(groups.indexOf(this), 1);
    nodeList.delete(this.id);
  }

  /**
   * Restart all nodes
   */
  static restart(): void {
    ccNode.getAll().forEach((node) => node.restart());
  }

  /**
   * Get a node by its ID
   * @param id The ID of the node
   */
  static get(id: string): ccNode {
    return nodeList.get(id);
  }

  /**
   * Get all nodes
   * @returns An array of all nodes
   */
  static getAll(): ccNode[] {
    return Array.from(nodeList.values());
  }

  /**
   * Delete a node by its ID
   * @param id The ID of the node
   */
  static delete(id: string): void {
    let node = nodeList.get(id);
    if (node) {
      node.ws.close();
      nodeList.delete(id);
    }
  }

  /**
   * Delete this node
   */
  delete(): void {
    this.ws.close();
    ccNode.delete(this.id);
  }

  /**
   * Delete all nodes
   */
  static deleteAll(): void {
    nodeList.forEach((node) => {
      node.ws.close();
    });
    nodeList.clear();
  }

  /**
   * Send a packet to the node
   * @param packet The packet to send
   * @returns The nonce of the packet
   */
  send<T extends outgoingPacket>(packet: T): string {
    if (!packet.nonce) {
      packet.nonce = Math.random().toString(36).substring(2, 9);
    }
    this.ws.send(JSON.stringify(packet));
    return packet.nonce;
  }

  /**
   *
   * @param packet The packet to send
   * @returns A promise that resolves with the nonce of the packet
   */
  sendAsync<T extends outgoingPacket>(packet: T): Promise<string> {
    return new Promise((resolve) => {
      if (!packet.nonce) {
        packet.nonce = Math.random().toString(36).substring(2, 9);
      }
      this.ws.send(JSON.stringify(packet));
      resolve(packet.nonce);
    });
  }

  /**
   * Wait for a response from the node
   * @param type The type of packet to wait for
   * @returns A promise that resolves with the nonce and data of the packet
   */
  async waitForPacket<T extends incomingPacket>(type: T): Promise<T> {
    return new Promise((resolve) => {
      this.on(type.type, (packet: T) => {
        resolve(packet);
      });
    });
  }

  /**
   * Wait for a response from the node with a specific nonce
   * @param type The type of packet to wait for
   * @param nonce The nonce of the packet to wait for
   * @param timeout The amount of time to wait for the packet
   * @returns A promise that resolves with the data of the packet
   */
  async waitForPacketWithNonce<T extends incomingPacket>(
    type: T,
    nonce: string,
    timeout?: number
  ): Promise<T | null> {
    return new Promise((resolve) => {
      this.on(type.type, (packet) => {
        if (packet.nonce === nonce) {
          resolve(<T>packet);
        }
      });
      if (timeout) {
        setTimeout(() => {
          resolve(null);
        }, timeout);
      }
    });
  }

  async sendAndAwaitResponse<
    T extends outgoingPacket,
    U extends incomingPacket
  >(packet: T, type: U, timeout?: number): Promise<U | null> {
    let nonce = this.send(packet);
    return this.waitForPacketWithNonce(type, nonce, timeout);
  }

  /**
   * Evaluate a Lua string on the node
   * @param code The Lua code to evaluate
   * @returns A promise that resolves with the result of the code
   * @example
   * node.eval("return 1 + 1") // 2
   * node.eval("return peripheral.isPresent('left')") // true
   */
  async eval(
    code: string,
    timeout?: number
  ): Promise<{ output: any; success: boolean }> {
    return new Promise(async (resolve) => {
      const dummyPacket = <evalPacketIncoming>dummyPacketIncoming;
      dummyPacket.type = "EVAL";
      const response = await this.sendAndAwaitResponse<
        evalPacket,
        evalPacketIncoming
      >(
        {
          type: "EVAL",
          incoming: false,
          data: {
            code,
          },
        },
        <evalPacketIncoming>dummyPacketIncoming,
        timeout
      );
      if (response) {
        resolve(response.data);
      } else {
        resolve({ output: null, success: false });
      }
    });
  }
}
