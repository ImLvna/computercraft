print("Booting...")

configFile = fs.open("/config.json", "r")
config = textutils.unserialiseJSON(configFile.readAll())
configFile.close()

local initFile = http.get(config.HTTP_URL .. "/admin/main.lua")
if not initFile then
  return printError("Failed to download init file!")
end

local initFileContents = initFile.readAll()

local initFunc, err = loadstring(initFileContents)
if not initFunc then
  return printError("Failed to load init file: ", err)
end

local ok, err = pcall(initFunc)

if not ok then
  return printError("Failed to run init file: ", err)
end
