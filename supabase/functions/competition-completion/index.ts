import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { competitionId } = await req.json()

    if (!competitionId) {
      return new Response(
        JSON.stringify({ error: 'Competition ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get all completed participants
    const { data: participants, error: participantsError } = await supabaseClient
      .from('competition_participants')
      .select('*')
      .eq('competition_id', competitionId)
      .eq('status', 'completed')
      .order('score', { ascending: false })
      .order('time_taken', { ascending: true })

    if (participantsError) {
      throw participantsError
    }

    if (!participants || participants.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No completed participants found' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate ranks based on score (descending) and time (ascending for tie-breaking)
    const rankedParticipants = participants.map((participant, index) => ({
      ...participant,
      rank: index + 1
    }))

    // Update participants with their final ranks
    const updatePromises = rankedParticipants.map(participant => 
      supabaseClient
        .from('competition_participants')
        .update({ 
          rank: participant.rank,
          final_rank: participant.rank // Add final_rank field for consistency
        })
        .eq('id', participant.id)
    )

    await Promise.all(updatePromises)

    // Get competition details for results
    const { data: competition, error: competitionError } = await supabaseClient
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single()

    if (competitionError) {
      throw competitionError
    }

    // Create competition results for each participant
    const resultsPromises = rankedParticipants.map(participant => {
      const totalQuestions = competition.questions?.length || 0
      const correctAnswers = participant.correct_answers || 0
      const incorrectAnswers = (participant.questions_answered || 0) - correctAnswers
      const skippedAnswers = totalQuestions - (participant.questions_answered || 0)
      
      return supabaseClient
        .from('competition_results')
        .upsert({
          competition_id: competitionId,
          user_id: participant.user_id,
          competition_title: competition.title,
          competition_type: competition.type,
          competition_code: competition.competition_code,
          final_rank: participant.rank,
          total_participants: rankedParticipants.length,
          score: participant.score || 0,
          correct_answers: correctAnswers,
          incorrect_answers: incorrectAnswers,
          skipped_answers: skippedAnswers,
          total_questions: totalQuestions,
          time_taken: participant.time_taken || 0,
          average_time_per_question: totalQuestions > 0 ? (participant.time_taken || 0) / totalQuestions : 0,
          points_earned: participant.points_earned || 0,
          answers: participant.answers || {},
          question_details: competition.questions || [],
          quiz_preferences: competition.quiz_preferences || {},
          competition_date: competition.created_at,
          joined_at: participant.joined_at,
          started_at: participant.quiz_start_time,
          completed_at: participant.completed_at || participant.quiz_end_time || new Date().toISOString()
        }, {
          onConflict: 'competition_id,user_id'
        })
    })

    await Promise.all(resultsPromises)

    return new Response(
      JSON.stringify({ 
        message: 'Competition results processed successfully',
        totalParticipants: rankedParticipants.length,
        rankings: rankedParticipants.map(p => ({
          user_id: p.user_id,
          rank: p.rank,
          score: p.score,
          time_taken: p.time_taken
        }))
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing competition completion:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})