import { geminiGenerate } from "../gemini.js";

export class AutoAssistAgent {
  constructor() {
    this.name = "autoAssist";
  }

  async respond(contents) {
    const systemPrompt = `You are a thoughtful reflection guide.
        Goal: Ask exactly ONE concise question that invites deeper reflection on a *specific* detail from the user's journal entry.
        Required grounding: Explicitly reference or quote a concrete phrase from the entry (3-10 words) so it is clear you read it. No generic templates.
        Style: Curious, gentle, non-judgmental. One sentence (max two). No emojis.
        Avoid: Generic prompts, assumptions, advice, or multiple questions.`;

    const { text } = await geminiGenerate({
      contents,
      systemPrompt,
      config: { temperature: 0.6 }
    });
    return { text };
  }
}

