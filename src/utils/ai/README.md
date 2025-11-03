# AI Task System

This directory contains the AI-powered task execution system for the Discord bot to manage the Minecraft server.

## Overview

The AI can understand natural language requests and execute appropriate RCON commands on the Minecraft server. Tasks include both restricted (owner-only) and unrestricted operations.

## Task Types

### Unrestricted Tasks
These can be executed by any user:

- **fetchMessages** - Fetch additional message history (up to 10 more messages, 15 total cap)
- **whitelistList** - View all whitelisted players
- **listUsers** - See who's currently online

### Restricted Tasks (Owner Only)
These require the user's Discord ID to match the owner ID in config:

- **whitelistAdd** - Add a player to the whitelist
- **whitelistRemove** - Remove a player from the whitelist
- **ban** - Ban a player (with optional reason)
- **pardon** - Unban a player
- **logs** - Retrieve server log entries

## Task Structure

Each task is defined with:

```typescript
interface Task {
  name: string;                    // Task identifier
  description: string;             // What the task does
  parameters: Parameter[];         // Required/optional parameters
  validate: (ctx) => boolean;      // Validation logic (includes permission checks)
  execute: (ctx) => Promise<string>; // Execution logic
  restricted: boolean;             // Whether owner permissions are required
}
```

## Validation

Tasks have built-in validation functions that check:
- Parameter types and ranges
- User permissions (owner check for restricted tasks)
- Input sanitization (e.g., username length limits)

If validation fails, the task won't execute and returns an error message.

## Usage Example

User: `@Frank please add Zoe to the whitelist`

The AI will:
1. Parse the user's intent
2. Identify the `whitelistAdd` task
3. Extract the username parameter ("Zoe")
4. Validate the user has owner permissions
5. Execute the RCON command `whitelist add Zoe`
6. Reply with the result

## Environment Variables

Required environment variables:

```env
OPEN_AI_TOKEN=your_openai_api_key
RCON_HOST=localhost
RCON_PORT=25575
RCON_PASSWORD=your_rcon_password
MC_LOG_PATH=/path/to/minecraft/logs/latest.log
```

## Adding New Tasks

To add a new task:

1. Define the task in the `tasks` array in `tasks.ts`
2. Include proper validation logic
3. Set `restricted: true` if it requires owner permissions
4. Implement the execute function with RCON commands or other logic

Example:

```typescript
{
  name: "kick",
  description: "Kick a player from the server",
  parameters: [
    { name: "username", type: "string", description: "Player to kick", required: true }
  ],
  restricted: true,
  validate: (ctx) => {
    if (!isOwner(ctx.userId)) return false;
    return typeof ctx.args.username === "string";
  },
  execute: async (ctx) => {
    const response = await executeRcon(`kick ${ctx.args.username}`);
    return `Kicked ${ctx.args.username}: ${response}`;
  }
}
```

## AI Integration

The AI uses OpenAI's function calling feature to determine which tasks to execute based on user requests. It can chain multiple tasks together and provide conversational responses about the results.

