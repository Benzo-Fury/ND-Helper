import { Rcon } from "rcon-client";

export default class Minecraft {
  /**
   * Executes code inside the minecraft terminal.
   */
  public static async execute(cmd: string) {
    const rcon = await Rcon.connect({
      host: "127.0.0.1", // or server IP
      port: 25575,
      password: process.env.MC_RCON_PASSWORD,
    });
    try {
      const res = await rcon.send(cmd); // e.g., "whitelist add NeoYaBoi"
      return res; // server console output
    } finally {
      rcon.end();
    }
  }
}
