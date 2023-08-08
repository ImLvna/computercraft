configFileHandle = fs.open("/config.json", "r")
local configFile = textutils.unserialiseJSON(configFileHandle.readAll())
configFileHandle.close()

config = {
  group = configFile.GROUP,
  name = configFile.COMPUTER_NAME,

  password = configFile.PASSWORD,

  connectionURL = configFile.WS_URL,




  peripherals = {
    TOP = "NONE",
    BOTTOM = "NONE",
    LEFT = "NONE",
    RIGHT = "NONE",
    FRONT = "NONE",
    BACK = "NONE"
  }
}

if pocket then
  config.type = "POCKET"
elseif turtle then
  config.type = "TURTLE"
else
  config.type = "COMPUTER"
end

config.id = os.getComputerID()
local label = os.getComputerLabel()
if label then config.name = label end

if config.type == "COMPUTER" then
  for _, side in pairs(peripheral.getNames()) do
    config.peripherals[side.upper()] = peripheral.getType(side).upper()
  end
end

local socket, err = http.websocket(config.connectionURL, {
  Authorization = config.password
})
if not socket then
  return printError("Connection Error: ", err)
else
  print('Connection established')
  socket.send(textutils.serialiseJSON({ type = "REGISTER", data = config }))
end

local handlers = {


  REGISTER = function(packet)
    if packet.data.SUCCESS then
      print("Successfully connected to server!")
    else
      printError("Failed to register!")
    end
  end,


  RESTART = function(packet)
    os.reboot()
  end,


  EVAL = function(packet)
    local func, err = loadstring(packet.data.code)
    if not func then
      socket.send(textutils.serialiseJSON({ type = "EVAL", nonce = packet.nonce, data = { success = false, output = err } }))
    else
      local result = { pcall(func) }
      if not result[1] then
        socket.send(textutils.serialiseJSON({
          type = "EVAL",
          nonce = packet.nonce,
          data = { success = false, output = result[2] }
        }))
      else
        table.remove(result, 1)
        socket.send(textutils.serialiseJSON({
          type = "EVAL",
          nonce = packet.nonce,
          data = { success = true, output = result[1] }
        }))
      end
    end
  end,
}



while true do
  local type, url, message, isBinary = os.pullEvent()

  if type == "websocket_closed" and url == config.connectionURL then
    print('WebSocket closed')
    repeat
      socket, err = http.websocket(config.connectionURL, {
        Authorization = config.password
      })
      if not socket then
        printError("Connection Error: ", err)
        printError('Retrying in 1 second...')
        sleep(1)
      else
        print('Connection reestablished')
        socket.send(textutils.serialiseJSON({ type = "REGISTER", data = config }))
      end
    until socket
  elseif type == "websocket_message" and url == config.connectionURL then
    local packet = textutils.unserialiseJSON(message)

    print("Incoming packet: " .. packet.type)

    if handlers[packet.type] then
      handlers[packet.type](packet)
    else
      printError("Unknown packet type: " .. packet.type)
    end
  end
end
