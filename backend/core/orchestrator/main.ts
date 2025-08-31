// core/orchestrator/main.ts

import { promises as fs } from 'fs';
import path from 'path';
import { SessionManager, Interaction } from '../../storage/session-manager';
import { SystemLogger } from '../../storage/logging';

// ==================================
// Type Definitions
// ==================================

interface AgentSettings {
  apiKey: string;
  agentModels: { [key: string]: string };
}

interface AgentContext {
  history: Interaction[];
  settings: AgentSettings;
  agentModel: string;
}

// Represents an agent connected via MCP.
interface MCPAgent {
    execute(message: TelegramMessage, context: AgentContext): Promise<AgentResponse>;
}

export interface TelegramMessage {
    type: 'text' | 'photo';
    content?: string;
    fileId?: string;
    chatId: number | string;
}

export interface AgentResponse {
    message: string;
}

// ==================================
// Mock Agent Implementation
// ==================================

class MockAgent implements MCPAgent {
    constructor(private name: string) {}
    async execute(message: TelegramMessage, context: AgentContext): Promise<AgentResponse> {
        console.log(`Agent [${this.name}] is executing.`);
        console.log(` > Using model: ${context.agentModel}`);
        console.log(` > API Key starts with: ${context.settings.apiKey.substring(0, 4)}...`);

        return { message: `Mock response from [${this.name}] using model [${context.agentModel}].` };
    }
}

// ==================================
// Orchestrator Implementation
// ==================================

export class MediaAgentOrchestrator {
  private agents: Map<string, MCPAgent>;
  private sessionManager: SessionManager;
  private logger: SystemLogger;
  private settings: AgentSettings = { apiKey: '', agentModels: {} };

  constructor() {
    this.sessionManager = new SessionManager();
    this.logger = new SystemLogger();
    this.agents = new Map();

    this.agents.set("drive", new MockAgent("drive"));
    this.agents.set("creative", new MockAgent("creative"));
    this.agents.set("default", new MockAgent("default"));

    this._loadSettings(); // Load settings on startup
  }

  private async _loadSettings() {
    try {
      const settingsPath = path.join(__dirname, '..', '..', 'config', 'ai-settings.json');
      const data = await fs.readFile(settingsPath, 'utf-8');
      this.settings = JSON.parse(data);
      this.logger.log("AI settings loaded successfully.");
    } catch (error) {
      this.logger.error("Could not load AI settings. Using default.", error);
    }
  }

  private async analyzeIntent(message: TelegramMessage): Promise<string> {
    // In a real scenario, this might use the configured LLM with the API key.
    this.logger.log(`Analyzing intent for: "${message.content || 'photo'}"`);
    const text = message.content?.toLowerCase() || '';
    if (text.includes("image") || text.includes("crée") || text.includes("dessine")) return "creative";
    if (text.includes("drive") || text.includes("fichier") || text.includes("cherche")) return "drive";
    return "default";
  }

  private selectAgent(intent: string): { agent: MCPAgent; model: string } {
    this.logger.log(`Routing to agent with intent: [${intent}]`);
    const agent = this.agents.get(intent) || this.agents.get("default")!;
    const model = this.settings.agentModels[intent] || 'default-model';
    return { agent, model };
  }

  private getContext(chatId: number | string, agentModel: string): AgentContext {
      const session = this.sessionManager.getSession(String(chatId));
      return {
          history: session.interactions.slice(-10),
          settings: this.settings,
          agentModel,
      };
  }

  async routeRequest(message: TelegramMessage): Promise<AgentResponse> {
    this.logger.log(`Routing request for chat ID: ${message.chatId}`);

    const intent = await this.analyzeIntent(message);
    const { agent, model } = this.selectAgent(intent);
    const context = this.getContext(message.chatId, model);

    const response = await agent.execute(message, context);

    this.sessionManager.updateSession(String(message.chatId), new Interaction({ user: message }));
    this.sessionManager.updateSession(String(message.chatId), new Interaction({ agent: response }));

    return response;
  }
}
