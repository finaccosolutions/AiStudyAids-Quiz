import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Brain, Users, Mail, Plus, X, Crown, 
  Clock, Target, Sparkles, AlertTriangle,
  CheckCircle2, Globe, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompetitionPreferencesFormProps {
  onCreateCompetition: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CompetitionPreferencesForm: React.FC<CompetitionPreferencesFormProps> = ({
  onCreateCompetition,
  onCancel,
  isLoading
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Competition Details
    title: '',
    description: '',
    maxParticipants: 4,
    
    // Quiz Settings (simplified for competition)
    course: '',
    topic: '',
    questionCount: 10,
    difficulty: 'medium',
    language: 'English',
    timePerQuestion: 30,
    
    // Invitations
    emails: ['']
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Competition title is required';
    }
    
    if (!formData.course.trim()) {
      newErrors.course = 'Course/Subject is required';
    }
    
    if (formData.maxParticipants < 2 || formData.maxParticipants > 20) {
      newErrors.maxParticipants = 'Participants must be between 2 and 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    const validEmails = formData.emails.filter(email => email.trim());
    
    // Check email format
    validEmails.forEach((email, index) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors[`email_${index}`] = 'Invalid email format';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const validEmails = formData.emails.filter(email => email.trim());
    
    const competitionData = {
      title: formData.title,
      description: formData.description,
      maxParticipants: formData.maxParticipants,
      quizPreferences: {
        course: formData.course,
        topic: formData.topic,
        questionCount: formData.questionCount,
        difficulty: formData.difficulty,
        language: formData.language,
        timeLimit: formData.timePerQuestion.toString(),
        timeLimitEnabled: true,
        mode: 'exam',
        questionTypes: ['multiple-choice', 'true-false', 'short-answer']
      },
      emails: validEmails
    };
    
    onCreateCompetition(competitionData);
  };

  const addEmailField = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmailField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const updateEmail = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create Competition</h2>
                <p className="text-gray-600">Set up your quiz competition</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-6 flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="font-medium">Competition Setup</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="font-medium">Invite Participants</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Competition Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Competition Title *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Computer Science Challenge"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full ${errors.title ? 'border-red-500' : ''}`}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      placeholder="Describe your competition..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course/Subject *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={formData.course}
                      onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                      className={`w-full ${errors.course ? 'border-red-500' : ''}`}
                    />
                    {errors.course && (
                      <p className="mt-1 text-sm text-red-600">{errors.course}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Data Structures"
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Questions
                    </label>
                    <Select
                      options={[
                        { value: '5', label: '5 Questions (Quick)' },
                        { value: '10', label: '10 Questions (Standard)' },
                        { value: '15', label: '15 Questions (Extended)' },
                        { value: '20', label: '20 Questions (Comprehensive)' }
                      ]}
                      value={formData.questionCount.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <Select
                      options={[
                        { value: 'easy', label: 'Easy' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'hard', label: 'Hard' }
                      ]}
                      value={formData.difficulty}
                      onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time per Question
                    </label>
                    <Select
                      options={[
                        { value: '15', label: '15 seconds (Lightning)' },
                        { value: '30', label: '30 seconds (Standard)' },
                        { value: '45', label: '45 seconds (Relaxed)' },
                        { value: '60', label: '60 seconds (Extended)' }
                      ]}
                      value={formData.timePerQuestion.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, timePerQuestion: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Participants
                    </label>
                    <Input
                      type="number"
                      min={2}
                      max={20}
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                      className={`w-full ${errors.maxParticipants ? 'border-red-500' : ''}`}
                    />
                    {errors.maxParticipants && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxParticipants}</p>
                    )}
                  </div>
                </div>

                {/* Competition Rules Preview */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Competition Rules
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Mode:</span>
                      <span className="ml-2">Exam (Results at end)</span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Time/Question:</span>
                      <span className="ml-2">{formData.timePerQuestion}s</span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Questions:</span>
                      <span className="ml-2">{formData.questionCount}</span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Scoring:</span>
                      <span className="ml-2">Real-time ranking</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Invite Participants</h3>
                  <p className="text-gray-600">
                    Add email addresses to send invitations. Participants can also join using the competition code.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-blue-800 font-medium">Competition Access</p>
                      <p className="text-blue-700 text-sm mt-1">
                        After creation, you'll get a unique competition code that anyone can use to join. 
                        Email invitations are optional but recommended for better organization.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Participant Email Addresses (Optional)
                  </label>
                  
                  {formData.emails.map((email, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="email"
                          placeholder="participant@example.com"
                          value={email}
                          onChange={(e) => updateEmail(index, e.target.value)}
                          className={`pl-10 ${errors[`email_${index}`] ? 'border-red-500' : ''}`}
                        />
                        {errors[`email_${index}`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`email_${index}`]}</p>
                        )}
                      </div>
                      {formData.emails.length > 1 && (
                        <Button
                          variant="ghost"
                          onClick={() => removeEmailField(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEmailField}
                    className="w-full border-dashed border-2 hover:border-purple-300 hover:bg-purple-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Email
                  </Button>
                </div>

                {/* Competition Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Competition Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Title:</span>
                      <span className="font-medium">{formData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Subject:</span>
                      <span className="font-medium">{formData.course}</span>
                    </div>
                    {formData.topic && (
                      <div className="flex justify-between">
                        <span className="text-purple-700">Topic:</span>
                        <span className="font-medium">{formData.topic}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-purple-700">Questions:</span>
                      <span className="font-medium">{formData.questionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Max Participants:</span>
                      <span className="font-medium">{formData.maxParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Invitations:</span>
                      <span className="font-medium">
                        {formData.emails.filter(email => email.trim()).length} emails
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={step === 1 ? onCancel : () => setStep(1)}
              disabled={isLoading}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isLoading}
              className="gradient-bg min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : step === 1 ? (
                'Next: Invitations'
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Create Competition
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompetitionPreferencesForm;