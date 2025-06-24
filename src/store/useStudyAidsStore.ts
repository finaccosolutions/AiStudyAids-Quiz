import { create } from 'zustand';
import { supabase } from '../services/supabase';

interface StudyAidsState {
  isLoading: boolean;
  error: string | null;
  
  // Question Bank
  questionBanks: any[];
  loadQuestionBanks: (userId: string) => Promise<void>;
  createQuestionBank: (userId: string, data: any) => Promise<void>;
  
  // Answer Evaluation
  evaluations: any[];
  loadEvaluations: (userId: string) => Promise<void>;
  createEvaluation: (userId: string, formData: FormData) => Promise<void>;
  
  // Notes
  notes: any[];
  loadNotes: (userId: string) => Promise<void>;
  createNote: (userId: string, data: any) => Promise<void>;
  deleteNote: (userId: string, noteId: string) => Promise<void>;
  
  // Study Plan
  studyPlans: any[];
  loadStudyPlans: (userId: string) => Promise<void>;
  createStudyPlan: (userId: string, data: any) => Promise<void>;
  
  // Progress Stats
  progressStats: any[];
  loadProgressStats: (userId: string) => Promise<void>;
  updateProgressStats: (userId: string, data: any) => Promise<void>;
  
  // Chat History
  chatHistory: any[];
  loadChatHistory: (userId: string) => Promise<void>;
  addChatMessage: (userId: string, message: string, type: 'user' | 'assistant') => Promise<void>;
}

