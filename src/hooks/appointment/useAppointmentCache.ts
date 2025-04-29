
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
      // First invalidate using the predicate approach to catch all variants
      await queryClient.invalidateQueries({
        predicate: (query) => {
          // Check if the query key is an array
          if (Array.isArray(query.queryKey) && query.queryKey.length > 0) {
            // Check if the first element of the query key is in our list
            const queryBase = query.queryKey[0];
            return typeof queryBase === 'string' && 
                  (queryBase.includes('appointment') || 
                   queryBase.includes('agendamento'));
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

      // Force immediate refetch of the main appointments query
      await queryClient.refetchQueries({ 
        queryKey: ['appointments'],
        type: 'active', 
        exact: false
      });

      logAppointmentAction('Cache invalidado', 'all-queries', 'Dados recarregados com sucesso');
      return true;
    } catch (error) {
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

  return {
    invalidateAppointmentQueries,
    invalidateAppointmentHistory,
    invalidateAppointmentDetails,
    APPOINTMENT_QUERY_KEYS
  };
};
