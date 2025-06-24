import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore } from '../store/useQuizStore';
import { Card, CardBody, CardHeader, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { 
  Upload, BookOpen, FileText, Plus, Search, 
  CheckCircle2, AlertTriangle, Download, Eye,
  Clock, Calendar, Brain, Loader2, History,
  FileQuestion, Archive, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionBank {
  id: string;
  course: string;
  topic?: string;
  subtopic?: string;
  difficulty: string;
  language: string;
  questionTypes: string[];
  source: 'manual' | 'pdf';
  pdfUrl?: string;
  questions: any[];
  createdAt: string;
}

const QuestionBankPage: React.FC = () => {
  const { user } = useAuthStore();
  const { apiKey } = useQuizStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [source, setSource] = useState<'manual' | 'pdf'>('manual');
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showPreviousYearForm, setShowPreviousYearForm] = useState(false);
  const [yearCount, setYearCount] = useState(5);
  
  const [preferences, setPreferences] = useState({
    course: '',
    topic: '',
    subtopic: '',
    difficulty: 'medium',
    language: 'English',
    questionTypes: ['multiple-choice'],
    questionCount: 10
  });

  const questionTypeOptions = [
    { 
      value: 'multiple-choice', 
      label: 'Multiple Choice',
      description: 'Select one correct answer from multiple options'
    },
    { 
      value: 'multi-select', 
      label: 'Select All That Apply',
      description: 'Choose multiple correct options'
    },
    { 
      value: 'true-false', 
      label: 'True/False',
      description: 'Determine if a statement is true or false'
    },
    { 
      value: 'fill-blank', 
      label: 'Fill in the Blank',
      description: 'Complete sentences with missing words'
    },
    { 
      value: 'short-answer', 
      label: 'Short Answer',
      description: 'Provide brief 1-2 word answers'
    },
    { 
      value: 'sequence', 
      label: 'Sequence/Ordering',
      description: 'Arrange items in the correct order'
    },
    { 
      value: 'case-study', 
      label: 'Case Study',
      description: 'Analyze real-world scenarios and answer questions'
    },
    { 
      value: 'situation', 
      label: 'Situation Judgment',
      description: 'Choose the best action in given scenarios'
    }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' }
  ];

  useEffect(() => {
    if (user) {
      loadQuestionBanks();
    }
  }, [user]);

  const loadQuestionBanks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/question_banks?user_id=eq.${user?.id}`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      const data = await response.json();
      setQuestionBanks(data);
    } catch (error) {
      console.error('Error loading question banks:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !apiKey) return;

    setIsLoading(true);
    setError(null);

    try {
      let content = '';
      if (source === 'pdf' && file) {
        // Extract text from PDF using Vision API
        const formData = new FormData();
        formData.append('file', file);
        formData.append('apiKey', apiKey);
        
        const visionResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vision`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: formData
        });

        if (!visionResponse.ok) {
          throw new Error('Failed to process PDF');
        }

        const visionData = await visionResponse.json();
        content = visionData.text;
      }

      // Generate questions using Gemini
      const prompt = `Generate ${preferences.questionCount} ${preferences.difficulty} difficulty questions about ${preferences.course}${preferences.topic ? ` - ${preferences.topic}` : ''}${preferences.subtopic ? ` (${preferences.subtopic})` : ''} in ${preferences.language}.

Question types to include: ${preferences.questionTypes.join(', ')}

${source === 'pdf' ? `Use this content as reference:\n${content}` : ''}

Format each question as a JSON object with:
- text: question text
- type: question type
- options: array of possible answers (for multiple choice)
- correctAnswer: the correct answer
- explanation: detailed explanation of the answer

Return the questions as a JSON array.`;

      const geminiResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ prompt, apiKey })
      });

      if (!geminiResponse.ok) {
        throw new Error('Failed to generate questions');
      }

      const questions = await geminiResponse.json();

      // Save to database
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/question_banks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user_id: user.id,
          course: preferences.course,
          topic: preferences.topic,
          subtopic: preferences.subtopic,
          difficulty: preferences.difficulty,
          language: preferences.language,
          question_types: preferences.questionTypes,
          source,
          pdf_url: source === 'pdf' && file ? URL.createObjectURL(file) : null,
          questions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save question bank');
      }

      await loadQuestionBanks();
      setShowForm(false);
      setFile(null);
      setPreferences({
        course: '',
        topic: '',
        subtopic: '',
        difficulty: 'medium',
        language: 'English',
        questionTypes: ['multiple-choice'],
        questionCount: 10
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePreviousYearBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !apiKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Generate ${preferences.questionCount} previous year questions from the past ${yearCount} years about ${preferences.course}${preferences.topic ? ` - ${preferences.topic}` : ''} in ${preferences.language}.

Question type: ${preferences.questionTypes[0]}

Format each question as a JSON object with:
- text: question text
- type: question type
- options: array of possible answers (for multiple choice)
- correctAnswer: the correct answer
- explanation: detailed explanation of the answer
- year: the year this question appeared

Return the questions as a JSON array.`;

      const geminiResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ prompt, apiKey })
      });

      if (!geminiResponse.ok) {
        throw new Error('Failed to generate previous year questions');
      }

      const questions = await geminiResponse.json();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/question_banks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user_id: user.id,
          course: preferences.course,
          topic: preferences.topic || 'Previous Year Questions',
          subtopic: `Last ${yearCount} years`,
          difficulty: preferences.difficulty,
          language: preferences.language,
          question_types: preferences.questionTypes,
          source: 'manual',
          questions
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save question bank');
      }

      await loadQuestionBanks();
      setShowPreviousYearForm(false);
      setPreferences({
        course: '',
        topic: '',
        subtopic: '',
        difficulty: 'medium',
        language: 'English',
        questionTypes: ['multiple-choice'],
        questionCount: 10
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (bank: QuestionBank) => {
    let content = `${bank.course} - ${bank.topic || 'General'}\n`;
    content += `Generated on ${new Date(bank.createdAt).toLocaleDateString()}\n\n`;
    
    bank.questions.forEach((q: any, i: number) => {
      content += `Question ${i + 1}: ${q.text}\n`;
      if (q.options) {
        content += 'Options:\n';
        q.options.forEach((opt: string) => {
          content += `- ${opt}\n`;
        });
      }
      content += `\nCorrect Answer: ${q.correctAnswer}\n`;
      content += `Explanation: ${q.explanation}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bank.course}_${bank.topic || 'questions'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filteredBanks = questionBanks.filter(bank => 
    bank.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.subtopic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank Generator</h1>
          <p className="mt-2 text-gray-600">
            Create and manage your question banks powered by AI
          </p>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            onClick={() => setShowForm(true)}
            className="gradient-bg hover:opacity-90 transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Bank
          </Button>
          
          <Button 
            onClick={() => setShowPreviousYearForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <History className="w-5 h-5 mr-2" />
            Previous Year Questions
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search question banks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <Button
          variant="outline"
          onClick={() => {/* Add filter logic */}}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Previous Year Questions Form */}
      {showPreviousYearForm && (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Archive className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Get Previous Year Questions</h2>
            </div>
          </CardHeader>
          
          <CardBody>
            <form onSubmit={handleCreatePreviousYearBank} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={preferences.course}
                    onChange={(e) => setPreferences({ ...preferences, course: e.target.value })}
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Data Structures"
                    value={preferences.topic}
                    onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Years
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={yearCount}
                    onChange={(e) => setYearCount(parseInt(e.target.value))}
                    required
                    className="w-full"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Get questions from the past 1-20 years
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type
                  </label>
                  <Select
                    options={[
                      { value: 'multiple-choice', label: 'Multiple Choice' },
                      { value: 'essay', label: 'Essay/Long Answer' },
                      { value: 'short-answer', label: 'Short Answer' }
                    ]}
                    value={preferences.questionTypes[0]}
                    onChange={(e) => setPreferences({ ...preferences, questionTypes: [e.target.value] })}
                    className="w-full"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreviousYearForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gradient-bg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileQuestion className="w-5 h-5 mr-2" />
                      Get Questions
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Main Question Bank Form */}
      {showForm ? (
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-xl font-semibold">Generate Questions</h2>
            <p className="text-gray-600">
              Create a new question bank from text or PDF
            </p>
          </CardHeader>
          
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => setSource('manual')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    source === 'manual' 
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                  }`}
                  whileHover={{ scale: source === 'manual' ? 1.02 : 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FileText className={`w-8 h-8 mx-auto mb-3 transition-colors duration-300 ${
                    source === 'manual' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <span className="block text-sm font-medium">Manual Input</span>
                  <p className="text-xs text-gray-500 mt-2">
                    Create questions by providing course and topic details
                  </p>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setSource('pdf')}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    source === 'pdf' 
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                  }`}
                  whileHover={{ scale: source === 'pdf' ? 1.02 : 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors duration-300 ${
                    source === 'pdf' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <span className="block text-sm font-medium">Upload PDF</span>
                  <p className="text-xs text-gray-500 mt-2">
                    Generate questions from your study materials
                  </p>
                </motion.button>
              </div>

              <AnimatePresence mode="wait">
                {source === 'manual' ? (
                  <motion.div
                    key="manual-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Course
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Computer Science"
                          value={preferences.course}
                          onChange={(e) => setPreferences({ ...preferences, course: e.target.value })}
                          required
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Topic (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Data Structures"
                          value={preferences.topic}
                          onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sub-topic (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Binary Trees"
                          value={preferences.subtopic}
                          onChange={(e) => setPreferences({ ...preferences, subtopic: e.target.value })}
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Questions
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={preferences.questionCount}
                          onChange={(e) => setPreferences({ ...preferences, questionCount: parseInt(e.target.value) })}
                          required
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Difficulty Level
                        </label>
                        <Select
                          options={difficultyOptions}
                          value={preferences.difficulty}
                          onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Language
                        </label>
                        <Select
                          options={languageOptions}
                          value={preferences.language}
                          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Question Types
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {questionTypeOptions.map((type) => (
                          <motion.button
                            key={type.value}
                            type="button"
                            onClick={() => {
                              const newTypes = preferences.questionTypes.includes(type.value)
                                ? preferences.questionTypes.filter(t => t !== type.value)
                                : [...preferences.questionTypes, type.value];
                              setPreferences({ ...preferences, questionTypes: newTypes });
                            }}
                            className={`p-4 rounded-xl text-left transition-all duration-300 ${
                              preferences.questionTypes.includes(type.value)
                                ? 'bg-purple-50 border-2 border-purple-500 shadow-md'
                                : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{type.label}</span>
                              {preferences.questionTypes.includes(type.value) && (
                                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pdf-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                        dragActive
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-4">
                        <Upload className={`w-12 h-12 mx-auto ${
                          file ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        {file ? (
                          <>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              Click or drag another file to replace
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              Drop your PDF here or click to upload
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF files up to 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Course
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Computer Science"
                          value={preferences.course}
                          onChange={(e) => setPreferences({ ...preferences, course: e.target.value })}
                          required
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Topic (Optional)
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Data Structures"
                          value={preferences.topic}
                          onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Questions
                        </label>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={preferences.questionCount}
                          onChange={(e) => setPreferences({ ...preferences, questionCount: parseInt(e.target.value) })}
                          required
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Language
                        </label>
                        <Select
                          options={languageOptions}
                          value={preferences.language}
                          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !preferences.course || preferences.questionTypes.length === 0 || (source === 'pdf' && !file)}
                  className="gradient-bg px-6 min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredBanks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No question banks found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Create your first question bank to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBanks.map((bank) => (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">{bank.course}</h3>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        bank.difficulty === 'easy' 
                          ? 'bg-green-100 text-green-800'
                          : bank.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bank.difficulty}
                      </span>
                    </div>

                    {bank.topic && (
                      <p className="text-sm text-gray-600 mb-2">{bank.topic}</p>
                    )}
                    {bank.subtopic && (
                      <p className="text-sm text-gray-500 mb-2">{bank.subtopic}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {bank.questionTypes.map((type) => (
                        <span
                          key={type}
                          className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700"
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(bank.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {bank.questions.length} questions
                      </span>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBank(bank)}
                        className="hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(bank)}
                        className="hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedBank.course}
                  </h2>
                  {selectedBank.topic && (
                    <p className="text-gray-600">{selectedBank.topic}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedBank(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {selectedBank.questions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <p className="font-medium text-gray-900 mb-4">
                    {index + 1}. {question.text}
                  </p>

                  {question.options && (
                    <div className="space-y-2 mb-4">
                      {question.options.map((option: string, i: number) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg transition-colors ${
                            option === question.correctAnswer
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          {option}
                          {option === question.correctAnswer && (
                            <CheckCircle2 className="inline-block w-4 h-4 ml-2 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-900">
                      <span className="font-medium">Explanation: </span>
                      {question.explanation}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankPage;