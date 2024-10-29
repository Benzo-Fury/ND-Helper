import { argv } from 'bun';
import * as fs from 'fs';
import * as path from 'path';

// Default content for the new command file
const defaultCommandContent = `
import { commandModule, CommandType } from "@sern/handler";

export default commandModule({
  type: CommandType.Slash,
  description: "Some funky description",
  execute: async (ctx) => {
    await ctx.reply("Things like this dont exist everywhere.");
  },
});
`;

// Ensure the script is called with the correct number of arguments
if (process.argv.length < 3) {
    console.log("Usage: ts-node script.ts <command_name> <sub_category(s)?>");
    process.exit(1);
}

// Path to your config file
const configPath = "../src/config.ts"; // Modify this to your actual path

// Importing the config file
const config = await import(configPath);

// Extract the path if a match is found
if ("commands" in config.default) {
    const commandsDir = config.default["commands"];

    // Define the command name and subdirectory if provided
    const commandName = process.argv[2];
    const subDir = argv[3] ? argv[3] : '';  // Use the fourth argument (subdirectory) if provided

    // Define the full path including the subdirectory and the file name
    const newFilePath = path.join(commandsDir, subDir, `${commandName}.ts`);

    // Check if the full directory path (including subdirectories) exists, create it if not
    const fullDirPath = path.dirname(newFilePath); // Get the directory path from the full file path
    if (!fs.existsSync(fullDirPath)) {
        try {
            fs.mkdirSync(fullDirPath, { recursive: true }); // Create the directory including subdirectories
            console.log(`Directory ${fullDirPath} did not exist, created it.`);
        } catch (err) {
            console.error(`Error creating directory ${fullDirPath}: ${err}`);
            process.exit(1);
        }
    }

    // Create the new command file and write the content
    try {
        fs.writeFileSync(newFilePath, defaultCommandContent, 'utf-8');
        console.log(`Command '${commandName}' created successfully at ${newFilePath}.`);
    } catch (err) {
        console.error(`Error writing the new command file: ${err}`);
        process.exit(1);
    }
} else {
    console.error("Error: Commands directory variable not found in the config file. Is it defined correctly?");
    process.exit(1);
}
