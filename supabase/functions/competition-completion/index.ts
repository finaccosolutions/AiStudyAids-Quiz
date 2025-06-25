import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { competitionId, userId, finalScore, correctAnswers, timeTaken, answers } = await req.json()

    if (!competitionId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get competition details
    const { data: competition, error: competitionError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single()

    if (competitionError || !competition) {
      return new Response(
        JSON.stringify({ error: 'Competition not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate questions_answered from answers object using JSONB function
    const questionsAnswered = answers ? Object.keys(answers).length : 0

    // Update participant status to completed
    const { error: participantError } = await supabase
      .from('competition_participants')
      .update({
        status: 'completed',
        score: finalScore,
        correct_answers: correctAnswers,
        time_taken: timeTaken,
        answers: answers || {},
        completed_at: new Date().toISOString()
        // Note: questions_answered will be automatically calculated by the trigger
      })
      .eq('competition_id', competitionId)
      .eq('user_id', userId)

    if (participantError) {
      console.error('Error updating participant:', participantError)
      return new Response(
        JSON.stringify({ error: 'Failed to update participant', details: participantError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get all participants to check completion status and calculate rankings
    const { data: allParticipants, error: participantsError } = await supabase
      .from('competition_participants')
      .select('status, user_id, score, correct_answers, questions_answered, time_taken, completed_at')
      .eq('competition_id', competitionId)
      .in('status', ['joined', 'completed'])

    if (participantsError) {
      console.error('Error fetching participants:', participantsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch participants' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const completedParticipants = allParticipants.filter(p => p.status === 'completed')
    const allCompleted = allParticipants.length === completedParticipants.length

    // Calculate and update rankings for all completed participants
    if (completedParticipants.length > 0) {
      // Sort participants by score (desc) and time (asc) for ranking
      const sortedParticipants = [...completedParticipants].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        if (a.time_taken !== b.time_taken) return a.time_taken - b.time_taken
        return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
      })

      // Update ranks for all completed participants
      for (let i = 0; i < sortedParticipants.length; i++) {
        const participant = sortedParticipants[i]
        const rank = i + 1

        await supabase
          .from('competition_participants')
          .update({ 
            rank: rank,
            final_rank: rank 
          })
          .eq('competition_id', competitionId)
          .eq('user_id', participant.user_id)
      }
    }

    let competitionCompleted = false

    if (allCompleted) {
      // Update competition status to completed
      const { error: updateCompetitionError } = await supabase
        .from('competitions')
        .update({ 
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', competitionId)

      if (updateCompetitionError) {
        console.error('Error updating competition status:', updateCompetitionError)
      } else {
        competitionCompleted = true
        console.log('Competition marked as completed')

        // Get the final sorted participants with their ranks
        const { data: finalParticipants, error: finalParticipantsError } = await supabase
          .from('competition_participants')
          .select(`
            *,
            profiles!competition_participants_user_id_profiles_fkey(full_name)
          `)
          .eq('competition_id', competitionId)
          .eq('status', 'completed')
          .order('rank', { ascending: true })

        if (!finalParticipantsError && finalParticipants) {
          // Save results for each participant with correct ranking
          for (const participant of finalParticipants) {
            const totalQuestions = competition.questions?.length || 0
            
            // Use the explicitly calculated questions_answered from the participant record
            const questionsAnsweredByParticipant = participant.questions_answered || 0
            const correctAnswers = participant.correct_answers || 0
            
            // Calculate incorrect and skipped answers based on actual questions answered
            const incorrectAnswers = Math.max(0, questionsAnsweredByParticipant - correctAnswers)
            const skippedAnswers = Math.max(0, totalQuestions - questionsAnsweredByParticipant)

            // Save to competition_results - let triggers calculate percentage_score, accuracy_rate, rank_percentile
            const { error: resultError } = await supabase
              .from('competition_results')
              .upsert({
                competition_id: competitionId,
                user_id: participant.user_id,
                competition_title: competition.title,
                competition_type: competition.type,
                competition_code: competition.competition_code,
                final_rank: participant.rank, // Use the correctly calculated rank
                total_participants: finalParticipants.length,
                score: participant.score,
                correct_answers: correctAnswers,
                incorrect_answers: incorrectAnswers,
                skipped_answers: skippedAnswers,
                total_questions: totalQuestions,
                time_taken: participant.time_taken,
                average_time_per_question: totalQuestions > 0 ? participant.time_taken / totalQuestions : 0,
                points_earned: participant.points_earned || 0,
                // Removed percentage_score, accuracy_rate, rank_percentile - these will be calculated by triggers
                answers: participant.answers || {},
                question_details: competition.questions || [],
                quiz_preferences: competition.quiz_preferences || {},
                competition_date: competition.created_at,
                joined_at: participant.joined_at,
                started_at: competition.start_time,
                completed_at: participant.completed_at
              }, {
                onConflict: 'competition_id,user_id'
              })

            if (resultError) {
              console.error('Error saving competition result:', resultError)
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        competitionCompleted,
        totalParticipants: allParticipants.length,
        completedParticipants: completedParticipants.length,
        message: allCompleted 
          ? 'Competition completed and results saved with correct rankings' 
          : 'Participant completed, waiting for others'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})