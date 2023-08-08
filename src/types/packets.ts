export interface basePacket {
  type: string;
  incoming: boolean;
  nonce?: string;
  data: any;
}

export interface iIncomingPacket extends basePacket {
  incoming: true;
  nonce: string;
}
export interface iOutgoingPacket extends basePacket {
  incoming: false;
}

export const dummyPacketOutgoing: iOutgoingPacket = {
  type: "",
  incoming: false,
  data: {},
};
export const dummyPacketIncoming: iIncomingPacket = {
  type: "",
  incoming: true,
  nonce: "",
  data: {},
};

export interface registerPacket extends iOutgoingPacket {
  type: "REGISTER";
  data: {
    SUCCESS: boolean;
  };
}
export interface registerPacketIncoming extends iIncomingPacket {
  type: "REGISTER";
  data: {
    id: string;
    name: string;
    group: group;
    type: "COMPUTER" | "TURTLE" | "PERIPHERAL";
    peripherals: {
      [key in peripheralDirection]: iPeripheral;
    };
    turtleTool: turtleTool;
  };
}

export interface heartbeatPacket extends iOutgoingPacket {
  type: "HEARTBEAT";
}
export interface heartbeatPacketIncoming extends iIncomingPacket {
  type: "HEARTBEAT";
}

export interface getDataPacket extends iOutgoingPacket {
  type: "GET_DATA";
  data: {
    data: string;
  };
}
export interface getDataPacketIncoming extends iIncomingPacket {
  type: "GET_DATA";
  data: {
    data: any;
  };
}

export interface setDataPacket extends iOutgoingPacket {
  type: "SET_DATA";
  data: {
    data: string;
    value: any;
  };
}
export interface setDataPacketIncoming extends iIncomingPacket {
  type: "SET_DATA";
  data: {
    success: boolean;
  };
}

export interface evalPacket extends iOutgoingPacket {
  type: "EVAL";
  data: {
    code: string;
  };
}
export interface evalPacketIncoming extends iIncomingPacket {
  type: "EVAL";
  data: {
    success: boolean;
    output: any;
  };
}

export interface restartPacket extends iOutgoingPacket {
  type: "RESTART";
  data: {};
}

export type outgoingPacket =
  | registerPacket
  | heartbeatPacket
  | getDataPacket
  | setDataPacket
  | evalPacket
  | restartPacket;
export type incomingPacket =
  | registerPacketIncoming
  | heartbeatPacketIncoming
  | getDataPacketIncoming
  | setDataPacketIncoming
  | evalPacketIncoming;

export type group = "FARM" | "MINE" | "REDSTONE";

export type iPeripheral = "MODEM" | "NONE";
export type peripheralDirection =
  | "BOTTOM"
  | "TOP"
  | "LEFT"
  | "RIGHT"
  | "BACK"
  | "FRONT";

export type turtleTool =
  | "PICKAXE"
  | "AXE"
  | "SHOVEL"
  | "SWORD"
  | "HOE"
  | "CRAFT"
  | "NONE";
