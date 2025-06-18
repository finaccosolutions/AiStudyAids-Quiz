import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import ApiKeyForm from '../components/quiz/ApiKeyForm';

const ApiSettingsPage: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <ApiKeyForm userId={user.id} />
    </div>
  );
};

export default ApiSettingsPage;