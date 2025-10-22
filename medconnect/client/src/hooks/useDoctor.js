import { useState, useEffect, useCallback } from "react";
import { 
  getCurrentDoctorProfile, 
  updateDoctorProfile, 
  getDoctorAppointments, 
  getDoctorDashboardStats,
  updateAppointmentStatus,
  getConsultationRecords,
  createConsultationSummary,
  createPrescription,
  getDoctorTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  blockTimeSlot,
  autoGenerateTimeSlots,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getDoctorReviews,
  respondToReview
} from "../lib/api.js";

export function useDoctor() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctorProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCurrentDoctorProfile();
      setDoctor(response.doctor);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch doctor profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      const response = await updateDoctorProfile(profileData);
      setDoctor(response.doctor);
      return response.doctor;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchDoctorProfile();
  }, [fetchDoctorProfile]);

  return {
    doctor,
    loading,
    error,
    refetch: fetchDoctorProfile,
    updateProfile
  };
}

export function useDoctorAppointments(params = {}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchAppointments = useCallback(async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDoctorAppointments({ ...params, ...newParams });
      setAppointments(response.appointments);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const updateStatus = useCallback(async (appointmentId, status, cancelReason = null) => {
    try {
      setError(null);
      const response = await updateAppointmentStatus(appointmentId, status, cancelReason);
      
      // Update the appointment in the local state
      setAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId ? response.appointment : apt
        )
      );
      
      return response.appointment;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    pagination,
    refetch: fetchAppointments,
    updateStatus
  };
}

export function useDoctorDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDoctorDashboardStats();
      setStats(response.stats);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

export function useConsultationRecords(params = {}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchRecords = useCallback(async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getConsultationRecords({ ...params, ...newParams });
      setRecords(response.records);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch consultation records:", err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createSummary = useCallback(async (summaryData) => {
    try {
      setError(null);
      const response = await createConsultationSummary(summaryData);
      // Refresh records after creating summary
      await fetchRecords();
      return response.summary;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchRecords]);

  const createPrescriptionRecord = useCallback(async (prescriptionData) => {
    try {
      setError(null);
      const response = await createPrescription(prescriptionData);
      // Refresh records after creating prescription
      await fetchRecords();
      return response.prescription;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchRecords]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    loading,
    error,
    pagination,
    refetch: fetchRecords,
    createSummary,
    createPrescription: createPrescriptionRecord
  };
}

export function useDoctorTimeSlots(params = {}) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDoctorTimeSlots(params);
      setTimeSlots(response.timeSlots || []);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch time slots:", err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  const createNewTimeSlot = useCallback(async (slotData) => {
    try {
      setError(null);
      const response = await createTimeSlot(slotData);
      await fetchTimeSlots(); // Refresh the list
      return response.timeSlot;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTimeSlots]);

  const updateExistingTimeSlot = useCallback(async (slotId, slotData) => {
    try {
      setError(null);
      const response = await updateTimeSlot(slotId, slotData);
      await fetchTimeSlots(); // Refresh the list
      return response.timeSlot;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTimeSlots]);

  const removeTimeSlot = useCallback(async (slotId) => {
    try {
      setError(null);
      await deleteTimeSlot(slotId);
      await fetchTimeSlots(); // Refresh the list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTimeSlots]);

  const blockTime = useCallback(async (blockData) => {
    try {
      setError(null);
      const response = await blockTimeSlot(blockData);
      await fetchTimeSlots(); // Refresh the list
      return response.blockedSlot;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTimeSlots]);

  const autoGenerateSlots = useCallback(async (days = 30) => {
    try {
      setError(null);
      const response = await autoGenerateTimeSlots(days);
      await fetchTimeSlots(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchTimeSlots]);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  return {
    timeSlots,
    loading,
    error,
    refetch: fetchTimeSlots,
    createTimeSlot: createNewTimeSlot,
    updateTimeSlot: updateExistingTimeSlot,
    deleteTimeSlot: removeTimeSlot,
    blockTimeSlot: blockTime,
    autoGenerateTimeSlots: autoGenerateSlots
  };
}

export function useDoctorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDoctorDashboardStats();
      setDashboardData(response);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboardData
  };
}

export function useDoctorNotifications(params = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications(params);
      setNotifications(response.notifications || []);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      setError(null);
      await markNotificationAsRead(notificationId);
      await fetchNotifications(); // Refresh the list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);
      await markAllNotificationsAsRead();
      await fetchNotifications(); // Refresh the list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}

export function useDoctorPrescriptions(params = {}) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // This would need to be implemented in api.js
      // const response = await getDoctorPrescriptions(params);
      // setPrescriptions(response.prescriptions || []);
      setPrescriptions([]); // Placeholder
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch prescriptions:", err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createNewPrescription = useCallback(async (prescriptionData) => {
    try {
      setError(null);
      const response = await createPrescription(prescriptionData);
      await fetchPrescriptions(); // Refresh the list
      return response.prescription;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchPrescriptions]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return {
    prescriptions,
    loading,
    error,
    refetch: fetchPrescriptions,
    createPrescription: createNewPrescription
  };
}

export function useDoctorReviews(params = {}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDoctorReviews(params);
      setReviews(response.reviews || []);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const respondToReviewItem = useCallback(async (reviewId, response) => {
    try {
      setError(null);
      await respondToReview(reviewId, response);
      await fetchReviews(); // Refresh the list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchReviews]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    respondToReview: respondToReviewItem
  };
}
