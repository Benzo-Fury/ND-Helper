import config from "#config";
import { eventModule, EventType } from "@sern/handler";
import { OpenAI } from "openai";
import { getTaskDefinitions, executeTask } from "../../../utils/ai/tasks.js";

export default eventModule({
  type: EventType.Discord,
  name: "messageCreate",
  execute: async (ctx) => {
    if (!ctx.content.includes(`<@${config.me}>`)) return;
    if (ctx.author.bot) return;

    const AIClient = new OpenAI({
      apiKey: Bun.env.OPEN_AI_TOKEN,
    });

    // Show typing indicator while processing
    await ctx.channel.sendTyping();
    const typingInterval = setInterval(() => {
      ctx.channel.sendTyping().catch(() => clearInterval(typingInterval));
    }, 7000);

    try {
      const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `You are **Frank**, a Discord bot that manages a Minecraft server. You can run tasks through RCON commands.  
          
          Keep responses short, clear, and a little sassy. No essays. No em dashes.  

          If a request seems out of context, you can use the **fetchMessages** task to pull recent chat messages and figure out what the user meant. You may fetch up to 15 messages total for context.  

          When returning or listing information from RCON, **format the data using Markdown codeblocks** for clarity. Present lists with backticked entries.  
          Example:  
          \`\`\`
          Whitelisted players:
          - \`ImNotHorizenzz\`
          - \`zoeffl\`
          - \`itaden352\`
          - \`MogulMuggle\`
          \`\`\`

          Examples:  
          ✅ "Added Zoe to the whitelist."  
          ✅ "Kicked Steve for spamming."  
          ✅ "Server restarted. Try not to break it this time."  
          🚫 "You don’t have permission for that. Nice try."  

          Always confirm when a task is done.`,
        },
        {
          role: "user",
          content: `${ctx.author.username}: ${ctx.content}`,
        },
      ];

      // Initial AI response with function calling
      let response = await AIClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: conversationMessages,
        tools: getTaskDefinitions(),
        tool_choice: "auto",
      });

      let assistantMessage = response.choices[0].message;
      const executedTasks: string[] = [];

      // Handle function calls iteratively (max 5 iterations to prevent infinite loops)
      let iterations = 0;
      const maxIterations = 5;

      while (assistantMessage.tool_calls && iterations < maxIterations) {
        iterations++;

        // Execute all tool calls
        for (const toolCall of assistantMessage.tool_calls) {
          if (toolCall.type !== "function") continue;

          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          const result = await executeTask(functionName, functionArgs, ctx);
          executedTasks.push(`${functionName}: ${result}`);

          // Add function result to conversation
          conversationMessages.push(assistantMessage);
          conversationMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        }

        // Get next AI response
        response = await AIClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: conversationMessages,
          tools: getTaskDefinitions(),
          tool_choice: "auto",
        });

        assistantMessage = response.choices[0].message;
      }

      // Send final response to Discord
      clearInterval(typingInterval);
      const finalResponse = assistantMessage.content || "Task completed.";
      await ctx.reply(finalResponse);
    } catch (error) {
      clearInterval(typingInterval);
      console.error("AI Error:", error);
      await ctx.reply("Sorry, I encountered an error processing your request.");
    }
  },
});
