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

export async function updateCurrentPatientProfile(profileData) {
  try {
    console.log(`Updating patient profile at: ${BASE}/api/patients/me/profile`);
    const r = await fetch(`${BASE}/api/patients/me/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(profileData),
    });
    console.log(`Response status: ${r.status}`);
    if (!r.ok) {
      const errorText = await r.text();
      console.error(`API Error: ${r.status} - ${errorText}`);
      throw new Error(`API Error: ${r.status} - ${errorText}`);
    }
    const data = await r.json();
    console.log("Patient profile update response:", data);
    return data;
  } catch (error) {
    console.error("Error in updateCurrentPatientProfile:", error);
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

// Current doctor functions (authenticated)
export async function getCurrentDoctorProfile() {
  const r = await fetch(`${BASE}/api/doctors/me/profile`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateDoctorProfile(profileData) {
  const r = await fetch(`${BASE}/api/doctors/me/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(profileData),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getDoctorAppointments(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });

  const r = await fetch(`${BASE}/api/doctors/me/appointments?${searchParams}`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getDoctorDashboardStats() {
  const r = await fetch(`${BASE}/api/doctors/me/dashboard/stats`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateAppointmentStatus(
  appointmentId,
  status,
  cancelReason = null
) {
  const r = await fetch(
    `${BASE}/api/doctors/me/appointments/${appointmentId}/status`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status, cancelReason }),
    }
  );
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Consultation and prescription functions
export async function getConsultationRecords(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });

  const r = await fetch(
    `${BASE}/api/doctors/me/consultation-records?${searchParams}`,
    {
      credentials: "include",
    }
  );
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createConsultationSummary(summaryData) {
  const r = await fetch(`${BASE}/api/doctors/me/consultation-summaries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(summaryData),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createPrescription(prescriptionData) {
  const r = await fetch(`${BASE}/api/doctors/me/prescriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(prescriptionData),
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

// Notification functions
export async function getNotifications(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });

  const r = await fetch(`${BASE}/api/notifications?${searchParams}`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function markNotificationAsRead(notificationId) {
  const r = await fetch(`${BASE}/api/notifications/${notificationId}/read`, {
    method: "PUT",
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function markAllNotificationsAsRead() {
  const r = await fetch(`${BASE}/api/notifications/read-all`, {
    method: "PUT",
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Time slot management functions
export async function getDoctorTimeSlots(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });

  const r = await fetch(`${BASE}/api/doctors/me/time-slots?${searchParams}`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createTimeSlot(slotData) {
  const r = await fetch(`${BASE}/api/doctors/me/time-slots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(slotData),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateTimeSlot(slotId, slotData) {
  const r = await fetch(`${BASE}/api/doctors/me/time-slots/${slotId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(slotData),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteTimeSlot(slotId) {
  const r = await fetch(`${BASE}/api/doctors/me/time-slots/${slotId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function blockTimeSlot(blockData) {
  const r = await fetch(`${BASE}/api/doctors/me/time-slots/block`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(blockData),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Review functions
export async function getDoctorReviews(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });

  const r = await fetch(`${BASE}/api/doctors/me/reviews?${searchParams}`, {
    credentials: "include",
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function respondToReview(reviewId, response) {
  const r = await fetch(`${BASE}/api/doctors/me/reviews/${reviewId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ response }),
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

// Public doctor functions (for patient search)
export async function getAllDoctors(params = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append("search", params.search);
    if (params.specialization)
      queryParams.append("specialization", params.specialization);
    if (params.location) queryParams.append("location", params.location);
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const response = await fetch(`${BASE}/api/doctors?${queryParams}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
    throw error;
  }
}

// Specialization functions
export async function getAllSpecializations(params = {}) {
  try {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append("search", params.search);
    if (params.category) queryParams.append("category", params.category);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const response = await fetch(`${BASE}/api/specializations?${queryParams}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch specializations:", error);
    throw error;
  }
}

// Notification functions
// export async function markNotificationAsRead(notificationId) {
//   const r = await fetch(`${BASE}/api/notifications/${notificationId}/read`, {
//     method: "PUT",
//     credentials: "include",
//   });
//   if (!r.ok) throw new Error(await r.text());
//   return r.json();
// }

// Create api object with all functions for easier import
const apiObject = {
  // Auth functions
  getCurrentUser,
  logout,

  // Patient functions
  getCurrentPatientProfile,
  getPatientProfile,
  getPatientAppointments,
  getPatientMedicalRecords,
  getPatientPrescriptions,
  getPatientPayments,
  getPatientNotifications,

  // Doctor functions
  getDoctors,
  searchDoctors,
  getDoctorDetails,
  getDoctorSchedule,
  getCurrentDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getDoctorDashboardStats,
  updateAppointmentStatus,

  // Consultation and prescription functions
  getConsultationRecords,
  createConsultationSummary,
  createPrescription,

  // Appointment functions
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,

  // Payment functions
  makePayment,

  // Video consultation functions
  createVideoSession,
  getVideoSession,

  // Notification functions
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  // Time slot management functions
  getDoctorTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  blockTimeSlot,

  // Review functions
  getDoctorReviews,
  respondToReview,
  submitReview,

  // Public doctor functions
  getAllDoctors,

  // Specialization functions
  getAllSpecializations,

  // HTTP methods for direct API calls
  get: async (url, options = {}) => {
    const response = await fetch(`${BASE}${url}`, {
      credentials: "include",
      ...options,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  post: async (url, data, options = {}) => {
    const response = await fetch(`${BASE}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
      ...options,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  put: async (url, data, options = {}) => {
    const response = await fetch(`${BASE}${url}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
      ...options,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  delete: async (url, options = {}) => {
    const response = await fetch(`${BASE}${url}`, {
      method: "DELETE",
      credentials: "include",
      ...options,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
};

export const api = apiObject;
