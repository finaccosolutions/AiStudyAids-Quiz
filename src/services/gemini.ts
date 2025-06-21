import { QuizPreferences, Question } from '../types';

// Function to generate quiz questions using Gemini API
export const generateQuiz = async (
  apiKey: string,
  preferences: QuizPreferences
): Promise<Question[]> => {
  const { course, topic, subtopic, questionCount, questionTypes, language: quizLanguage, difficulty } = preferences;

  // The prompt template for generating quiz questions
  const prompt = `Generate a premium-quality quiz about "${course}${topic ? ` - ${topic}` : ''}${subtopic ? ` (${subtopic})` : ''}" with exactly ${questionCount} questions.

STRICT COMMERCIAL REQUIREMENTS:
1. CORE PARAMETERS:
- Course/Stream: ${course}
${topic ? `- Topic: ${topic}` : '- Topic: General concepts and principles'}
${subtopic ? `- Subtopic: ${subtopic}` : ''}
- Language: ${quizLanguage} (flawless grammar)
- Difficulty: ${difficulty} (with natural variation)
- Question Types: ONLY ${questionTypes.join(', ')} - DO NOT include any other question types
- Each question must be unique and not repetitive
- Include practical applications and real-world scenarios
- Ensure progressive complexity within the chosen difficulty level

2. STRICT QUESTION TYPE REQUIREMENTS:

For multiple-choice:
- MUST have "text": clear, complete question
- MUST have "options": array of EXACTLY 4 distinct, complete answers
- MUST have "correctAnswer": exact match of the correct option
- MUST have "explanation": detailed explanation of why the answer is correct
Example:
{
  "type": "multiple-choice",
  "text": "What is the primary function of a CPU in a computer system?",
  "options": [
    "Execute instructions and perform calculations",
    "Store long-term data permanently",
    "Display graphics on the monitor",
    "Connect to the internet"
  ],
  "correctAnswer": "Execute instructions and perform calculations",
  "explanation": "The CPU (Central Processing Unit) is the brain of the computer..."
}

For true-false:
- MUST have "text": clear, complete statement to evaluate
- MUST have "options": ["True", "False"]
- MUST have "correctAnswer": either "True" or "False"
- MUST have "explanation": detailed explanation of why true or false
Example:
{
  "type": "true-false",
  "text": "The binary number system uses only 0s and 1s.",
  "options": ["True", "False"],
  "correctAnswer": "True",
  "explanation": "The binary number system is a base-2 system..."
}

For multi-select:
- MUST have "text": clear question specifying "Select all that apply"
- MUST have "options": array of EXACTLY 6 complete, distinct options
- MUST have "correctOptions": array of EXACTLY 2 OR 3 correct options (no more, no less)
- MUST have "explanation": explain why each correct option is right AND why others are wrong
Example:
{
  "type": "multi-select",
  "text": "Which of the following are object-oriented programming languages? (Select all that apply)",
  "options": [
    "Java",
    "C",
    "Python",
    "Assembly",
    "Ruby",
    "COBOL"
  ],
  "correctOptions": ["Java", "Python", "Ruby"],
  "explanation": "Java, Python, and Ruby are object-oriented languages because they support encapsulation, inheritance, and polymorphism. C is procedural, Assembly is low-level, and COBOL is primarily procedural."
}

For sequence:
- MUST have "text": clear instruction about what to sequence
- MUST have "sequence": array of 4-6 complete steps in RANDOM order
- MUST have "correctSequence": same steps in CORRECT order
- MUST have "explanation": explain the logic behind EACH step in the sequence
Example:
{
  "type": "sequence",
  "text": "Arrange the following steps of the TCP three-way handshake in the correct order:",
  "sequence": [
    "Client sends ACK",
    "Server sends SYN-ACK",
    "Client sends SYN",
    "Connection established"
  ],
  "correctSequence": [
    "Client sends SYN",
    "Server sends SYN-ACK",
    "Client sends ACK",
    "Connection established"
  ],
  "explanation": "1. Client initiates with SYN to request connection\\n2. Server acknowledges and sends its own SYN\\n3. Client acknowledges server's SYN\\n4. Connection is now established and ready for data transfer"
}

For case-study:
- MUST have "text": brief introduction
- MUST have "caseStudy": detailed scenario description (minimum 100 words)
- MUST have "question": specific question about the case
- MUST have "options": array of EXACTLY 4 possible solutions
- MUST have "correctAnswer": the best solution (exact match)
- MUST have "explanation": detailed analysis of ALL options
Example:
{
  "type": "case-study",
  "text": "Analyze this e-commerce system scaling scenario:",
  "caseStudy": "An e-commerce platform experiences sudden traffic spikes during flash sales, causing system slowdowns and occasional crashes. The current architecture uses a monolithic application deployed on a single server with a PostgreSQL database. During peak times, the server CPU reaches 100% utilization, database connections are exhausted, and the application becomes unresponsive. The company wants to handle 10x more concurrent users while maintaining response times under 500ms.",
  "question": "What is the most effective immediate solution to handle the traffic spikes?",
  "options": [
    "Implement horizontal scaling with load balancing",
    "Upgrade to a more powerful server",
    "Switch to a NoSQL database",
    "Add application caching"
  ],
  "correctAnswer": "Implement horizontal scaling with load balancing",
  "explanation": "Analysis of each option:\\n1. Horizontal scaling with load balancing: Best immediate solution as it provides linear scalability, high availability, and can handle traffic spikes effectively.\\n2. Upgrading server: Temporary solution that doesn't solve the fundamental scalability issue and has physical limitations.\\n3. Switching to NoSQL: Major architectural change that doesn't address the immediate CPU bottleneck and requires significant development effort.\\n4. Adding caching: Helpful but insufficient alone for handling concurrent user load and CPU bottleneck."
}

For situation:
- MUST have "text": brief introduction
- MUST have "situation": detailed scenario description (minimum 100 words)
- MUST have "question": specific question about the situation
- MUST have "options": array of EXACTLY 4 possible actions
- MUST have "correctAnswer": most appropriate action (exact match)
- MUST have "explanation": detailed analysis of ALL options and their consequences
Example:
{
  "type": "situation",
  "text": "Handle a critical production incident:",
  "situation": "You're the lead developer on call when a critical alert triggers at 2 AM. The company's main API is returning 500 errors for 30% of requests, affecting multiple major clients. Initial logs show increased database connection timeouts and memory usage spikes. The last deployment was 6 hours ago, which included both database schema changes and new API endpoints. The backup from 12 hours ago is available, but restoring it would lose 12 hours of customer data. Client impact is estimated at $50,000 per hour of downtime.",
  "question": "What should be your first action?",
  "options": [
    "Immediately roll back the last deployment",
    "Scale up database resources",
    "Analyze logs and metrics for root cause",
    "Restore from the latest backup"
  ],
  "correctAnswer": "Analyze logs and metrics for root cause",
  "explanation": "Analysis of each action and its consequences:\\n1. Rolling back immediately: Risky without understanding the issue, could cause data inconsistencies and might not solve the problem if it's unrelated to the deployment.\\n2. Scaling database resources: Premature solution without understanding if database is the real bottleneck, wastes time and resources if the issue lies elsewhere.\\n3. Analyzing logs and metrics: Best first action as it quickly identifies the root cause, minimizes risk, and ensures the correct solution is implemented. Allows for informed decision-making.\\n4. Restoring backup: Most disruptive option with guaranteed data loss, should only be used as a last resort after other options are exhausted."
}

For short-answer:
- MUST have "text": clear, specific question
- MUST have "correctAnswer": concise, accurate answer (1-3 words typically)
- MUST have "explanation": detailed explanation of the answer
- MUST have "keywords": array of key terms that should be present in a correct answer
Example:
{
  "type": "short-answer",
  "text": "What is the time complexity of binary search algorithm?",
  "correctAnswer": "O(log n)",
  "explanation": "Binary search has O(log n) time complexity because it eliminates half of the remaining elements in each iteration, resulting in a logarithmic number of comparisons.",
  "keywords": ["O(log n)", "logarithmic", "log n"]
}

For fill-blank:
- MUST have "text": sentence with ONE blank marked as _____ 
- MUST have "correctAnswer": the word/phrase that fills the blank
- MUST have "explanation": detailed explanation
- MUST have "keywords": array of acceptable variations of the answer
Example:
{
  "type": "fill-blank",
  "text": "The _____ design pattern ensures that a class has only one instance and provides global access to it.",
  "correctAnswer": "Singleton",
  "explanation": "The Singleton pattern restricts instantiation of a class to one object and provides a global point of access to that instance.",
  "keywords": ["Singleton", "singleton"]
}

CRITICAL REQUIREMENTS:
1. Every question MUST include:
   - Complete "text" field with clear question
   - Appropriate fields for its type (see examples)
   - Detailed "explanation" field
   - All text in ${quizLanguage}

2. Format as valid JSON array with no trailing commas
3. Use double quotes for strings
4. Escape quotes within strings
5. No text outside the JSON array
6. No missing or null fields
7. For multi-select questions, ALWAYS include EXACTLY 2 OR 3 correct options - no more, no less
8. For sequence questions, ALWAYS provide step-by-step explanation
9. For case-study and situation questions, ALWAYS include detailed scenario (100+ words)
10. ALWAYS analyze ALL options in explanations for case-study and situation questions
11. For short-answer and fill-blank questions, ALWAYS include keywords array for flexible matching
12. CRITICAL: Generate ONLY questions of the specified types: ${questionTypes.join(', ')}`;

  try {
    // First try the edge function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        apiKey,
        temperature: 0.0 // Lower temperature for more consistent output
      })
    });

    if (!response.ok) {
      // Try to get detailed error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `Gemini API error: ${errorData.error}`;
        } else if (errorData.message) {
          errorMessage = `API error: ${errorData.message}`;
        }
      } catch (parseError) {
        // If we can't parse the error response, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `API error: ${errorText}`;
          }
        } catch (textError) {
          // Keep the original HTTP error message
        }
      }
      throw new Error(`Failed to generate quiz: ${errorMessage}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API - no content generated');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response text
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response. Please check your API key and try again.');
    }

    try {
      const questions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format - expected array of questions');
      }

      // Filter questions to ensure only requested types are included
      const filteredQuestions = questions.filter((q: any) => 
        questionTypes.includes(q.type)
      );

      if (filteredQuestions.length === 0) {
        throw new Error('No questions of the requested types were generated');
      }

      // Validate each question has the required fields for its type
      filteredQuestions.forEach((q: any, index: number) => {
        if (!q.text || !q.type || !q.explanation) {
          throw new Error(`Question ${index + 1} missing required base fields (text, type, or explanation)`);
        }

        switch (q.type) {
          case 'multiple-choice':
            if (!Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
              throw new Error(`Question ${index + 1} (multiple-choice) must have exactly 4 options and a correctAnswer`);
            }
            if (!q.options.includes(q.correctAnswer)) {
              throw new Error(`Question ${index + 1} correctAnswer must match one of the options exactly`);
            }
            break;

          case 'true-false':
            if (!Array.isArray(q.options) || q.options.length !== 2 || 
                q.options[0] !== 'True' || q.options[1] !== 'False') {
              throw new Error(`Question ${index + 1} (true-false) must have options ["True", "False"]`);
            }
            if (q.correctAnswer !== 'True' && q.correctAnswer !== 'False') {
              throw new Error(`Question ${index + 1} correctAnswer must be "True" or "False"`);
            }
            break;

          case 'multi-select':
            if (!Array.isArray(q.options) || q.options.length !== 6) {
              throw new Error(`Question ${index + 1} (multi-select) must have exactly 6 options`);
            }
            if (!Array.isArray(q.correctOptions)) {
              throw new Error(`Question ${index + 1} must have correctOptions array`);
            }
            if (q.correctOptions.length < 2 || q.correctOptions.length > 3) {
              throw new Error(`Question ${index + 1} must have exactly 2 or 3 correct options (found ${q.correctOptions.length})`);
            }
            if (!q.correctOptions.every((opt: string) => q.options.includes(opt))) {
              throw new Error(`Question ${index + 1} correctOptions must match options exactly`);
            }
            break;

          case 'sequence':
            if (!Array.isArray(q.sequence) || !Array.isArray(q.correctSequence)) {
              throw new Error(`Question ${index + 1} must have sequence and correctSequence arrays`);
            }
            if (q.sequence.length < 4 || q.sequence.length > 6 || 
                q.sequence.length !== q.correctSequence.length) {
              throw new Error(`Question ${index + 1} must have 4-6 matching steps in sequence and correctSequence`);
            }
            // Verify all steps exist in both arrays
            const sequenceSet = new Set([...q.sequence, ...q.correctSequence]);
            if (sequenceSet.size !== q.sequence.length) {
              throw new Error(`Question ${index + 1} sequence and correctSequence must contain the same steps`);
            }
            break;

          case 'case-study':
            if (!q.caseStudy || !q.question || !Array.isArray(q.options) || 
                q.options.length !== 4 || !q.correctAnswer) {
              throw new Error(`Question ${index + 1} (case-study) must have caseStudy, question, exactly 4 options, and correctAnswer`);
            }
            if (q.caseStudy.length < 100) {
              throw new Error(`Question ${index + 1} case study description must be at least 100 characters`);
            }
            if (!q.options.includes(q.correctAnswer)) {
              throw new Error(`Question ${index + 1} correctAnswer must match one of the options exactly`);
            }
            break;

          case 'situation':
            if (!q.situation || !q.question || !Array.isArray(q.options) || 
                q.options.length !== 4 || !q.correctAnswer) {
              throw new Error(`Question ${index + 1} (situation) must have situation, question, exactly 4 options, and correctAnswer`);
            }
            if (q.situation.length < 100) {
              throw new Error(`Question ${index + 1} situation description must be at least 100 characters`);
            }
            if (!q.options.includes(q.correctAnswer)) {
              throw new Error(`Question ${index + 1} correctAnswer must match one of the options exactly`);
            }
            break;

          case 'short-answer':
            if (!q.correctAnswer || !Array.isArray(q.keywords)) {
              throw new Error(`Question ${index + 1} (short-answer) must have correctAnswer and keywords array`);
            }
            break;

          case 'fill-blank':
            if (!q.correctAnswer || !Array.isArray(q.keywords)) {
              throw new Error(`Question ${index + 1} (fill-blank) must have correctAnswer and keywords array`);
            }
            if (!q.text.includes('_____')) {
              throw new Error(`Question ${index + 1} (fill-blank) must contain _____ in the text`);
            }
            break;
        }
      });

      return filteredQuestions.map((q: any, index: number) => ({
        id: index + 1,
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        caseStudy: q.caseStudy,
        situation: q.situation,
        question: q.question,
        sequence: q.sequence,
        correctSequence: q.correctSequence,
        correctOptions: q.correctOptions,
        keywords: q.keywords,
        language: quizLanguage
      }));
    } catch (error: any) {
      console.error('Parse error:', error);
      throw new Error(`Failed to parse generated questions: ${error.message}. Please check your API key and try again.`);
    }
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    // Provide more specific error messages based on common issues
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      throw new Error('Invalid API key. Please check your Gemini API key in settings.');
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      throw new Error('API key does not have permission to access Gemini API. Please check your API key settings.');
    } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      throw new Error('API rate limit exceeded. Please wait a moment and try again.');
    } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      throw new Error('Gemini API is temporarily unavailable. Please try again later.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw new Error(`Quiz generation failed: ${error.message}`);
  }
};

// Function to get explanation for an answer
export const getAnswerExplanation = async (
  apiKey: string,
  question: string,
  correctAnswer: string,
  topic: string,
  language: string
): Promise<string> => {
  const prompt = `Explain why "${correctAnswer}" is the correct answer to this ${topic} question: "${question}"
  
Requirements:
- Use ${language} language
- Be clear and concise
- Include relevant concepts
- Explain step-by-step if applicable
- Add examples if helpful`;

  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        apiKey,
        temperature: 0.0
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get explanation: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error('Explanation error:', error);
    throw new Error(`Failed to get explanation: ${error.message}`);
  }
};

// Function to evaluate short answer or fill-blank questions
export const evaluateTextAnswer = async (
  apiKey: string,
  question: string,
  userAnswer: string,
  correctAnswer: string,
  keywords: string[],
  language: string
): Promise<{ isCorrect: boolean; feedback: string; score: number }> => {
  const prompt = `Evaluate this student answer for the question:

Question: "${question}"
Correct Answer: "${correctAnswer}"
Student Answer: "${userAnswer}"
Key Terms: ${keywords.join(', ')}

Evaluation Criteria:
1. Check if the student answer contains the core concepts
2. Look for key terms or their synonyms
3. Consider spelling variations and abbreviations
4. Evaluate partial correctness
5. Provide constructive feedback

Respond in JSON format:
{
  "isCorrect": boolean (true if answer demonstrates understanding, even with minor errors),
  "score": number (0-100, percentage of correctness),
  "feedback": "detailed explanation in ${language}"
}

Be lenient with:
- Minor spelling mistakes
- Different word order
- Synonyms and abbreviations
- Partial answers that show understanding

Be strict with:
- Completely wrong concepts
- Missing core elements
- Contradictory information`;

  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        apiKey,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to evaluate answer: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // Fallback evaluation
      const userLower = userAnswer.toLowerCase().trim();
      const correctLower = correctAnswer.toLowerCase().trim();
      const hasKeywords = keywords.some(keyword => 
        userLower.includes(keyword.toLowerCase())
      );
      
      return {
        isCorrect: userLower === correctLower || hasKeywords,
        score: userLower === correctLower ? 100 : hasKeywords ? 75 : 0,
        feedback: `Your answer "${userAnswer}" ${hasKeywords ? 'contains key concepts but' : 'does not match'} the expected answer "${correctAnswer}".`
      };
    }

    try {
      const evaluation = JSON.parse(jsonMatch[0]);
      return {
        isCorrect: evaluation.isCorrect || false,
        score: evaluation.score || 0,
        feedback: evaluation.feedback || 'No feedback available'
      };
    } catch (parseError) {
      // Fallback evaluation
      const userLower = userAnswer.toLowerCase().trim();
      const correctLower = correctAnswer.toLowerCase().trim();
      const hasKeywords = keywords.some(keyword => 
        userLower.includes(keyword.toLowerCase())
      );
      
      return {
        isCorrect: userLower === correctLower || hasKeywords,
        score: userLower === correctLower ? 100 : hasKeywords ? 75 : 0,
        feedback: `Your answer "${userAnswer}" ${hasKeywords ? 'contains key concepts but may need refinement' : 'does not match the expected answer'}. The correct answer is "${correctAnswer}".`
      };
    }
  } catch (error: any) {
    console.error('Answer evaluation error:', error);
    // Fallback evaluation
    const userLower = userAnswer.toLowerCase().trim();
    const correctLower = correctAnswer.toLowerCase().trim();
    const hasKeywords = keywords && keywords.some(keyword => 
      userLower.includes(keyword.toLowerCase())
    );
    
    return {
      isCorrect: userLower === correctLower || hasKeywords,
      score: userLower === correctLower ? 100 : hasKeywords ? 75 : 0,
      feedback: `Your answer "${userAnswer}" ${hasKeywords ? 'contains some correct elements' : 'needs improvement'}. The expected answer is "${correctAnswer}".`
    };
  }
};