import type { Message } from "discord.js";
import config from "#config";
import { Rcon } from "rcon-client";

// Task types define the structure and validation for each AI-executable task
export interface TaskContext {
  message: Message;
  userId: string;
  args: Record<string, any>;
}

export interface Task {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: "string" | "number" | "boolean";
    description: string;
    required: boolean;
  }[];
  validate: (ctx: TaskContext) => boolean;
  execute: (ctx: TaskContext) => Promise<string>;
  restricted: boolean;
}

// Helper to check if user is owner
const isOwner = (userId: string): boolean => userId === config.owner;

// Helper to create RCON connection
async function getRconConnection(): Promise<Rcon> {
  const rcon = await Rcon.connect({
    host: Bun.env.RCON_HOST || "localhost",
    port: parseInt(Bun.env.RCON_PORT || "25575"),
    password: Bun.env.RCON_PASSWORD || "",
  });
  return rcon;
}

// Helper to execute RCON command safely
async function executeRcon(command: string): Promise<string> {
  const rcon = await getRconConnection();
  try {
    const response = await rcon.send(command);
    return response;
  } finally {
    await rcon.end();
  }
}

// Task definitions
export const tasks: Task[] = [
  {
    name: "fetchMessages",
    description: "Fetch additional message history from the channel for more context. Can fetch up to 10 more messages (total cap of 15 messages including initial 5).",
    parameters: [
      {
        name: "amount",
        type: "number",
        description: "Number of additional messages to fetch (1-10)",
        required: true,
      },
    ],
    restricted: false,
    validate: (ctx) => {
      const { amount } = ctx.args;
      return typeof amount === "number" && amount >= 1 && amount <= 10;
    },
    execute: async (ctx) => {
      const { amount } = ctx.args;
      const messages = await ctx.message.channel.messages.fetch({ 
        limit: Math.min(amount, 10),
        before: ctx.message.id,
      });
      
      const formatted = messages
        .map((m) => `${m.author.username}: ${m.content}`)
        .reverse()
        .join("\n");
      
      return `Fetched ${messages.size} messages:\n${formatted}`;
    },
  },

  {
    name: "whitelistAdd",
    description: "Add a player to the Minecraft server whitelist. This allows them to join the server.",
    parameters: [
      {
        name: "username",
        type: "string",
        description: "The Minecraft username to add to the whitelist",
        required: true,
      },
    ],
    restricted: true,
    validate: (ctx) => {
      if (!isOwner(ctx.userId)) return false;
      const { username } = ctx.args;
      return typeof username === "string" && username.length > 0 && username.length <= 16;
    },
    execute: async (ctx) => {
      const { username } = ctx.args;
      const response = await executeRcon(`whitelist add ${username}`);
      return `Added ${username} to whitelist: ${response}`;
    },
  },

  {
    name: "whitelistRemove",
    description: "Remove a player from the Minecraft server whitelist. This prevents them from joining the server.",
    parameters: [
      {
        name: "username",
        type: "string",
        description: "The Minecraft username to remove from the whitelist",
        required: true,
      },
    ],
    restricted: true,
    validate: (ctx) => {
      if (!isOwner(ctx.userId)) return false;
      const { username } = ctx.args;
      return typeof username === "string" && username.length > 0 && username.length <= 16;
    },
    execute: async (ctx) => {
      const { username } = ctx.args;
      const response = await executeRcon(`whitelist remove ${username}`);
      return `Removed ${username} from whitelist: ${response}`;
    },
  },

  {
    name: "whitelistList",
    description: "List all players currently on the Minecraft server whitelist.",
    parameters: [],
    restricted: false,
    validate: () => true,
    execute: async () => {
      const response = await executeRcon("whitelist list");
      return `Whitelist: ${response}`;
    },
  },

  {
    name: "ban",
    description: "Ban a player from the Minecraft server. Optionally include a reason.",
    parameters: [
      {
        name: "username",
        type: "string",
        description: "The Minecraft username to ban",
        required: true,
      },
      {
        name: "reason",
        type: "string",
        description: "Optional reason for the ban",
        required: false,
      },
    ],
    restricted: true,
    validate: (ctx) => {
      if (!isOwner(ctx.userId)) return false;
      const { username } = ctx.args;
      return typeof username === "string" && username.length > 0 && username.length <= 16;
    },
    execute: async (ctx) => {
      const { username, reason } = ctx.args;
      const command = reason 
        ? `ban ${username} ${reason}` 
        : `ban ${username}`;
      const response = await executeRcon(command);
      return `Banned ${username}: ${response}`;
    },
  },

  {
    name: "kick",
    description: "Kick a player from the Minecraft server. They can rejoin immediately. Optionally include a reason.",
    parameters: [
      {
        name: "username",
        type: "string",
        description: "The Minecraft username to kick",
        required: true,
      },
      {
        name: "reason",
        type: "string",
        description: "Optional reason for the kick",
        required: false,
      },
    ],
    restricted: true,
    validate: (ctx) => {
      if (!isOwner(ctx.userId)) return false;
      const { username } = ctx.args;
      return typeof username === "string" && username.length > 0 && username.length <= 16;
    },
    execute: async (ctx) => {
      const { username, reason } = ctx.args;
      const command = reason 
        ? `kick ${username} ${reason}` 
        : `kick ${username}`;
      const response = await executeRcon(command);
      return `Kicked ${username}: ${response}`;
    },
  },

  {
    name: "pardon",
    description: "Remove a ban from a player, allowing them to join the server again.",
    parameters: [
      {
        name: "username",
        type: "string",
        description: "The Minecraft username to pardon",
        required: true,
      },
    ],
    restricted: true,
    validate: (ctx) => {
      if (!isOwner(ctx.userId)) return false;
      const { username } = ctx.args;
      return typeof username === "string" && username.length > 0 && username.length <= 16;
    },
    execute: async (ctx) => {
      const { username } = ctx.args;
      const response = await executeRcon(`pardon ${username}`);
      return `Pardoned ${username}: ${response}`;
    },
  },

  {
    name: "listUsers",
    description: "Show which players are currently online on the Minecraft server.",
    parameters: [],
    restricted: false,
    validate: () => true,
    execute: async () => {
      const response = await executeRcon("list");
      return `Online players: ${response}`;
    },
  },
];

// Helper to get task definitions for OpenAI function calling
export function getTaskDefinitions() {
  return tasks.map((task) => ({
    type: "function" as const,
    function: {
      name: task.name,
      description: task.description,
      parameters: {
        type: "object",
        properties: task.parameters.reduce(
          (acc, param) => {
            acc[param.name] = {
              type: param.type,
              description: param.description,
            };
            return acc;
          },
          {} as Record<string, any>
        ),
        required: task.parameters
          .filter((p) => p.required)
          .map((p) => p.name),
      },
    },
  }));
}

// Helper to execute a task by name
export async function executeTask(
  taskName: string,
  args: Record<string, any>,
  message: Message
): Promise<string> {
  const task = tasks.find((t) => t.name === taskName);
  
  if (!task) {
    return `Error: Task "${taskName}" not found`;
  }

  const ctx: TaskContext = {
    message,
    userId: message.author.id,
    args,
  };

  if (!task.validate(ctx)) {
    if (task.restricted && !isOwner(ctx.userId)) {
      return `Error: You don't have permission to execute "${taskName}" (owner only)`;
    }
    return `Error: Invalid parameters for task "${taskName}"`;
  }

  try {
    return await task.execute(ctx);
  } catch (error) {
    return `Error executing "${taskName}": ${error}`;
  }
}

