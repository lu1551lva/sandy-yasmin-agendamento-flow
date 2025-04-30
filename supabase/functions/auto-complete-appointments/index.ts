
// Follow Deno's ES modules syntax
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import { format } from 'https://esm.sh/date-fns@2.30.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current date and time
    const now = new Date();
    const currentDateString = format(now, 'yyyy-MM-dd');
    const currentTimeString = format(now, 'HH:mm');

    console.log(`🕒 Running auto-complete check at ${currentDateString} ${currentTimeString}`);

    // Find appointments that are in the past and still have "agendado" status
    const { data: pastAppointments, error: queryError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('status', 'agendado')
      .or(`data.lt.${currentDateString},and(data.eq.${currentDateString},hora.lt.${currentTimeString})`);

    if (queryError) {
      throw queryError;
    }

    console.log(`📋 Found ${pastAppointments?.length || 0} past appointments to auto-complete`);

    if (!pastAppointments || pastAppointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No past appointments to complete', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update appointments status to "concluido"
    const appointmentIds = pastAppointments.map(app => app.id);
    
    const { data: updatedData, error: updateError } = await supabase
      .from('agendamentos')
      .update({ status: 'concluido' })
      .in('id', appointmentIds)
      .select();

    if (updateError) {
      throw updateError;
    }

    // Create history entries for each updated appointment
    const historyEntries = appointmentIds.map(id => ({
      agendamento_id: id,
      tipo: 'concluido',
      descricao: 'Agendamento concluído automaticamente (horário expirado)',
      novo_valor: 'concluido'
    }));

    const { error: historyError } = await supabase
      .from('agendamento_historico')
      .insert(historyEntries);

    if (historyError) {
      console.error('⚠️ Error creating history entries:', historyError);
    }

    console.log(`✅ Successfully auto-completed ${updatedData?.length || 0} appointments`);

    return new Response(
      JSON.stringify({ 
        message: 'Past appointments marked as completed',
        updated: updatedData?.length || 0,
        appointments: updatedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in auto-complete function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
