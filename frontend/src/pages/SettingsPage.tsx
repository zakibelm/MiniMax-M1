import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSettings, saveSettings, AgentSettings } from '../services/api';

const SettingsPage = () => {
  const [settings, setSettings] = useState<AgentSettings>({ apiKey: '', agentModels: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch settings when the component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setStatusMessage('Loading settings...');
        const currentSettings = await getSettings();
        setSettings(currentSettings);
        setStatusMessage('');
      } catch (error) {
        setStatusMessage((error as Error).message);
      } finally {
        setInitialLoading(false);
      }
    };
    loadSettings();
  }, []); // Empty dependency array means this runs once on mount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');
    try {
      await saveSettings(settings);
      setStatusMessage('Settings saved successfully!');
      // Hide success message after 3 seconds
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      setStatusMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="settings-page"><h1>Settings</h1><p>{statusMessage}</p></div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <Link to="/" className="back-link">← Back to Chat</Link>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="apiKey">OpenRouter API Key</label>
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={settings.apiKey}
            onChange={handleInputChange}
            placeholder="Enter your API key"
            disabled={isLoading}
          />
        </div>

        <hr />

        <h3>Agent Model Configuration</h3>
        <p>Select which AI model each agent should use (feature to be implemented).</p>

        <div className="form-group">
          <label htmlFor="drive-agent-model">Drive Agent</label>
          <select id="drive-agent-model" disabled>
            <option>{settings.agentModels?.drive || 'default'}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="creative-agent-model">Creative Agent</label>
          <select id="creative-agent-model" disabled>
            <option>{settings.agentModels?.creative || 'default'}</option>
          </select>
        </div>

        <button type="submit" className="save-button" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>

        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </form>
    </div>
  );
};

export default SettingsPage;
