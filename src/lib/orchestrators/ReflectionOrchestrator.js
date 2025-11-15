// Orchestrator: selects between HappyNeutralAgent, SadSupportiveAgent, and MotivationalAgent

import { geminiGenerate } from '../gemini.js';
import { HappyNeutralAgent } from '../agents/HappyNeutralAgent.js';
import { SadSupportiveAgent } from '../agents/SadSupportiveAgent.js';
import { MotivationalAgent } from '../agents/MotivationalAgent.js';

const SELECTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    agent: { type: 'STRING' },
    reasons: { type: 'STRING' }
  },
  required: ['agent']
};

export class ReflectionOrchestrator {
  constructor() {
    this.name = 'reflection';
    this.agentByName = {
      happyNeutral: new HappyNeutralAgent(),
      sadSupportive: new SadSupportiveAgent(),
      motivational: new MotivationalAgent()
    };
  }

  async _respondWith(agentName, contents) {
    const agent = this.agentByName[agentName] || this.agentByName.happyNeutral;
    const res = await agent.respond(contents);
    return res?.text || '';
  }

  async orchestrate(contents) {
    const orchestratorPrompt = `Your job is to choose which reflection agent should respond to the user right now.
        Think in two steps:
        1) What does the user need right now? Consider their emotional state, what they're sharing, and what would be most helpful.
        2) Pick the agent whose approach best matches that need.

        Available agents:
        - "happyNeutral": Use when the user needs to consolidate wins, recognize progress, or feel affirmed. Best for celebrating achievements, reflecting on positive experiences, or building confidence through acknowledgment.
        - "sadSupportive": Use when the user needs emotional support, validation, grounding, or clarity. Best for difficult emotions, feeling overwhelmed, needing to feel heard, or processing challenging experiences.
        - "motivational": Use when the user needs to take action, plan next steps, or commit to something. Best for moving forward, breaking down goals, or building momentum through concrete steps.

        Constraints:
        - Speak only through structured output. No extra text.
        - Choose agents only from the list above.
        - Prioritize the latest user message while considering the conversation context.
        - Prefer clarity and coherence over breadth.

        Output strictly as JSON:
        {
          "agent": "happyNeutral",
          "reasons": "User shared a positive experience and seems to need acknowledgment and win consolidation"
        }`;

    const result = await geminiGenerate({
      contents,
      systemPrompt: orchestratorPrompt,
      config: { responseMimeType: 'application/json', responseSchema: SELECTION_SCHEMA }
    });

    let agent = 'happyNeutral';
    let reasons = 'Defaulted to happyNeutral';
    
    try {
      const parsed = JSON.parse(result.text || '{}');
      const rawAgent = String(parsed?.agent || '').toLowerCase();
      
      // Normalize agent name to match our keys
      if (rawAgent === 'happyneutral' || rawAgent === 'happy_neutral') {
        agent = 'happyNeutral';
      } else if (rawAgent === 'sadsupportive' || rawAgent === 'sad_supportive') {
        agent = 'sadSupportive';
      } else if (rawAgent === 'motivational') {
        agent = 'motivational';
      }
      
      if (parsed?.reasons) reasons = String(parsed.reasons);
    } catch (_) {}

    const text = await this._respondWith(agent, contents);

    const frameSet = { frames: { persona: { value: agent, rationale: [reasons] } } };
    return { assistantMessage: text || '', frameSet, agent, reasons };
  }
}

