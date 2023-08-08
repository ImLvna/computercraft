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
else if turtle then config.type = "TURTLE"
else config.type = "COMPUTER" end end

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
            end
        until socket
    elseif type == "websocket_message" and url == connectionURL then
        print('Command: ' .. message)

        if message == 'exit()' then
            socket.close()
            print('WebSocket closed')
            break
        else
            local response = nil
            local fn, err = load('return ' .. message)
            if fn then
                local success, a, b = pcall(fn)
                if success then
                    if a == nil then
                        a = textutils.json_null
                    end
                    response = textutils.serialiseJSON({ a, b })
                else
                    response = textutils.serialiseJSON({ textutils.json_null, a })
                end
            else
                response = textutils.serialiseJSON({ textutils.json_null, err })
            end
            print('Response: ' .. response)
            socket.send(response)
        end
    end
end