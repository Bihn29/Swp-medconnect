import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";

/**
 * Hook to fetch family member's consultation summaries (medical history)
 * @param {string} patientId - The family member's patient ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 */
export function useFamilyConsultationSummaries(
  patientId,
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: ["familyConsultationSummaries", patientId, page, limit],
    queryFn: async () => {
      const response = await api.get(
        `/api/patients/${patientId}/consultation-summaries`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    },
    enabled: !!patientId, // Only fetch when patientId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
