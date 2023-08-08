config = {
  group = "redstone",
  type = "COMPUTER",


  id = os.getComputerID(),
  name = os.getComputerLabel(),
}

os.loadAPI("json")

local wsClient = http.websocket("ws://localhost:8080")

wsClient:on("open", function()
  print("Connected to server")
  wsClient:send(json.encode({
    type = "REGISTER",
    data = config
  }))
end)

wsClient:open()
