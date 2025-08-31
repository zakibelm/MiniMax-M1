import React from 'react';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';

const ChatPage = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <MainContent />
    </div>
  );
};

export default ChatPage;
