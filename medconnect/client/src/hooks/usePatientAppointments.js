import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function usePatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async (status = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (status) {
        params.status = status;
      }
      
      const queryString = new URLSearchParams(params).toString();
      // Use authenticated endpoint
      const url = `/api/patients/me/appointments${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching appointments from:', url);
      
      // Use the api utility instead of direct fetch
      const response = await api.get(url);
      
      console.log('Appointments response:', response);
      
      if (response.success) {
        setAppointments(response.data.appointments || []);
      } else {
        throw new Error(response.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to fetch appointments');
      // Set empty array on error to prevent UI issues
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = () => {
    fetchAppointments();
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Separate upcoming and past appointments
  const now = new Date();
  const upcomingAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduledStart);
    return appointmentDate > now && ['pending_doctor', 'accepted', 'confirmed', 'in_progress'].includes(appointment.status);
  });

  const pastAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduledStart);
    return appointmentDate <= now || ['done', 'cancelled', 'auto_cancelled', 'no_show'].includes(appointment.status);
  });

  // Get appointments by status
  const getAppointmentsByStatus = (status) => {
    return appointments.filter(appointment => appointment.status === status);
  };

  // Get pending appointments (waiting for doctor confirmation)
  const pendingAppointments = getAppointmentsByStatus('pending_doctor');
  
  // Debug logging
  console.log('All appointments:', appointments);
  console.log('Pending appointments:', pendingAppointments);
  console.log('Upcoming appointments:', upcomingAppointments);

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    pendingAppointments,
    loading,
    error,
    refreshAppointments,
    fetchAppointments,
    getAppointmentsByStatus
  };
}