export const useStudyAidsStore = create<StudyAidsState>((set, get) => ({
  isLoading: false,
  error: null,
  
  // Question Bank
  questionBanks: [],
  loadQuestionBanks: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('question_banks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      set({ questionBanks: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  createQuestionBank: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('question_banks')
        .insert({ user_id: userId, ...data });
        
      if (error) throw error;
      get().loadQuestionBanks(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Answer Evaluation
  evaluations: [],
  loadEvaluations: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('answer_evaluations')
        .select('*')
        .eq('user_id', userId)
        .order('evaluated_at', { ascending: false });
        
      if (error) throw error;
      set({ evaluations: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  createEvaluation: async (userId, formData) => {
    set({ isLoading: true, error: null });
    try {
      const answerSheet = formData.get('answerSheet') as File;
      const questionPaper = formData.get('questionPaper') as File | null;
      const subject = formData.get('subject') as string;
      const topic = formData.get('topic') as string;

      if (!answerSheet) {
        throw new Error('Answer sheet is required');
      }

      // Upload answer sheet
      const answerSheetPath = `answer-sheets/${userId}/${Date.now()}-${answerSheet.name}`;
      const { error: uploadError } = await supabase.storage
        .from('evaluations')
        .upload(answerSheetPath, answerSheet);

      if (uploadError) throw uploadError;

      // Get answer sheet URL
      const { data: { publicUrl: answerSheetUrl } } = supabase.storage
        .from('evaluations')
        .getPublicUrl(answerSheetPath);

      // Upload question paper if provided
      let questionPaperUrl = null;
      if (questionPaper) {
        const question_paper_path = `question-papers/${userId}/${Date.now()}-${questionPaper.name}`;
        const { error: questionPaperError } = await supabase.storage
          .from('evaluations')
          .upload(question_paper_path, questionPaper);

        if (questionPaperError) throw questionPaperError;

        const { data: { publicUrl } } = supabase.storage
          .from('evaluations')
          .getPublicUrl(question_paper_path);
        
        questionPaperUrl = publicUrl;
      }

      // Call the evaluation edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          answerSheetUrl,
          questionPaperUrl,
          subject,
          topic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const evaluationResult = await response.json();

      // Create evaluation record
      const { error: dbError } = await supabase
        .from('answer_evaluations')
        .insert({
          user_id: userId,
          answer_sheet_url: answerSheetUrl,
          question_paper_id: questionPaperUrl ? undefined : null,
          score: evaluationResult.score,
          feedback: evaluationResult.feedback,
          improvements: evaluationResult.improvements || [],
        });
        
      if (dbError) throw dbError;
      get().loadEvaluations(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Notes
  notes: [],
  loadNotes: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      set({ notes: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  createNote: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      // Get API key for AI processing
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('gemini_api_key')
        .eq('user_id', userId)
        .single();

      if (apiKeyError || !apiKeyData?.gemini_api_key) {
        throw new Error('Gemini API key not found. Please set up your API key in the API Settings page.');
      }

      let pdfUrl = null;
      let contentText = data.content || '';

      // Handle PDF upload if source is PDF
      if (data.source === 'pdf' && data.file) {
        const file = data.file as File;
        const filePath = `notes/${userId}/${Date.now()}-${file.name}`;
        
        // Create notes bucket if it doesn't exist
        const { data: buckets } = await supabase.storage.listBuckets();
        const notesBucketExists = buckets?.some(bucket => bucket.name === 'notes');
        
        if (!notesBucketExists) {
          await supabase.storage.createBucket('notes', { public: false });
        }
        
        // Upload PDF to storage
        const { error: uploadError } = await supabase.storage
          .from('notes')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('notes')
          .getPublicUrl(filePath);
        
        pdfUrl = publicUrl;

        // Extract text from PDF using a simple approach
        try {
          // For now, we'll use a placeholder text extraction
          // In production, you'd want to implement proper PDF text extraction
          contentText = `Content extracted from PDF: ${file.name}. This is a placeholder for PDF text extraction. In a production environment, this would contain the actual extracted text from the PDF file.`;
        } catch (extractError) {
          console.warn('PDF text extraction failed:', extractError);
          contentText = `PDF uploaded: ${file.name}. Text extraction not available.`;
        }
      }

      // Generate notes content using AI
      let generatedContent: any = {};
      
      if (contentText && data.output_format && data.output_format.length > 0) {
        try {
          const prompt = `Analyze the following content and generate study materials in the requested formats:

Content: ${contentText}

Subject: ${data.course}
Topic: ${data.topic || 'General'}

Please generate the following formats: ${data.output_format.join(', ')}

Provide a comprehensive response in JSON format with the following structure:
{
  ${data.output_format.includes('summary') ? '"summary": "A concise summary of the main points",' : ''}
  ${data.output_format.includes('key_points') ? '"keyPoints": ["Key point 1", "Key point 2", "Key point 3"],' : ''}
  ${data.output_format.includes('mind_map') ? '"mindMap": {"central": "Main topic", "branches": [{"name": "Branch 1", "subtopics": ["Sub 1", "Sub 2"]}, {"name": "Branch 2", "subtopics": ["Sub 3", "Sub 4"]}]},' : ''}
  ${data.output_format.includes('questions') ? '"questions": [{"question": "Sample question?", "answer": "Sample answer", "type": "multiple-choice", "options": ["A", "B", "C", "D"]}],' : ''}
  ${data.output_format.includes('definitions') ? '"definitions": [{"term": "Important term", "definition": "Clear definition"}]' : ''}
}

Make sure the content is educational, accurate, and helpful for students studying ${data.course}.`;

          const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKeyData.gemini_api_key,
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: prompt
                  }]
                }],
                generationConfig: {
                  temperature: 0.3,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 2048,
                }
              })
            }
          );

          if (response.ok) {
            const result = await response.json();
            const responseText = result.candidates[0].content.parts[0].text;
            
            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                generatedContent = JSON.parse(jsonMatch[0]);
              } catch (parseError) {
                console.warn('Failed to parse AI response as JSON:', parseError);
                generatedContent = { summary: responseText };
              }
            } else {
              generatedContent = { summary: responseText };
            }
          }
        } catch (aiError) {
          console.warn('AI content generation failed:', aiError);
        }
      }

      // Create fallback content if AI generation failed
      if (!generatedContent || Object.keys(generatedContent).length === 0) {
        generatedContent = {};
        
        if (data.output_format.includes('summary')) {
          generatedContent.summary = contentText ? contentText.substring(0, 500) + '...' : 'No content available for summary.';
        }
        if (data.output_format.includes('key_points')) {
          generatedContent.keyPoints = ['Content analysis in progress', 'Please review the original material', 'AI processing may take some time'];
        }
        if (data.output_format.includes('questions')) {
          generatedContent.questions = [
            {
              question: `What are the main concepts in ${data.course}?`,
              answer: 'Please refer to the study material for detailed information.',
              type: 'short-answer'
            }
          ];
        }
        if (data.output_format.includes('definitions')) {
          generatedContent.definitions = [
            {
              term: data.course,
              definition: 'Please refer to the study material for detailed definitions.'
            }
          ];
        }
        if (data.output_format.includes('mind_map')) {
          generatedContent.mindMap = {
            central: data.course,
            branches: [
              {
                name: 'Key Concepts',
                subtopics: ['Concept 1', 'Concept 2']
              },
              {
                name: 'Applications',
                subtopics: ['Application 1', 'Application 2']
              }
            ]
          };
        }
      }

      // Insert note into database with proper field mapping
      const noteData = {
        user_id: userId,
        course: data.course,
        topic: data.topic || null,
        source: data.source,
        content: contentText,
        pdf_url: pdfUrl,
        output_format: data.output_format,
        language: data.language || 'English',
        generated_content: generatedContent,
      };

      const { error } = await supabase
        .from('notes')
        .insert(noteData);
        
      if (error) throw error;
      
      // Reload notes to show the new one
      await get().loadNotes(userId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  deleteNote: async (userId, noteId) => {
    set({ isLoading: true, error: null });
    try {
      // Get note details first to delete associated files
      const { data: note, error: fetchError } = await supabase
        .from('notes')
        .select('pdf_url')
        .eq('id', noteId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the note from database
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Delete associated PDF file if exists
      if (note?.pdf_url) {
        try {
          const urlParts = note.pdf_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          const filePath = `notes/${userId}/${fileName}`;
          
          await supabase.storage
            .from('notes')
            .remove([filePath]);
        } catch (fileError) {
          console.warn('Failed to delete associated file:', fileError);
        }
      }

      // Reload notes
      await get().loadNotes(userId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Study Plan
  studyPlans: [],
  loadStudyPlans: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      set({ studyPlans: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  createStudyPlan: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const { 
        examDate,
        startDate,
        dailyHours,
        topics,
        schedule,
        ...rest
      } = data;

      const dbData = {
        user_id: userId,
        exam_date: examDate,
        start_date: startDate,
        daily_hours: dailyHours,
        syllabus: { topics },
        schedule: schedule || [], // Ensure schedule is never null
        ...rest
      };

      const { error } = await supabase
        .from('study_plans')
        .insert(dbData);
        
      if (error) throw error;
      get().loadStudyPlans(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Progress Stats
  progressStats: [],
  loadProgressStats: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('progress_stats')
        .select('*')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false });
        
      if (error) throw error;
      set({ progressStats: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  updateProgressStats: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('progress_stats')
        .upsert({ user_id: userId, ...data });
        
      if (error) throw error;
      get().loadProgressStats(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Chat History
  chatHistory: [],
  loadChatHistory: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });
        
      if (error) throw error;
      set({ chatHistory: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  addChatMessage: async (userId, content, type) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('chat_history')
        .insert({ user_id: userId, content, type });
        
      if (error) throw error;
      get().loadChatHistory(userId);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));