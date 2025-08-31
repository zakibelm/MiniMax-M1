// storage/session-manager/index.ts

// Placeholder classes for ChatSession and Interaction
// These will be fleshed out later.
export class Interaction {
  constructor(public content: any) {}
}

export class ChatSession {
  public interactions: Interaction[] = [];

  constructor(public chatId: string) {}

  addInteraction(interaction: Interaction) {
    this.interactions.push(interaction);
  }
}

export class SessionManager {
  private sessions: Map<string, ChatSession> = new Map();

  getSession(chatId: string): ChatSession {
    if (!this.sessions.has(chatId)) {
      this.sessions.set(chatId, new ChatSession(chatId));
    }
    return this.sessions.get(chatId)!;
  }

  updateSession(chatId: string, interaction: Interaction) {
    const session = this.getSession(chatId);
    session.addInteraction(interaction);

    // Maintenir historique limité
    if (session.interactions.length > 50) {
      session.interactions = session.interactions.slice(-30);
    }
  }
}
