
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { isInPast } from '../auto-complete-appointments/utils.ts';

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
    
    console.log(`🔍 Checking for incorrectly completed future appointments`);

    // Get appointments with status "concluido"
    const { data: completedAppointments, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('status', 'concluido');

    if (error) {
      console.error('Error fetching completed appointments:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch completed appointments' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter to find future appointments incorrectly marked as completed
    const futureAppointments = completedAppointments.filter(appointment => 
      !isInPast(appointment.data, appointment.hora)
    );
    
    console.log(`📋 Found ${futureAppointments.length} future appointments incorrectly marked as completed`);
    
    if (futureAppointments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No future appointments incorrectly marked as completed', reset: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Reset incorrectly marked appointments back to "agendado"
    const appointmentIds = futureAppointments.map(apt => apt.id);
    
    console.log(`🔄 Resetting status for ${appointmentIds.length} future appointments`);
    for (const appointment of futureAppointments) {
      console.log(`   - Resetting appointment ${appointment.id}: Date: ${appointment.data} Time: ${appointment.hora}`);
    }
    
    const { data: updatedAppointments, error: updateError } = await supabase
      .from('agendamentos')
      .update({
        status: 'agendado'
      })
      .in('id', appointmentIds)
      .select();

    if (updateError) {
      console.error('Error resetting appointments:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to reset appointments' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create history entries for each reset appointment
    const historyEntries = appointmentIds.map(id => ({
      agendamento_id: id,
      tipo: 'status-corrigido',
      descricao: 'Agendamento revertido de concluído para agendado (correção automática)',
      novo_valor: 'agendado'
    }));

    const { error: historyError } = await supabase
      .from('agendamento_historico')
      .insert(historyEntries);

    if (historyError) {
      console.error('Error creating history entries:', historyError);
    }
    
    console.log(`✅ Successfully reset ${appointmentIds.length} appointments`);

    return new Response(
      JSON.stringify({ 
        message: 'Future appointments have been reset from concluido to agendado', 
        reset: appointmentIds.length,
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
