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
      })
      .eq('competition_id', competitionId)
      .eq('user_id', userId)

    if (participantError) {
      console.error('Error updating participant:', participantError)
      return new Response(
        JSON.stringify({ error: 'Failed to update participant' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if all participants have completed
    const { data: allParticipants, error: participantsError } = await supabase
      .from('competition_participants')
      .select('status, user_id, score, correct_answers, time_taken')
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

        // Calculate final rankings and save to competition_results
        const sortedParticipants = completedParticipants.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          return a.time_taken - b.time_taken
        })

        // Save results for each participant
        for (let i = 0; i < sortedParticipants.length; i++) {
          const participant = sortedParticipants[i]
          const rank = i + 1

          // Get participant details
          const { data: participantDetails } = await supabase
            .from('competition_participants')
            .select(`
              *,
              profiles!competition_participants_user_id_profiles_fkey(full_name)
            `)
            .eq('competition_id', competitionId)
            .eq('user_id', participant.user_id)
            .single()

          if (participantDetails) {
            // Calculate additional metrics
            const totalQuestions = competition.questions?.length || 0
            const incorrectAnswers = totalQuestions - participant.correct_answers
            const skippedAnswers = totalQuestions - (participant.correct_answers + incorrectAnswers)
            const percentageScore = totalQuestions > 0 ? (participant.score / totalQuestions) * 100 : 0
            const accuracyRate = (participant.correct_answers + incorrectAnswers) > 0 
              ? (participant.correct_answers / (participant.correct_answers + incorrectAnswers)) * 100 
              : 0
            const rankPercentile = sortedParticipants.length > 1 
              ? ((sortedParticipants.length - rank) / (sortedParticipants.length - 1)) * 100 
              : 100

            // Save to competition_results
            const { error: resultError } = await supabase
              .from('competition_results')
              .upsert({
                competition_id: competitionId,
                user_id: participant.user_id,
                competition_title: competition.title,
                competition_type: competition.type,
                competition_code: competition.competition_code,
                final_rank: rank,
                total_participants: sortedParticipants.length,
                score: participant.score,
                correct_answers: participant.correct_answers,
                incorrect_answers: incorrectAnswers,
                skipped_answers: skippedAnswers,
                total_questions: totalQuestions,
                time_taken: participant.time_taken,
                average_time_per_question: totalQuestions > 0 ? participant.time_taken / totalQuestions : 0,
                points_earned: participantDetails.points_earned || 0,
                percentage_score: percentageScore,
                accuracy_rate: accuracyRate,
                rank_percentile: rankPercentile,
                answers: participantDetails.answers || {},
                question_details: competition.questions || [],
                quiz_preferences: competition.quiz_preferences || {},
                competition_date: competition.created_at,
                joined_at: participantDetails.joined_at,
                started_at: competition.start_time,
                completed_at: participantDetails.completed_at
              }, {
                onConflict: 'competition_id,user_id'
              })

            if (resultError) {
              console.error('Error saving competition result:', resultError)
            }
          }
        }

        // Update participant ranks
        for (let i = 0; i < sortedParticipants.length; i++) {
          const participant = sortedParticipants[i]
          const rank = i + 1

          await supabase
            .from('competition_participants')
            .update({ rank })
            .eq('competition_id', competitionId)
            .eq('user_id', participant.user_id)
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
          ? 'Competition completed and results saved' 
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