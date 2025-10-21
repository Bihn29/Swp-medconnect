import { useState, useEffect } from "react";
import { api } from "../lib/api";

export function usePatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async (status = null) => {
    try {
      setLoading(true);
      setError(null);

      // Use the same logic as MyAppointments: fetch all appointments and filter client-side
      const params = {};
      if (status) {
        params.status = status;
      }
      params.limit = 50; // Get more appointments

      const queryString = new URLSearchParams(params).toString();
      const url = `/api/patients/me/appointments${
        queryString ? `?${queryString}` : ""
      }`;

      console.log("Fetching appointments from:", url);

      const response = await api.get(url);
      console.log("Appointments response:", response);

      if (response.success) {
        const allAppointments = response.data.appointments || [];

        // Apply the same filter logic as MyAppointments: only filter by status, not by date
        const filteredAppointments = allAppointments.filter((appointment) =>
          ["pending_doctor", "accepted"].includes(appointment.status)
        );

        console.log("=== APPOINTMENT DEBUG (Same as MyAppointments) ===");
        console.log("All appointments from API:", allAppointments.length);
        console.log(
          "All appointments details:",
          allAppointments.map((apt) => ({
            id: apt._id,
            status: apt.status,
            doctor: apt.doctorId?.fullName,
            scheduledStart: apt.scheduledStart,
            scheduledEnd: apt.scheduledEnd,
          }))
        );

        console.log(
          "Filtered appointments (accepted + pending_doctor):",
          filteredAppointments.length
        );
        console.log(
          "Filtered appointments details:",
          filteredAppointments.map((apt) => ({
            id: apt._id,
            status: apt.status,
            doctor: apt.doctorId?.fullName,
            scheduledStart: apt.scheduledStart,
          }))
        );

        console.log(
          "Appointments by status:",
          allAppointments.reduce((acc, apt) => {
            acc[apt.status] = (acc[apt.status] || 0) + 1;
            return acc;
          }, {})
        );

        // Check each appointment individually
        console.log("=== INDIVIDUAL APPOINTMENT CHECK ===");
        allAppointments.forEach((apt, index) => {
          const hasCorrectStatus = ["pending_doctor", "accepted"].includes(
            apt.status
          );
          console.log(`Appointment ${index + 1}:`, {
            id: apt._id,
            status: apt.status,
            doctor: apt.doctorId?.fullName,
            scheduledStart: apt.scheduledStart,
            hasCorrectStatus,
            willShow: hasCorrectStatus,
          });
        });

        setAppointments(filteredAppointments);
      } else {
        throw new Error(response.message || "Failed to fetch appointments");
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = () => {
    fetchAppointments();
  };

  // Function to fetch all appointments without any filtering for debugging
  const fetchAllAppointments = async () => {
    try {
      console.log("=== FETCHING ALL APPOINTMENTS FOR DEBUG ===");
      const response = await api.get("/api/patients/me/appointments?limit=100");
      console.log("All appointments response:", response);

      if (response.success) {
        const allAppts = response.data.appointments || [];
        console.log("Total appointments in database:", allAppts.length);
        console.log(
          "All appointments details:",
          allAppts.map((apt) => ({
            id: apt._id,
            status: apt.status,
            doctor: apt.doctorId?.fullName,
            scheduledStart: apt.scheduledStart,
            scheduledEnd: apt.scheduledEnd,
          }))
        );

        // Check status distribution
        const statusCount = allAppts.reduce((acc, apt) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        }, {});
        console.log("Status distribution:", statusCount);

        // Check which ones should show
        const shouldShow = allAppts.filter((apt) =>
          ["pending_doctor", "accepted"].includes(apt.status)
        );
        console.log("Should show appointments:", shouldShow.length);
        console.log(
          "Should show details:",
          shouldShow.map((apt) => ({
            id: apt._id,
            status: apt.status,
            doctor: apt.doctorId?.fullName,
            scheduledStart: apt.scheduledStart,
          }))
        );
      }
    } catch (err) {
      console.error("Error fetching all appointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Auto refresh every 30 seconds to catch new appointments
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);

    // Refresh when window gains focus (user comes back to tab)
    const handleFocus = () => {
      fetchAppointments();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Since we already filter in fetchAppointments (same as MyAppointments), all appointments are upcoming with correct status
  const upcomingAppointments = appointments;

  // Debug logging
  console.log(
    "usePatientAppointments - Upcoming appointments (accepted + pending_doctor):",
    appointments.length
  );
  console.log(
    "usePatientAppointments - Appointments data:",
    appointments.map((a) => ({
      id: a._id,
      status: a.status,
      doctor: a.doctorId?.fullName,
      scheduledStart: a.scheduledStart,
    }))
  );

  const pastAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.scheduledStart);
    return (
      appointmentDate <= now ||
      ["done", "cancelled", "auto_cancelled", "no_show"].includes(
        appointment.status
      )
    );
  });

  // Get appointments by status
  const getAppointmentsByStatus = (status) => {
    return appointments.filter((appointment) => appointment.status === status);
  };

  // Get pending appointments (waiting for doctor confirmation)
  const pendingAppointments = getAppointmentsByStatus("pending_doctor");

  // Debug logging
  console.log("All appointments:", appointments);
  console.log("Pending appointments:", pendingAppointments);
  console.log("Upcoming appointments:", upcomingAppointments);

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    pendingAppointments,
    loading,
    error,
    refreshAppointments,
    fetchAppointments,
    fetchAllAppointments,
    getAppointmentsByStatus,
  };
}
