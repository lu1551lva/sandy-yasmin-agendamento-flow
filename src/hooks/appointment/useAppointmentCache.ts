
import { useQueryClient } from '@tanstack/react-query';

/**
 * Unified hook for all appointment cache operations
 */
export const useAppointmentCache = () => {
  const queryClient = useQueryClient();

  /**
   * List of all appointment-related query keys
   */
  const APPOINTMENT_QUERY_KEYS = [
    'appointments',
    'dashboard-appointments',
    'weekly-appointments',
    'week-appointments',
    'appointment-details',
    'upcoming-appointments',
    'dashboard-data',
    'new-clients'
  ];

  /**
   * Invalidates a specific query key
   */
  const invalidateQuery = async (queryKey: string): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: [queryKey] });
  };

  /**
   * Forces a refetch of a specific query
   */
  const refetchQuery = async (queryKey: string): Promise<void> => {
    await queryClient.refetchQueries({ queryKey: [queryKey] });
  };

  /**
   * Invalidates all appointment-related queries
   * Helper method to simplify cache invalidation across the app
   */
  const invalidateAppointmentQueries = async (): Promise<void> => {
    try {
      console.log("🔄 Invalidating all appointment-related queries");
      
      // Invalidate all our known keys
      await Promise.all(
        APPOINTMENT_QUERY_KEYS.map(queryKey => 
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        )
      );
      
      console.log("✅ All appointment queries invalidated");
    } catch (error) {
      console.error("❌ Error invalidating queries:", error);
    }
  };

  /**
   * Invalidates and refetches all appointment-related data
   * This is the primary method to ensure UI is updated
   */
  const forceRefetchAll = async (): Promise<boolean> => {
    try {
      console.log("🔄 Forçando atualização completa dos dados de agendamentos");
      
      // First invalidate all queries using predicate
      await queryClient.invalidateQueries({
        predicate: (query) => {
          if (Array.isArray(query.queryKey) && query.queryKey.length > 0) {
            return query.queryKey.some(key => 
              typeof key === 'string' && 
              (key.includes('appointment') || 
               key.includes('agendamento') ||
               key.includes('dashboard') ||
               key.includes('clientes'))
            );
          }
          return false;
        }
      });

      // Then specifically invalidate our known keys
      await Promise.all(
        APPOINTMENT_QUERY_KEYS.map(queryKey => 
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        )
      );

      // Force refetch of critical queries
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['appointments'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['weekly-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['week-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['dashboard-data'] }),
        queryClient.refetchQueries({ queryKey: ['upcoming-appointments'] }),
        queryClient.refetchQueries({ queryKey: ['new-clients'] })
      ]);
      
      console.log("✅ Todos os dados de agendamentos foram atualizados");
      return true;
    } catch (error) {
      console.error("❌ Erro ao atualizar cache:", error);
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
  };

  return {
    invalidateQuery,
    refetchQuery,
    forceRefetchAll,
    invalidateAppointmentHistory,
    invalidateAppointmentQueries,
    APPOINTMENT_QUERY_KEYS
  };
};
