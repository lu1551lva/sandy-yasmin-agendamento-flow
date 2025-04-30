
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function useAutoCompleteAppointments() {
  const [isCompleting, setIsCompleting] = useState(false);
  const [lastCompleted, setLastCompleted] = useState<Date | null>(null);
  const { toast } = useToast();
  
  // Function to check and complete past appointments
  const runAutoComplete = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    try {
      console.log("🔄 Running auto-completion for past appointments...");
      
      // Call the auto-complete function
      const response = await fetch('https://bqzlexfnozmaqtvpbpay.supabase.co/functions/v1/auto-complete-appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxemxleGZub3ptYXF0dnBicGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTk2ODUsImV4cCI6MjA2MDkzNTY4NX0.C8r5NK4dsQ_deXshLIQZmTvtd8ZgsZEWzF0WBxB7A4w`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const result = await response.json();
      console.log("✓ Auto-complete result:", result);
      
      if (result.updated > 0) {
        toast({
          title: "Atualização automática",
          description: `${result.updated} agendamentos passados foram marcados como concluídos.`,
        });
      }
      
      setLastCompleted(new Date());
    } catch (error) {
      console.error("❌ Auto-complete error:", error);
      // Don't show error toast to avoid annoying users, just log it
    } finally {
      setIsCompleting(false);
    }
  };
  
  // Run on component mount and every 15 minutes
  useEffect(() => {
    // Run once on component mount
    runAutoComplete();
    
    // Then set up interval (every 15 minutes = 900000ms)
    const interval = setInterval(runAutoComplete, 900000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    runAutoComplete,
    isCompleting,
    lastCompleted
  };
}
