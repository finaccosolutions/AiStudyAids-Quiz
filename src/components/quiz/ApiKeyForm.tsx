import React, { useState } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { Key, Save, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApiKeyFormProps {
  userId: string;
  onSave?: () => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ userId, onSave }) => {
  const { apiKey, saveApiKey, isLoading, error } = useQuizStore();
  const [key, setKey] = useState(apiKey || '');
  const [copied, setCopied] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveApiKey(userId, key);
    if (onSave) onSave();
  };
  
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const steps = [
    {
      title: '1. Visit Google AI Studio',
      description: 'Go to the Google AI Studio website to get your API key.',
      link: 'https://aistudio.google.com/app/apikey',
      buttonText: 'Open Google AI Studio',
    },
    {
      title: '2. Create API Key',
      description: 'Click on "Create API Key" and copy the generated key.',
      code: 'AIza...',
    },
    {
      title: '3. Save API Key',
      description: 'Paste your API key below to start creating quizzes.',
    },
  ];
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Key className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Gemini API Key Setup</h2>
        </div>
      </CardHeader>
      
      <CardBody className="space-y-8">
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-purple-800">
            To generate quizzes, you'll need a Gemini API key. Follow these steps to get started:
          </p>
        </div>
        
        <div className="space-y-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">{index + 1}</span>
              </div>
              
              <div className="flex-grow">
                <h3 className="font-medium text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 mb-3">{step.description}</p>
                
                {step.link && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(step.link, '_blank')}
                    className="group"
                  >
                    {step.buttonText}
                    <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
                
                {step.code && (
                  <div className="bg-gray-100 p-3 rounded-md font-mono text-sm relative group">
                    <code className="text-gray-800">{step.code}</code>
                    <button
                      onClick={() => copyToClipboard(step.code)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Your API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Gemini API key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
              isFullWidth
              className="font-mono"
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm font-medium py-2 px-3 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </form>
      </CardBody>
      
      <CardFooter className="flex justify-end bg-gray-50">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading || !key}
          className="min-w-[120px]"
        >
          {isLoading ? 'Generating...' : 'Save API Key'}
          <Save className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyForm;