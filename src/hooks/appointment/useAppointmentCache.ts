
import { useQueryClient } from '@tanstack/react-query';
import { logAppointmentAction, logAppointmentError } from '@/utils/debugUtils';

/**
 * Manages appointment-related cache invalidation and refetching
 */
export const useAppointmentCache = () => {
  const queryClient = useQueryClient();

  /**
   * Invalidates and refetches all appointment-related queries
   */
  const invalidateAppointmentQueries = async () => {
    logAppointmentAction('Invalidando caches', 'all-queries');
    try {
      // List of all appointment-related query keys
      const queries = [
        'appointments',
        'dashboard-appointments',
        'weekly-appointments',
        'week-appointments'
      ];

      // Invalidate all queries in parallel
      await Promise.all(
        queries.map(query => queryClient.invalidateQueries({ queryKey: [query] }))
      );

      // Force immediate refetch of the main appointments query
      await queryClient.refetchQueries({ queryKey: ['appointments'] });

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
  const invalidateAppointmentHistory = async (appointmentId: string) => {
    await queryClient.invalidateQueries({ queryKey: ['appointment-history', appointmentId] });
    logAppointmentAction('Histórico invalidado', appointmentId);
  };

  return {
    invalidateAppointmentQueries,
    invalidateAppointmentHistory
  };
};
