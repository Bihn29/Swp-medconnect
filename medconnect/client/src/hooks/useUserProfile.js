import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { getCurrentUser, getCurrentPatientProfile } from "../lib/api";

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user from Firebase
        const firebaseUser = auth.currentUser;
        console.log("Firebase user:", firebaseUser);

        if (!firebaseUser) {
          console.log("No Firebase user found");
          setUserProfile(null);
          setLoading(false);
          return;
        }

        // Try to fetch full patient profile first, fallback to basic user info
        let profileData = null;
        try {
          console.log("Attempting to fetch patient profile...");
          const patientResponse = await getCurrentPatientProfile();
          console.log("Patient profile response:", patientResponse);
          profileData = patientResponse?.data || patientResponse;
        } catch (patientError) {
          console.warn(
            "Failed to fetch patient profile, trying basic user info:",
            patientError
          );
          // Fallback to basic user info
          try {
            console.log("Attempting to fetch basic user info...");
            const userResponse = await getCurrentUser();
            console.log("Basic user response:", userResponse);
            profileData = userResponse?.data || userResponse;
          } catch (userError) {
            console.error("Failed to fetch basic user info:", userError);
            throw userError;
          }
        }

        // Combine Firebase user data with API profile data
        const combinedProfile = {
          uid: firebaseUser.uid,
          email: profileData?.user?.email || firebaseUser.email,
          phone:
            profileData?.user?.phone ||
            profileData?.profile?.phone ||
            firebaseUser.phoneNumber,
          displayName:
            profileData?.user?.fullName ||
            profileData?.profile?.fullName ||
            firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: profileData?.user?.role,
          appUserId: profileData?.user?._id,
          // Additional profile fields
          fullName:
            profileData?.user?.fullName ||
            profileData?.profile?.fullName ||
            firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
          profileComplete: profileData?.profile?.isComplete || false,
          // Patient specific fields
          dob: profileData?.profile?.dob,
          gender: profileData?.profile?.gender,
          nationalId: profileData?.profile?.nationalId,
          address: profileData?.profile?.address,
          wardCode: profileData?.profile?.wardCode,
          districtCode: profileData?.profile?.districtCode,
          provinceCode: profileData?.profile?.provinceCode,
          // Add any other fields from your API response
          ...profileData?.profile,
        };

        setUserProfile(combinedProfile);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.message);
        // Fallback to Firebase user data only
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          setUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            phone: firebaseUser.phoneNumber,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            fullName: firebaseUser.displayName,
            avatar: firebaseUser.photoURL,
            profileComplete: false,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserProfile();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      try {
        setLoading(true);

        // Try to fetch full patient profile first, fallback to basic user info
        let profileData = null;
        try {
          const patientResponse = await getCurrentPatientProfile();
          profileData = patientResponse?.data || patientResponse;
        } catch (patientError) {
          console.warn(
            "Failed to fetch patient profile, trying basic user info:",
            patientError
          );
          // Fallback to basic user info
          const userResponse = await getCurrentUser();
          profileData = userResponse?.data || userResponse;
        }

        const combinedProfile = {
          uid: firebaseUser.uid,
          email: profileData?.user?.email || firebaseUser.email,
          phone:
            profileData?.user?.phone ||
            profileData?.profile?.phone ||
            firebaseUser.phoneNumber,
          displayName:
            profileData?.user?.fullName ||
            profileData?.profile?.fullName ||
            firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: profileData?.user?.role,
          appUserId: profileData?.user?._id,
          fullName:
            profileData?.user?.fullName ||
            profileData?.profile?.fullName ||
            firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
          profileComplete: profileData?.profile?.isComplete || false,
          // Patient specific fields
          dob: profileData?.profile?.dob,
          gender: profileData?.profile?.gender,
          nationalId: profileData?.profile?.nationalId,
          address: profileData?.profile?.address,
          wardCode: profileData?.profile?.wardCode,
          districtCode: profileData?.profile?.districtCode,
          provinceCode: profileData?.profile?.provinceCode,
          ...profileData?.profile,
        };

        setUserProfile(combinedProfile);
        setError(null);
      } catch (err) {
        console.error("Error refreshing user profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    userProfile,
    loading,
    error,
    refreshProfile,
  };
}
