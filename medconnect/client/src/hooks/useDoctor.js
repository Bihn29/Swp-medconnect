import { useState, useEffect, useCallback } from "react";
import { 
  getCurrentDoctorProfile, 
  updateDoctorProfile, 
  getDoctorAppointments, 
  getDoctorDashboardStats,
  updateAppointmentStatus,
  getConsultationRecords,
  createConsultationSummary,
  createPrescription
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
