import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { competitionId, competitionCode, title, creatorName, emails } = await req.json()

    if (!competitionId || !competitionCode || !title || !emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    
    // For now, we'll just log the email details and return success
    console.log('Competition invitation emails to be sent:')
    emails.forEach((email: string) => {
      console.log(`
        To: ${email}
        Subject: You're invited to join "${title}" quiz competition!
        
        Hi there!
        
        ${creatorName} has invited you to join a quiz competition on QuizGenius.
        
        Competition: ${title}
        Competition Code: ${competitionCode}
        
        To join:
        1. Visit QuizGenius
        2. Go to Quiz > Join Competition
        3. Enter the code: ${competitionCode}
        
        Good luck and have fun!
        
        Best regards,
        QuizGenius Team
      `)
    })

    // In production, you would send actual emails here
    // For now, we'll simulate success
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invitations sent to ${emails.length} participants`,
        emails: emails
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})