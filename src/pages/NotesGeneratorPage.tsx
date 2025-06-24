import React, { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStudyAidsStore } from '../store/useStudyAidsStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { 
  Upload, FileText, BookOpen, Brain, 
  ListChecks, FileSpreadsheet, FileBox,
  Sparkles, Loader2, Download, Copy,
  CheckCircle2, ChevronDown, ChevronUp,
  GraduationCap, Lightbulb, Trash2, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OutputFormat {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  description: string;
}

const outputFormats: OutputFormat[] = [
  {
    id: 'summary',
    label: 'Concise Summary',
    icon: FileText,
    description: 'Get a clear, condensed version of the content'
  },
  {
    id: 'key_points',
    label: 'Key Points',
    icon: ListChecks,
    description: 'Extract main concepts and important points'
  },
  {
    id: 'mind_map',
    label: 'Mind Map',
    icon: FileSpreadsheet,
    description: 'Visual representation of concepts and relationships'
  },
  {
    id: 'questions',
    label: 'Practice Questions',
    icon: Brain,
    description: 'Generate questions to test understanding'
  },
  {
    id: 'definitions',
    label: 'Terms & Definitions',
    icon: FileBox,
    description: 'List of important terms and their meanings'
  }
];

const NotesGeneratorPage: React.FC = () => {
  const { user } = useAuthStore();
  const { createNote, deleteNote, notes, isLoading, error, loadNotes } = useStudyAidsStore();
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [source, setSource] = useState<'text' | 'pdf'>('text');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['summary']);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [showContent, setShowContent] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      loadNotes(user.id);
    }
  }, [user, loadNotes]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev => {
      if (prev.includes(formatId)) {
        return prev.filter(id => id !== formatId);
      }
      return [...prev, formatId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!content && !file) || selectedFormats.length === 0 || !subject) return;

    try {
      // Create a plain object with the data
      const noteData = {
        course: subject, // Map subject to course for database
        topic: topic || null,
        source,
        content: source === 'text' ? content : null,
        file: source === 'pdf' ? file : null,
        output_format: selectedFormats,
        language: 'English' // Default language
      };

      await createNote(user.id, noteData);
      
      // Reset form after successful submission
      setContent('');
      setFile(null);
      setSubject('');
      setTopic('');
      setSelectedFormats(['summary']);
      setSource('text');
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        await deleteNote(user.id, noteId);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  const toggleContent = (id: string) => {
    setShowContent(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ [id]: true });
      setTimeout(() => setCopied({}), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadNote = (note: any) => {
    let content = `${note.course}${note.topic ? ` - ${note.topic}` : ''}\n`;
    content += `Generated on ${new Date(note.created_at).toLocaleDateString()}\n\n`;
    
    if (note.generated_content.summary) {
      content += `SUMMARY:\n${note.generated_content.summary}\n\n`;
    }
    
    if (note.generated_content.keyPoints) {
      content += `KEY POINTS:\n`;
      note.generated_content.keyPoints.forEach((point: string, index: number) => {
        content += `${index + 1}. ${point}\n`;
      });
      content += '\n';
    }
    
    if (note.generated_content.definitions) {
      content += `DEFINITIONS:\n`;
      note.generated_content.definitions.forEach((def: any) => {
        content += `${def.term}: ${def.definition}\n`;
      });
      content += '\n';
    }
    
    if (note.generated_content.questions) {
      content += `PRACTICE QUESTIONS:\n`;
      note.generated_content.questions.forEach((q: any, index: number) => {
        content += `Q${index + 1}: ${q.question}\n`;
        content += `A: ${q.answer}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.course}_${note.topic || 'notes'}_${new Date(note.created_at).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-purple-600" />
            Smart Notes Generator
          </h1>
          <p className="mt-2 text-gray-600">
            Transform your study materials into organized, digestible formats
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Generate Notes</h2>
              </div>
            </CardHeader>
            
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
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
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    type="button"
                    onClick={() => setSource('text')}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      source === 'text' 
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
                        : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                    }`}
                    whileHover={{ scale: source === 'text' ? 1.02 : 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FileText className={`w-8 h-8 mx-auto mb-3 transition-colors duration-300 ${
                      source === 'text' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <span className="block text-sm font-medium">Paste Text</span>
                    <p className="text-xs text-gray-500 mt-2">
                      Copy and paste your study material
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
                      Upload your study materials
                    </p>
                  </motion.button>
                </div>

                {source === 'text' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Study Material *
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Paste your study material here..."
                      className="w-full h-48 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                      required={source === 'text'}
                    />
                  </div>
                ) : (
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
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFile(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required={source === 'pdf'}
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
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Output Formats *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {outputFormats.map((format) => (
                      <motion.button
                        key={format.id}
                        type="button"
                        onClick={() => toggleFormat(format.id)}
                        className={`p-4 rounded-xl text-left transition-all duration-300 ${
                          selectedFormats.includes(format.id)
                            ? 'bg-purple-50 border-2 border-purple-500 shadow-md'
                            : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <format.icon className={`w-5 h-5 ${
                            selectedFormats.includes(format.id) ? 'text-purple-600' : 'text-gray-400'
                          }`} />
                          {selectedFormats.includes(format.id) && (
                            <CheckCircle2 className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium block">{format.label}</span>
                          <p className="text-xs text-gray-500 mt-1">{format.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || (!content && !file) || selectedFormats.length === 0 || !subject}
                  className="w-full gradient-bg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Notes
                    </>
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>
        </motion.div>

        {/* Generated Notes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Generated Notes</h2>
              </div>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-4">
                {notes.map((note: any) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <Lightbulb className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {note.course} {note.topic && `- ${note.topic}`}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(note.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {note.output_format.map((format: string) => {
                          const formatInfo = outputFormats.find(f => f.id === format);
                          return formatInfo ? (
                            <span
                              key={format}
                              className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1"
                            >
                              <formatInfo.icon className="w-3 h-3" />
                              {formatInfo.label}
                            </span>
                          ) : null;
                        })}
                      </div>

                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleContent(note.id)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          {showContent[note.id] ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Content
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show Content
                            </>
                          )}
                        </Button>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(note.generated_content, null, 2), note.id)}
                            className={`transition-colors ${
                              copied[note.id]
                                ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                            }`}
                          >
                            {copied[note.id] ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadNote(note)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showContent[note.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <div className="space-y-6">
                              {note.generated_content.summary && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                                  <p className="text-gray-700 whitespace-pre-wrap">
                                    {note.generated_content.summary}
                                  </p>
                                </div>
                              )}

                              {note.generated_content.keyPoints && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Key Points</h4>
                                  <ul className="space-y-2">
                                    {note.generated_content.keyPoints.map((point: string, index: number) => (
                                      <li key={index} className="flex items-start space-x-2">
                                        <div className="mt-1">
                                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        </div>
                                        <span className="text-gray-700">{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {note.generated_content.mindMap && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Mind Map</h4>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-center mb-4">
                                      <div className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium">
                                        {note.generated_content.mindMap.central}
                                      </div>
                                    </div>
                                    {note.generated_content.mindMap.branches && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {note.generated_content.mindMap.branches.map((branch: any, index: number) => (
                                          <div key={index} className="bg-white p-3 rounded-lg">
                                            <h5 className="font-medium text-gray-800 mb-2">{branch.name}</h5>
                                            <ul className="space-y-1">
                                              {branch.subtopics?.map((subtopic: string, i: number) => (
                                                <li key={i} className="text-sm text-gray-600">• {subtopic}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {note.generated_content.questions && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Practice Questions</h4>
                                  <div className="space-y-4">
                                    {note.generated_content.questions.map((q: any, index: number) => (
                                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                        <p className="font-medium text-gray-900 mb-2">Q: {q.question}</p>
                                        <p className="text-gray-700">A: {q.answer}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {note.generated_content.definitions && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Terms & Definitions</h4>
                                  <div className="space-y-3">
                                    {note.generated_content.definitions.map((def: any, index: number) => (
                                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                        <span className="font-medium text-purple-600">{def.term}:</span>
                                        <span className="text-gray-700 ml-2">{def.definition}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}

                {notes.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Notes Generated Yet
                    </h3>
                    <p className="text-gray-600">
                      Start by uploading content or pasting text to generate smart notes
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default NotesGeneratorPage;