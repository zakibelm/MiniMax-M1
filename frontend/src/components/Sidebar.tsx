import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendChatMessage } from '../services/api'; // Import the API service

// Define the structure of a chat message for type safety
interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'agent' | 'error'; // Added 'error' sender type for UI feedback
}

const Sidebar = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State to handle loading feedback

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return; // Prevent sending empty or while loading

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
    };

    setMessages(prev => [...prev, newUserMessage]);
    const messageToSend = currentMessage;
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Call the real API service instead of the mock timeout
      const agentText = await sendChatMessage(messageToSend, 'user-session-123'); // Using a hard-coded chatId for now

      const agentResponse: ChatMessage = {
        id: Date.now() + 1,
        text: agentText,
        sender: 'agent',
      };
      setMessages(prev => [...prev, agentResponse]);

    } catch (error) {
      // If the API call fails, display an error message in the chat
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: (error as Error).message || 'An unexpected error occurred.',
        sender: 'error',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chat</h2>
        <Link to="/settings" className="settings-link" title="Settings">
          ⚙️
        </Link>
      </div>

      <div className="chat-history">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <textarea
          className="chat-input"
          placeholder={isLoading ? 'Agent is thinking...' : 'Type your message...'}
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          disabled={isLoading}
        />
        <button type="submit" className="send-button" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Sidebar;
