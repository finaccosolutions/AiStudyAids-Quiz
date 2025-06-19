import React from 'react';
import { Card } from '../components/ui/Card';

const ChatPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Chat Assistant</h1>
      <Card className="p-6">
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
            {/* Chat messages will be displayed here */}
            <p className="text-gray-500 text-center">Start a new conversation...</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;