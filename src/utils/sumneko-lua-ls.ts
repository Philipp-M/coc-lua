import fs from "fs"
import path from "path"
import { LanguageClient } from "coc.nvim"
import { configDir } from "./config"
import { osEnv, install } from "./installer"
import { showInstallStatus } from "./tools"

const luaLsDir = "sumneko_lua"

export async function updateLuaLs(client: LanguageClient): Promise<void> {
  await installLuaLs(true)

  if (client.needsStop()) {
    await client.stop()
    client.start()
  }
}

export async function installLuaLs(force = false): Promise<void> {
  if (!force && (await luaLsExists())) {
    return
  }

  await showInstallStatus("sumneko/lua-language-server", async () => {
    await install(await configDir("tools", luaLsDir))
  })
}

export async function luaLsCommandAndArgs(): Promise<[string, string[]]> {
  const baseDir = await configDir("tools")

  const { bin } = osEnv()
  return [path.join(baseDir, luaLsDir, bin), ["-E", path.join(baseDir, luaLsDir, "main.lua")]]
}

export async function luaLsExists(): Promise<boolean> {
  const [bin] = await luaLsCommandAndArgs()
  return new Promise((resolve) => fs.open(bin, "r", (err) => resolve(err === null)))
}
