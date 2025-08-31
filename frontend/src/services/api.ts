// The base URL of our backend API. In a real-world application,
// this would come from an environment variable.
const API_BASE_URL = 'http://localhost:3001';

// We can define a type for the expected response from the chat endpoint
// to ensure type safety.
interface AgentResponse {
  message: string;
}

/**
 * Sends a message to the backend chat API and returns the agent's response.
 * @param message The text message from the user.
 * @param chatId The unique identifier for the conversation.
 * @returns The agent's response message as a string.
 */
export const sendChatMessage = async (message: string, chatId: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, chatId }),
    });

    if (!response.ok) {
      // If the server responds with an error status (e.g., 400, 500),
      // we try to parse the error message and throw it.
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const data: AgentResponse = await response.json();
    return data.message;

  } catch (error) {
    console.error('Error in sendChatMessage service:', error);
    // Re-throw the error so the calling component can handle it (e.g., show an error message).
    // We can make this more user-friendly by returning a specific error message.
    throw new Error('Failed to communicate with the agent. Please try again later.');
  }
};
