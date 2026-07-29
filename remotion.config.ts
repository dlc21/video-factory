import path from "node:path"
import { Config } from "@remotion/cli/config"

Config.setVideoImageFormat("jpeg")
Config.setConcurrency(4)
Config.setPublicDir(path.resolve(process.cwd(), "public"))
