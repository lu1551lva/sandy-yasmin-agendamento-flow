
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get current date in YYYY-MM-DD format
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    console.log(`🕒 Running auto-complete check at ${currentDate} ${currentTime}`);

    // Find past appointments that are still in "agendado" status
    const { data: pastAppointments, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('status', 'agendado')
      .or(`data.lt.${currentDate}, and(data.eq.${currentDate}, hora.lt.${currentTime})`)
      .order('data', { ascending: false });

    if (error) {
      console.error('Error fetching past appointments:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch past appointments' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`📋 Found ${pastAppointments.length} past appointments to auto-complete`);

    if (pastAppointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No past appointments to complete', updated: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update all past appointments to "concluido" status
    const appointmentIds = pastAppointments.map(apt => apt.id);
    
    const { data: updatedAppointments, error: updateError } = await supabase
      .from('agendamentos')
      .update({
        status: 'concluido'
      })
      .in('id', appointmentIds)
      .select();

    if (updateError) {
      console.error('Error updating past appointments:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update past appointments' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create history entries for each updated appointment
    const historyEntries = appointmentIds.map(id => ({
      agendamento_id: id,
      tipo: 'auto-completado',
      descricao: 'Agendamento marcado como concluído automaticamente',
      novo_valor: 'concluido'
    }));

    const { error: historyError } = await supabase
      .from('agendamento_historico')
      .insert(historyEntries);

    if (historyError) {
      console.error('Error creating history entries:', historyError);
    }
    
    console.log(`✅ Successfully auto-completed ${appointmentIds.length} appointments`);

    return new Response(
      JSON.stringify({ 
        message: 'Past appointments auto-completed successfully', 
        updated: appointmentIds.length,
        appointments: updatedAppointments
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
