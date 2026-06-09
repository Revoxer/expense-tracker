import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/env";

const client = new Anthropic({ apiKey: config.anthropicApiKey });

export const categorizeTransaction = async (
  description: string,
): Promise<string> => {
  const prompt = `Categorize this transaction: "${description}". Choose exactly one category from this list: Food, Transport, Entertainment, Health, Home, Clothes, Education, Other. Reply with only the category name, nothing else.`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 10,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type === "text") {
    return block.text.trim();
  }

  return "Other";
};
