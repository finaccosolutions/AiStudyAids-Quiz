import React, { useState, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuthStore } from '../store/useAuthStore';
import { useStudyAidsStore } from '../store/useStudyAidsStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, 
  BarChart, Download, Eye, Clock, Brain, 
  Loader2, BookOpen, GraduationCap, Target,
  ChevronDown, ChevronUp, Sparkles, Plus,
  FileQuestion, PenTool, RefreshCw, X, Image as ImageIcon, 
  Type, Save, Trash2, Edit2, Award, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';

interface Question {
  id: string;
  text: string;
  marks: number;
  answer?: string;
  imageAnswer?: File | null;
  explanation?: string;
}

interface EvaluationResult {
  id: string;
  score: number;
  totalMarks: number;
  percentage: number;
  feedback: string;
  improvements: string[];
  questionAnalysis: {
    questionNumber: number;
    question: string;
    studentAnswer: string;
    score: number;
    maxMarks: number;
    feedback: string;
    mistakes: string[];
    suggestions: string[];
  }[];
  evaluatedAt: string;
}

type EvaluationMode = 'generate' | 'custom' | 'upload';

const AnswerEvaluationPage: React.FC = () => {
  const { user } = useAuthStore();
  const { evaluations, isLoading } = useStudyAidsStore();
  const [mode, setMode] = useState<EvaluationMode>('generate');
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Generate Questions Mode State
  const [generateForm, setGenerateForm] = useState({
    subject: '',
    topic: '',
    questionCount: 5,
    difficulty: 'medium',
    language: 'English'
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  // Custom Questions Mode State
  const [customQuestions, setCustomQuestions] = useState<Question[]>([
    { id: '1', text: '', marks: 10, answer: '' }
  ]);

  // Upload Mode State
  const [uploadFiles, setUploadFiles] = useState({
    questionPaper: null as File | null,
    answerSheet: null as File | null
  });

  // Results State
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<EvaluationResult | null>(null);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  // Quill modules for rich text editor
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      ['clean']
    ],
  };

  useEffect(() => {
    const loadApiKey = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('api_keys')
          .select('gemini_api_key')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data) setApiKey(data.gemini_api_key);
      } catch (error) {
        console.error('Error loading API key:', error);
        setError('Failed to load API key. Please check your API settings.');
      }
    };

    loadApiKey();
    loadEvaluationHistory();
  }, [user]);

  const loadEvaluationHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('answer_evaluations')
        .select('*')
        .eq('user_id', user.id)
        .order('evaluated_at', { ascending: false });

      if (error) throw error;
      
      // Transform database results to match EvaluationResult interface
      const transformedResults = (data || []).map((dbResult: any) => ({
        id: dbResult.id,
        score: typeof dbResult.score === 'number' ? dbResult.score : 0,
        totalMarks: 100, // Default total marks
        percentage: typeof dbResult.score === 'number' ? dbResult.score : 0,
        feedback: dbResult.feedback || '',
        improvements: dbResult.improvements || [],
        questionAnalysis: [], // Database doesn't store detailed analysis
        evaluatedAt: dbResult.evaluated_at
      }));
      
      setEvaluationResults(transformedResults);
    } catch (error) {
      console.error('Error loading evaluation history:', error);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!user || !apiKey) return;

    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-subjective-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          subject: generateForm.subject,
          topic: generateForm.topic,
          questionCount: generateForm.questionCount,
          difficulty: generateForm.difficulty,
          language: generateForm.language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response format');
      }

      const questionsWithIds = data.questions.map((q: any, index: number) => ({
        id: `gen-${Date.now()}-${index}`,
        text: q.text,
        marks: q.marks || 10,
        answer: '',
        explanation: q.explanation
      }));

      setGeneratedQuestions(questionsWithIds);
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate questions');
    }
  };

  const handleAddCustomQuestion = () => {
    const newQuestion: Question = {
      id: `custom-${Date.now()}`,
      text: '',
      marks: 10,
      answer: ''
    };
    setCustomQuestions([...customQuestions, newQuestion]);
  };

  const handleRemoveCustomQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== id));
  };

  const handleUpdateCustomQuestion = (id: string, field: string, value: string | number) => {
    setCustomQuestions(customQuestions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent, fileType: 'questionPaper' | 'answerSheet') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFiles(prev => ({
        ...prev,
        [fileType]: e.dataTransfer.files[0]
      }));
    }
  };

  const handleFileChange = (file: File | null, fileType: 'questionPaper' | 'answerSheet') => {
    setUploadFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
  };

  const handleEvaluateAnswers = async () => {
    if (!user || !apiKey) return;
    setError(null);

    try {
      let questionsToEvaluate: Question[] = [];
      let evaluationData: any = {};

      if (mode === 'generate') {
        questionsToEvaluate = generatedQuestions;
        evaluationData = {
          mode: 'generate',
          subject: generateForm.subject,
          topic: generateForm.topic,
          questions: questionsToEvaluate.map(q => ({
            question: q.text,
            answer: q.answer,
            marks: q.marks
          }))
        };
      } else if (mode === 'custom') {
        questionsToEvaluate = customQuestions;
        evaluationData = {
          mode: 'custom',
          questions: questionsToEvaluate.map(q => ({
            question: q.text,
            answer: q.answer,
            marks: q.marks
          }))
        };
      } else if (mode === 'upload') {
        if (!uploadFiles.questionPaper || !uploadFiles.answerSheet) {
          throw new Error('Please upload both question paper and answer sheet');
        }

        // Upload files to storage
        const questionPaperPath = `${user.id}/question-papers/${Date.now()}-${uploadFiles.questionPaper.name}`;
        const answerSheetPath = `${user.id}/answer-sheets/${Date.now()}-${uploadFiles.answerSheet.name}`;

        const { error: questionUploadError } = await supabase.storage
          .from('evaluations')
          .upload(questionPaperPath, uploadFiles.questionPaper);

        if (questionUploadError) throw questionUploadError;

        const { error: answerUploadError } = await supabase.storage
          .from('evaluations')
          .upload(answerSheetPath, uploadFiles.answerSheet);

        if (answerUploadError) throw answerUploadError;

        evaluationData = {
          mode: 'upload',
          questionPaperPath,
          answerSheetPath
        };
      }

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate-subjective-answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(evaluationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Save evaluation result to database
      const { error: saveError } = await supabase
        .from('answer_evaluations')
        .insert({
          user_id: user.id,
          score: result.percentage || 0,
          feedback: result.feedback || '',
          improvements: result.improvements || [],
          answer_sheet_url: mode === 'upload' ? evaluationData.answerSheetPath : null
        });

      if (saveError) throw saveError;

      // Create a properly formatted result object
      const newResult: EvaluationResult = {
        id: `temp-${Date.now()}`,
        score: result.percentage || 0,
        totalMarks: result.totalMarks || 100,
        percentage: result.percentage || 0,
        feedback: result.feedback || '',
        improvements: result.improvements || [],
        questionAnalysis: result.questionAnalysis || [],
        evaluatedAt: new Date().toISOString()
      };

      setEvaluationResults([newResult, ...evaluationResults]);
      
      // Reset forms
      if (mode === 'generate') {
        setGeneratedQuestions([]);
      } else if (mode === 'custom') {
        setCustomQuestions([{ id: '1', text: '', marks: 10, answer: '' }]);
      } else if (mode === 'upload') {
        setUploadFiles({ questionPaper: null, answerSheet: null });
      }

    } catch (error) {
      console.error('Error evaluating answers:', error);
      setError('Failed to evaluate answers. Please try again.');
    }
  };

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!apiKey) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">
              Please set up your Gemini API key in the API Settings page before using answer evaluation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            Answer Sheet Evaluation
          </h1>
          <p className="mt-2 text-gray-600">
            Get detailed AI feedback on your subjective answers with multiple evaluation modes
          </p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
            mode === 'generate' 
              ? 'border-purple-500 bg-purple-50 shadow-lg' 
              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
          }`}
          onClick={() => setMode('generate')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-purple-100 rounded-full mb-4">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Questions by Topic</h3>
            <p className="text-sm text-gray-600">
              AI creates questions based on your topic, then you answer and get evaluated
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
            mode === 'custom' 
              ? 'border-purple-500 bg-purple-50 shadow-lg' 
              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
          }`}
          onClick={() => setMode('custom')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-purple-100 rounded-full mb-4">
              <Type className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">I Have My Own Questions</h3>
            <p className="text-sm text-gray-600">
              Add your own questions and answers for personalized evaluation
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
            mode === 'upload' 
              ? 'border-purple-500 bg-purple-50 shadow-lg' 
              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
          }`}
          onClick={() => setMode('upload')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-purple-100 rounded-full mb-4">
              <Upload className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Question + Answer Sheets</h3>
            <p className="text-sm text-gray-600">
              Upload PDF files of question paper and your answer sheet for evaluation
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mode Content */}
      <AnimatePresence mode="wait">
        {mode === 'generate' && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold">Generate Questions by Topic</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={generateForm.subject}
                      onChange={(e) => setGenerateForm({ ...generateForm, subject: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Data Structures"
                      value={generateForm.topic}
                      onChange={(e) => setGenerateForm({ ...generateForm, topic: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Questions
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={generateForm.questionCount}
                      onChange={(e) => setGenerateForm({ ...generateForm, questionCount: parseInt(e.target.value) })}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <Select
                      value={generateForm.difficulty}
                      onChange={(e) => setGenerateForm({ ...generateForm, difficulty: e.target.value })}
                      options={[
                        { value: 'easy', label: 'Easy' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'hard', label: 'Hard' }
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateQuestions}
                  disabled={isLoading || !generateForm.subject || !generateForm.topic}
                  className="w-full gradient-bg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>
              </CardBody>
            </Card>

            {generatedQuestions.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Answer the Questions</h3>
                {generatedQuestions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader className="bg-gray-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-900">
                          Question {index + 1} <span className="text-sm text-gray-500">({question.marks} marks)</span>
                        </h4>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: question.text }} />
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Answer
                          </label>
                          <ReactQuill
                            value={question.answer || ''}
                            onChange={(value) => {
                              setGeneratedQuestions(prev => 
                                prev.map(q => q.id === question.id ? { ...q, answer: value } : q)
                              );
                            }}
                            modules={quillModules}
                            theme="snow"
                            placeholder="Type your answer here..."
                            className="bg-white rounded-lg"
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}

                <Button
                  onClick={handleEvaluateAnswers}
                  disabled={isLoading || generatedQuestions.some(q => !q.answer?.trim())}
                  className="w-full gradient-bg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Evaluating Answers...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      Evaluate My Answers
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {mode === 'custom' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Type className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-semibold">Add Your Own Questions</h2>
                  </div>
                  <Button
                    onClick={handleAddCustomQuestion}
                    variant="outline"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {customQuestions.map((question, index) => (
                    <Card key={question.id} className="border border-gray-200">
                      <CardHeader className="bg-gray-50 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                          {customQuestions.length > 1 && (
                            <Button
                              onClick={() => handleRemoveCustomQuestion(question.id)}
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardBody>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Question Text
                            </label>
                            <ReactQuill
                              value={question.text}
                              onChange={(value) => handleUpdateCustomQuestion(question.id, 'text', value)}
                              modules={quillModules}
                              theme="snow"
                              placeholder="Enter your question..."
                              className="bg-white rounded-lg"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Marks
                              </label>
                              <Input
                                type="number"
                                min={1}
                                max={100}
                                value={question.marks}
                                onChange={(e) => handleUpdateCustomQuestion(question.id, 'marks', parseInt(e.target.value))}
                                className="w-full"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Your Answer
                            </label>
                            <ReactQuill
                              value={question.answer || ''}
                              onChange={(value) => handleUpdateCustomQuestion(question.id, 'answer', value)}
                              modules={quillModules}
                              theme="snow"
                              placeholder="Type your answer here..."
                              className="bg-white rounded-lg"
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}

                  <Button
                    onClick={handleEvaluateAnswers}
                    disabled={isLoading || customQuestions.some(q => !q.text?.trim() || !q.answer?.trim())}
                    className="w-full gradient-bg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Evaluating Answers...
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5 mr-2" />
                        Evaluate My Answers
                      </>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {mode === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <Upload className="h-6 w-6 text-purple-600" />
                  <h2 className="text-xl font-semibold">Upload Question Paper & Answer Sheet</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Question Paper Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Paper (PDF)
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={(e) => handleDrop(e, 'questionPaper')}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'questionPaper')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        <FileText className={`w-8 h-8 mx-auto ${
                          uploadFiles.questionPaper ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        {uploadFiles.questionPaper ? (
                          <>
                            <p className="text-sm font-medium text-gray-900">{uploadFiles.questionPaper.name}</p>
                            <p className="text-xs text-gray-500">Click to replace</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-900">Upload Question Paper</p>
                            <p className="text-xs text-gray-500">PDF files only</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Answer Sheet Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Sheet (PDF)
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={(e) => handleDrop(e, 'answerSheet')}
                    >
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'answerSheet')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        <PenTool className={`w-8 h-8 mx-auto ${
                          uploadFiles.answerSheet ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        {uploadFiles.answerSheet ? (
                          <>
                            <p className="text-sm font-medium text-gray-900">{uploadFiles.answerSheet.name}</p>
                            <p className="text-xs text-gray-500">Click to replace</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-900">Upload Answer Sheet</p>
                            <p className="text-xs text-gray-500">PDF files only</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleEvaluateAnswers}
                  disabled={isLoading || !uploadFiles.questionPaper || !uploadFiles.answerSheet}
                  className="w-full gradient-bg mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing & Evaluating...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      Evaluate Answer Sheet
                    </>
                  )}
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Evaluation Results */}
      {evaluationResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Award className="h-7 w-7 text-purple-600" />
              Evaluation Results
            </h2>
          </div>
          
          {evaluationResults.map((result) => (
            <Card key={result.id}>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        Evaluation - {new Date(result.evaluatedAt).toLocaleDateString()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {result.questionAnalysis?.length || 0} questions evaluated
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      (result.percentage || 0) >= 80 ? 'text-green-600' :
                      (result.percentage || 0) >= 60 ? 'text-blue-600' :
                      (result.percentage || 0) >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(result.percentage || 0).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600">
                      {result.score || 0}/{result.totalMarks || 100} marks
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Overall Feedback</h4>
                    <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: result.feedback || 'No feedback available' }} />
                  </div>

                  {result.improvements && result.improvements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Areas for Improvement</h4>
                      <ul className="space-y-2">
                        {result.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <span className="text-gray-700">{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.questionAnalysis && result.questionAnalysis.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">Question-wise Analysis</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDetails(result.id)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          {showDetails[result.id] ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show Details
                            </>
                          )}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {showDetails[result.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            {result.questionAnalysis.map((analysis, index) => (
                              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex justify-between items-start mb-3">
                                  <h5 className="font-medium text-gray-900">
                                    Question {analysis.questionNumber}
                                  </h5>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    ((analysis.score || 0) / (analysis.maxMarks || 1)) >= 0.8
                                      ? 'bg-green-100 text-green-700'
                                      : ((analysis.score || 0) / (analysis.maxMarks || 1)) >= 0.6
                                      ? 'bg-blue-100 text-blue-700'
                                      : ((analysis.score || 0) / (analysis.maxMarks || 1)) >= 0.4
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {analysis.score || 0}/{analysis.maxMarks || 0} marks
                                  </span>
                                </div>

                                <div className="prose max-w-none text-sm mb-3" dangerouslySetInnerHTML={{ __html: analysis.feedback || 'No feedback available' }} />
                                
                                {analysis.mistakes && analysis.mistakes.length > 0 && (
                                  <div className="mb-3">
                                    <h6 className="text-sm font-medium text-red-600 mb-1">Mistakes:</h6>
                                    <ul className="space-y-1 text-sm text-gray-700">
                                      {analysis.mistakes.map((mistake, i) => (
                                        <li key={i} className="flex items-start space-x-2">
                                          <X className="w-4 h-4 text-red-500 mt-0.5" />
                                          <span>{mistake}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {analysis.suggestions && analysis.suggestions.length > 0 && (
                                  <div>
                                    <h6 className="text-sm font-medium text-green-600 mb-1">Suggestions:</h6>
                                    <ul className="space-y-1 text-sm text-gray-700">
                                      {analysis.suggestions.map((suggestion, i) => (
                                        <li key={i} className="flex items-start space-x-2">
                                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                          <span>{suggestion}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnswerEvaluationPage;