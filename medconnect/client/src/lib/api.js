const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Auth functions
export async function getCurrentUser() {
  try {
    console.log(`Fetching current user from: ${BASE}/api/auth/me`);
    const r = await fetch(`${BASE}/api/auth/me`, {
      credentials: "include",
    });
    console.log(`Response status: ${r.status}`);
    if (!r.ok) {
      const errorText = await r.text();
      console.error(`API Error: ${r.status} - ${errorText}`);
      throw new Error(`API Error: ${r.status} - ${errorText}`);
    }
    const data = await r.json();
    console.log("Current user data:", data);
    return data;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    throw error;
  }
}

// Get current patient profile with full information
export async function getCurrentPatientProfile() {
  try {
    console.log(
      `Fetching patient profile from: ${BASE}/api/patients/me/profile`
    );
    const r = await fetch(`${BASE}/api/patients/me/profile`, {
      credentials: "include",
    });
    console.log(`Response status: ${r.status}`);
    if (!r.ok) {
      const errorText = await r.text();
      console.error(`API Error: ${r.status} - ${errorText}`);
      throw new Error(`API Error: ${r.status} - ${errorText}`);
    }
    const data = await r.json();
    console.log("Patient profile data:", data);
    return data;
  } catch (error) {
    console.error("Error in getCurrentPatientProfile:", error);
    throw error;
  }
}

export async function logout() {
  const r = await fetch(`${BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Patient functions
export async function getPatientProfile(patientId) {
  const r = await fetch(`${BASE}/api/patients/${patientId}/profile`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getPatientAppointments(patientId) {
  const r = await fetch(`${BASE}/api/patients/${patientId}/appointments`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getPatientMedicalRecords(patientId) {
  const r = await fetch(`${BASE}/api/patients/${patientId}/medical-records`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getPatientPrescriptions(patientId) {
  const r = await fetch(`${BASE}/api/patients/${patientId}/prescriptions`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getPatientPayments(patientId) {
  const r = await fetch(`${BASE}/api/patients/${patientId}/payments`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getPatientNotifications(patientId) {
  const r = await fetch(`${BASE}/api/patients/${patientId}/notifications`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Doctor functions
export async function getDoctors() {
  const r = await fetch(`${BASE}/api/doctors`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function searchDoctors(query) {
  const r = await fetch(
    `${BASE}/api/doctors/search?q=${encodeURIComponent(query)}`,
    {
      credentials: "include",
    }
  );
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getDoctorDetails(doctorId) {
  const r = await fetch(`${BASE}/api/doctors/${doctorId}`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getDoctorSchedule(doctorId) {
  const r = await fetch(`${BASE}/api/doctors/${doctorId}/schedule`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Appointment functions
export async function bookAppointment(appointmentData) {
  const r = await fetch(`${BASE}/api/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(appointmentData),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function rescheduleAppointment(appointmentId, newDateTime) {
  const r = await fetch(
    `${BASE}/api/appointments/${appointmentId}/reschedule`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newDateTime }),
    }
  );
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function cancelAppointment(appointmentId) {
  const r = await fetch(`${BASE}/api/appointments/${appointmentId}/cancel`, {
    method: "PUT",
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Payment functions
export async function makePayment(paymentData) {
  const r = await fetch(`${BASE}/api/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(paymentData),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Video consultation functions
export async function createVideoSession(appointmentId) {
  const r = await fetch(`${BASE}/api/video-sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ appointmentId }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getVideoSession(sessionId) {
  const r = await fetch(`${BASE}/api/video-sessions/${sessionId}`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Review functions
export async function submitReview(reviewData) {
  const r = await fetch(`${BASE}/api/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(reviewData),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Notification functions
export async function markNotificationAsRead(notificationId) {
  const r = await fetch(`${BASE}/api/notifications/${notificationId}/read`, {
    method: "PUT",
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
