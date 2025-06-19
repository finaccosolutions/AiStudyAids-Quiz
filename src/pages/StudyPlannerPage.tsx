import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useStudyAidsStore } from '../store/useStudyAidsStore';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { 
  Calendar, Clock, BookOpen, GraduationCap, 
  Brain, Target, CheckCircle2, AlertTriangle,
  BarChart3, Sparkles, Plus, Loader2, 
  CalendarDays, BookMarked, Trophy, Timer,
  ChevronDown, ChevronUp, Trash2, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Topic {
  name: string;
  subtopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number;
}

interface StudyPlan {
  id: string;
  course: string;
  syllabus: {
    topics: Topic[];
  };
  examDate: string;
  startDate: string;
  dailyHours: number;
  schedule: Array<{
    date: string;
    topics: Array<{
      name: string;
      subtopics: string[];
      duration: number;
      strategy: string;
      resources: string[];
    }>;
    revision: boolean;
    milestones: string[];
  }>;
  created_at: string;
  updated_at: string;
}

const StudyPlannerPage: React.FC = () => {
  const { user } = useAuthStore();
  const { studyPlans, loadStudyPlans, createStudyPlan, isLoading } = useStudyAidsStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  
  const [formData, setFormData] = useState({
    course: '',
    examDate: '',
    startDate: '',
    dailyHours: 4,
    topics: [{ name: '', subtopics: [''], difficulty: 'medium', estimatedHours: 2 }],
    schedule: [] as Array<{
      date: string;
      topics: Array<{
        name: string;
        subtopics: string[];
        duration: number;
        strategy: string;
        resources: string[];
      }>;
      revision: boolean;
      milestones: string[];
    }>
  });

  useEffect(() => {
    if (user) {
      loadStudyPlans(user.id);
    }
  }, [user]);

  const handleAddTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, { name: '', subtopics: [''], difficulty: 'medium', estimatedHours: 2 }]
    }));
  };

  const handleRemoveTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const handleAddSubtopic = (topicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => 
        i === topicIndex 
          ? { ...topic, subtopics: [...topic.subtopics, ''] }
          : topic
      )
    }));
  };

  const handleRemoveSubtopic = (topicIndex: number, subtopicIndex: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => 
        i === topicIndex 
          ? { 
              ...topic, 
              subtopics: topic.subtopics.filter((_, j) => j !== subtopicIndex)
            }
          : topic
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createStudyPlan(user.id, {
        ...formData,
        syllabus: { topics: formData.topics },
        schedule: formData.schedule
      });
      setShowForm(false);
      setFormData({
        course: '',
        examDate: '',
        startDate: '',
        dailyHours: 4,
        topics: [{ name: '', subtopics: [''], difficulty: 'medium', estimatedHours: 2 }],
        schedule: []
      });
    } catch (error) {
      console.error('Failed to create study plan:', error);
    }
  };

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-purple-600" />
            Study Planner
          </h1>
          <p className="mt-2 text-gray-600">
            Create personalized study schedules and track your progress
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="gradient-bg hover:opacity-90 transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Plan
        </Button>
      </div>

      {showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Create Study Plan</h2>
              </div>
            </CardHeader>
            
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course/Exam
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Study Hours
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={formData.dailyHours}
                      onChange={(e) => setFormData({ ...formData, dailyHours: parseInt(e.target.value) })}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Date
                    </label>
                    <Input
                      type="date"
                      value={formData.examDate}
                      onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Topics</h3>
                    <Button
                      type="button"
                      onClick={handleAddTopic}
                      variant="outline"
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Topic
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {formData.topics.map((topic, topicIndex) => (
                      <div
                        key={topicIndex}
                        className="bg-gray-50 p-4 rounded-lg space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-grow grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Topic Name
                              </label>
                              <Input
                                type="text"
                                placeholder="e.g., Data Structures"
                                value={topic.name}
                                onChange={(e) => {
                                  const newTopics = [...formData.topics];
                                  newTopics[topicIndex].name = e.target.value;
                                  setFormData({ ...formData, topics: newTopics });
                                }}
                                required
                                className="w-full"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Difficulty
                              </label>
                              <Select
                                options={[
                                  { value: 'easy', label: 'Easy' },
                                  { value: 'medium', label: 'Medium' },
                                  { value: 'hard', label: 'Hard' }
                                ]}
                                value={topic.difficulty}
                                onChange={(e) => {
                                  const newTopics = [...formData.topics];
                                  newTopics[topicIndex].difficulty = e.target.value as 'easy' | 'medium' | 'hard';
                                  setFormData({ ...formData, topics: newTopics });
                                }}
                                className="w-full"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estimated Hours
                              </label>
                              <Input
                                type="number"
                                min={1}
                                value={topic.estimatedHours}
                                onChange={(e) => {
                                  const newTopics = [...formData.topics];
                                  newTopics[topicIndex].estimatedHours = parseInt(e.target.value);
                                  setFormData({ ...formData, topics: newTopics });
                                }}
                                required
                                className="w-full"
                              />
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleRemoveTopic(topicIndex)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-700">Subtopics</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleAddSubtopic(topicIndex)}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Subtopic
                            </Button>
                          </div>

                          {topic.subtopics.map((subtopic, subtopicIndex) => (
                            <div key={subtopicIndex} className="flex items-center space-x-2">
                              <Input
                                type="text"
                                placeholder="e.g., Binary Trees"
                                value={subtopic}
                                onChange={(e) => {
                                  const newTopics = [...formData.topics];
                                  newTopics[topicIndex].subtopics[subtopicIndex] = e.target.value;
                                  setFormData({ ...formData, topics: newTopics });
                                }}
                                required
                                className="flex-grow"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleRemoveSubtopic(topicIndex, subtopicIndex)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Create Plan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Study Overview */}
          <Card className="lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Study Overview</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookMarked className="w-6 h-6 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Active Plans</h3>
                  </div>
                  <p className="text-3xl font-bold text-purple-700">{studyPlans.length}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <Timer className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Study Hours</h3>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">24</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <Trophy className="w-6 h-6 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Milestones</h3>
                  </div>
                  <p className="text-3xl font-bold text-green-700">8</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold">Quick Actions</h2>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Plan
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  View Calendar
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Get Study Tips
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Study Plans List */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Study Plans</h2>
            <div className="space-y-6">
              {studyPlans.map((plan: StudyPlan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{plan.course}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(plan.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center text-gray-600 mb-1">
                          <CalendarDays className="w-4 h-4 mr-1" />
                          <span className="text-sm">Start Date</span>
                        </div>
                        <p className="font-medium">{new Date(plan.startDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center text-gray-600 mb-1">
                          <Target className="w-4 h-4 mr-1" />
                          <span className="text-sm">Exam Date</span>
                        </div>
                        <p className="font-medium">{new Date(plan.examDate).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center text-gray-600 mb-1">
                          <Clock className="w-4 h-4 mr-1" />
                          <span className="text-sm">Daily Hours</span>
                        </div>
                        <p className="font-medium">{plan.dailyHours} hours</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDetails(plan.id)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        {showDetails[plan.id] ? (
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

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          View Schedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          Track Progress
                        </Button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showDetails[plan.id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Topics</h4>
                              <div className="space-y-3">
                                {plan.syllabus.topics.map((topic, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 p-3 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-gray-900">{topic.name}</span>
                                      <span className={`text-sm px-2 py-1 rounded-full ${
                                        topic.difficulty === 'easy'
                                          ? 'bg-green-100 text-green-700'
                                          : topic.difficulty === 'medium'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        {topic.difficulty}
                                      </span>
                                    </div>
                                    <div className="space-y-1">
                                      {topic.subtopics.map((subtopic, i) => (
                                        <div key={i} className="flex items-center text-gray-600">
                                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                          <span>{subtopic}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}

              {studyPlans.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Study Plans Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first study plan to get started with organized learning
                  </p>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="gradient-bg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Plan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlannerPage;