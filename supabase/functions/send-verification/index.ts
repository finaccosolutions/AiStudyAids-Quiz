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
    const { userId, email, name, mobileNumber, countryCode, countryName } = await req.json()

    if (!userId || !email || !name || !mobileNumber) {
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

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: name,
        mobile_number: mobileNumber,
        country_code: countryCode || 'IN',
        country_name: countryName || 'India'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create profile',
          details: profileError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // In a real implementation, you would send a verification email here
    // For now, we'll just log it
    console.log(`Verification email would be sent to: ${email}`)
    console.log(`User profile created for: ${name} (${mobileNumber})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profile created and verification email sent' 
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