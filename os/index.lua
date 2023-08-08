config = {
  group = "REDSTONE",


  peripherals = {
    TOP = "NONE",
    BOTTOM = "NONE",
    LEFT = "NONE",
    RIGHT = "NONE",
    FRONT = "NONE",
    BACK = "NONE"
  }
}

if pocket then config.type = "POCKET"
elseif turtle then config.type = "TURTLE"
else config.type = "COMPUTER" end

config.id = os.getComputerID()
config.name = os.getComputerLabel()

if config.type == "COMPUTER" then
    for _, side in pairs(peripheral.getNames()) do
        config.peripherals[side.upper()] = peripheral.getType(side).upper()
    end
end

print('Connecting to ' .. connectionURL)
local socket, err = http.websocket(connectionURL)
if not socket then
    return printError(err)
else
    print('WebSocket opened')
    socket.send(textutils.serialiseJSON({ type = "REGISTER", data = config }))
end

while true do
    local type, url, message, isBinary = os.pullEvent()

    if type == "websocket_closed" and url == connectionURL then
        print('WebSocket closed')
        repeat
            socket, err = http.websocket(connectionURL)
            if not socket then
                printError(err)
            else
                print('WebSocket opened')
                socket.send(textutils.serialiseJSON({ type = "REGISTER", data = config }))
            end
        until socket
    elseif type == "websocket_message" and url == connectionURL then
        print('Command: ' .. message)
        local packet = textutils.unserialiseJSON(message)
        
        if packet.type == "EVAL" then
            local func, err = loadstring(packet.data)
            if not func then
                socket.send(textutils.serialiseJSON({ type = "EVAL", nonce = packet.nonce, data = {success = false, data = err, logs = [err] }}))
            else
                local result = { pcall(func) }
                if not result[1] then
                    socket.send(textutils.serialiseJSON({ type = "EVAL", nonce = packet.nonce, data = {success = false, data = result[2], logs = [result[2]] }}))
                else
                    table.remove(result, 1)
                    socket.send(textutils.serialiseJSON({ type = "EVAL", nonce = packet.nonce, data = {success = true, data = result, logs = [] }}))
                end
            end
        end
    end
end