import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore } from '../store/useQuizStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  User, Settings, Heart, Lock, BookOpen, 
  Medal, History, Brain, Save, Edit2
} from 'lucide-react';

type TabType = 'general' | 'favorites' | 'password' | 'preferences' | 'achievements' | 'history';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, updatePassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.profile?.fullName || '',
    mobileNumber: user?.profile?.mobileNumber || '',
    countryCode: user?.profile?.countryCode || 'IN',
    countryName: user?.profile?.countryName || 'India'
  });
  
  const sidebarItems = [
    { id: 'general', label: 'General', icon: User },
    { id: 'favorites', label: 'Favorite Questions', icon: Heart },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'preferences', label: 'Quiz Preferences', icon: Settings },
    { id: 'achievements', label: 'Achievements', icon: Medal },
    { id: 'history', label: 'Study History', icon: History }
  ];

  const handleSaveProfile = async () => {
    if (!user) return;
    await updateProfile(user.id, profileData);
    setIsEditing(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Profile Details</h2>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <Input
                  type="tel"
                  value={profileData.mobileNumber}
                  onChange={(e) => setProfileData({ ...profileData, mobileNumber: e.target.value })}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <Input
                  type="text"
                  value={profileData.countryName}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </Button>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-purple-600 mb-2">
                    <Brain className="w-5 h-5" />
                    <span className="font-medium">Quizzes Taken</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">24</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-600 mb-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-medium">Study Hours</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">48</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-600 mb-2">
                    <Medal className="w-5 h-5" />
                    <span className="font-medium">Achievements</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">12</p>
                </div>
              </div>
            </div>
          </div>
        );

      // Add other tab content components here
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600">
              This feature is currently under development.
            </p>
          </div>
        );
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card className="p-6">
            {renderContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;