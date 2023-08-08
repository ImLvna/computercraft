configFileHandle = fs.open("/config.json", "r")
local config = textutils.unserialiseJSON(configFileHandle.readAll())
configFileHandle.close()

local function get(url)
  local handle = http.get(url, {
    Authorization = config.PASSWORD
  })
  if not handle then
    return nil
  end

  local contents = handle.readAll()
  handle.close()

  return textutils.unserialiseJSON(contents)
end

local function post(url, data)
  local handle = http.post(url, textutils.serialiseJSON(data), {
    Authorization = config.PASSWORD
  })
  if not handle then
    return nil
  end

  local contents = handle.readAll()
  handle.close()

  return textutils.unserialiseJSON(contents)
end


local commands = {

  packet = function(args)
    local node = args[1]
    local packet = {
      type = args[2],
      data = args[3]
    }

    local response = post(config.HTTP_URL .. "/admin/packet/" .. node, packet)
    if not response then
      return printError("Failed to send packet!")
    end

    if response.type == "ERROR" then
      return printError("Server error: ", response.data)
    end

    print("Packet sent successfully!")
  end
}


while true do
  io.write("> ")
  local commandGroup = io.read("*l")
  local args = {}
  local command = ""
  local first = true
  for arg in commandGroup:gmatch("%S+") do
    if first then
      first = false
      command = arg
    else
      table.insert(args, arg)
    end
  end

  if commands[command] then
    commands[command](args)
  else
    print("Unknown command!")
  end
end
