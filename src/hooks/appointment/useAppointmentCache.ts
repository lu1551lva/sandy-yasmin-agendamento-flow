
import { useQueryClient } from '@tanstack/react-query';
import { logAppointmentAction, logAppointmentError } from '@/utils/debugUtils';

/**
 * Hook for managing appointment-related cache invalidation
 */
export const useAppointmentCache = () => {
  const queryClient = useQueryClient();

  /**
   * List of all appointment-related query keys to invalidate
   */
  const APPOINTMENT_QUERY_KEYS = [
    'appointments',
    'dashboard-appointments',
    'weekly-appointments',
    'week-appointments',
    'appointment-details'
  ];

  /**
   * Invalidates all appointment-related queries
   */
  const invalidateAppointmentQueries = async (): Promise<boolean> => {
    logAppointmentAction('Invalidando caches', 'all-queries');
    try {
      console.log("🔄 Iniciando invalidação completa de caches de agendamentos");
      
      // First invalidate using the predicate approach to catch all variants
      await queryClient.invalidateQueries({
        predicate: (query) => {
          // Check if the query key is an array
          if (Array.isArray(query.queryKey) && query.queryKey.length > 0) {
            // Check if any part of the query key contains our keywords
            return query.queryKey.some(key => 
              typeof key === 'string' && 
              (key.includes('appointment') || 
               key.includes('agendamento'))
            );
          }
          return false;
        }
      });

      // Then also invalidate our known specific keys for redundancy
      await Promise.all(
        APPOINTMENT_QUERY_KEYS.map(query => 
          queryClient.invalidateQueries({ queryKey: [query] })
        )
      );

      // Force immediate refetch of all active appointment queries
      console.log("🔄 Forçando atualização de queries ativas");
      await Promise.all([
        queryClient.refetchQueries({ 
          predicate: query => 
            Array.isArray(query.queryKey) && 
            query.queryKey[0] === 'appointments',
          type: 'active'
        }),
        // Also refetch weekly view
        queryClient.refetchQueries({
          queryKey: ['week-appointments'],
          type: 'active'
        }),
        // Also refetch dashboard appointments
        queryClient.refetchQueries({
          queryKey: ['dashboard-appointments'],
          type: 'active'
        })
      ]);

      console.log("✅ Cache invalidado e dados recarregados com sucesso");
      logAppointmentAction('Cache invalidado', 'all-queries', 'Dados recarregados com sucesso');
      return true;
    } catch (error) {
      console.error("❌ Erro durante invalidação do cache:", error);
      logAppointmentError('Erro ao invalidar cache', 'query-invalidation', error);
      return false;
    }
  };

  /**
   * Invalidates a specific appointment's history
   */
  const invalidateAppointmentHistory = async (appointmentId: string): Promise<void> => {
    await queryClient.invalidateQueries({ 
      queryKey: ['appointment-history', appointmentId] 
    });
    logAppointmentAction('Histórico invalidado', appointmentId);
  };

  /**
   * Invalidates a specific appointment's details
   */
  const invalidateAppointmentDetails = async (appointmentId: string): Promise<void> => {
    await queryClient.invalidateQueries({ 
      queryKey: ['appointment-details', appointmentId] 
    });
    logAppointmentAction('Detalhes do agendamento invalidados', appointmentId);
  };

  /**
   * Force refetch all appointment data
   */
  const forceRefetchAll = async (): Promise<boolean> => {
    try {
      console.log("🔄 Forçando recarga de todos os dados de agendamentos");
      
      // First invalidate everything
      await invalidateAppointmentQueries();
      
      // Then explicitly refetch critical queries
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['appointments'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['weekly-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['week-appointments'] })
      ]);
      
      console.log("✅ Todos os dados de agendamentos recarregados");
      return true;
    } catch (error) {
      console.error("❌ Falha ao forçar recarga de dados:", error);
      return false;
    }
  };

  return {
    invalidateAppointmentQueries,
    invalidateAppointmentHistory,
    invalidateAppointmentDetails,
    forceRefetchAll,
    APPOINTMENT_QUERY_KEYS
  };
};
