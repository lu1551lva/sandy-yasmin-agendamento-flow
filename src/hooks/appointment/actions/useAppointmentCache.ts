
import { useQueryClient } from "@tanstack/react-query";
import { useAppointmentCache } from "../useAppointmentCache";

/**
 * Hook for managing appointment cache invalidation operations
 */
export const useAppointmentCacheInvalidation = () => {
  const queryClient = useQueryClient();
  const { forceRefetchAll } = useAppointmentCache();
  
  // Function to invalidate all appointment-related queries and force refetch
  const invalidateQueries = async (): Promise<boolean> => {
    try {
      console.log("🔄 Invalidating and refreshing all appointment-related queries...");
      
      // Use the more comprehensive cache invalidation method from useAppointmentCache
      const success = await forceRefetchAll();
      
      console.log("✅ All appointment data refreshed successfully");
      return success;
    } catch (error) {
      console.error("❌ Error invalidating queries:", error);
      return false;
    }
  };

  return {
    invalidateQueries
  };
};
