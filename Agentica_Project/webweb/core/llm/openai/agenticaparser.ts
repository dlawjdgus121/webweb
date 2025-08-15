import { askOpenAIJson } from "../../utils/openaiClient.ts";
import { AGENTICA_SYSTEM_PROMPT } from "./prompts/agenticaSystemPrompt.ts";

export async function parseAgentCommand(userInput: string) {
  return await askOpenAIJson(
    `${AGENTICA_SYSTEM_PROMPT}\n\n사용자 입력: "${userInput}"\n\nJSON 형식으로만 응답하세요.`,
    "gpt-4o-mini"
  );
}