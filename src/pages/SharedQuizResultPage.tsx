import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuizResultById } from '../services/supabase';
import { QuizResult, QuizPreferences } from '../types';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import {
  CheckCircle, XCircle, Trophy, Target, Clock,
  Brain, TrendingUp, Award, Star, Zap, BookOpen,
  BarChart3, PieChart, Activity, Lightbulb, ThumbsUp,
  AlertTriangle, User, Calendar, RefreshCw, Share2, Copy, Home, Loader,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie,
} from 'recharts';
import { Button } from '../components/ui/Button';
import QuizResults from '../components/quiz/QuizResults'; // Import QuizResults

const SharedQuizResultPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<QuizResult | null>(null);
  // Removed preferences state as it's no longer needed
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!resultId) {
        setError('No result ID provided.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const fetchedResult = await getQuizResultById(resultId);
        if (fetchedResult) {
          setResult(fetchedResult);
          // Removed preferences mocking logic
        } else {
          setError('Quiz result not found.');
        }
      } catch (err: any) {
        console.error('Error fetching shared quiz result:', err);
        setError('Failed to load quiz result: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Quiz Result...</h2>
          <p className="text-gray-600">Please wait while we fetch the shared quiz details.</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Result</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.href = '/'} className="mt-6">
            <Home className="w-5 h-5 mr-2" /> Go to Homepage
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!result) { // Check only for result, as preferences are now part of result
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <XCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Result Not Available</h2>
          <p className="text-gray-600">The quiz result could not be found or is no longer available.</p>
          <Button onClick={() => window.location.href = '/'} className="mt-6">
            <Home className="w-5 h-5 mr-2" /> Go to Homepage
          </Button>
        </motion.div>
      </div>
    );
  }

  // Since QuizResults component already handles the display logic,
  // we can simply render it here.
  return (
    <QuizResults
      result={result}
      // preferences prop is no longer needed as data is directly in result
      isSharedPage={true} // Pass the new prop here
      // No onNewQuiz, onChangePreferences, or onClose for shared page
    />
  );
};

export default SharedQuizResultPage;