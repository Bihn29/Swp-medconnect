import Clinic from "../models/clinic.model.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

/**
 * Get all clinics with pagination and search
 */
export async function getAllClinics(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      type = "all",
      location = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build search query
    const searchQuery = {};
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by type if specified
    if (type !== "all") {
      searchQuery.type = type;
    }

    // Filter by location if specified
    if (location !== "all") {
      searchQuery.location = location;
    }

    // Build sort query
    const sortQuery = {};
    sortQuery[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch clinics
    const clinics = await Clinic.find(searchQuery)
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Clinic.countDocuments(searchQuery);

    // Format response
    const formattedClinics = clinics.map((clinic) => ({
      id: clinic._id,
      name: clinic.name,
      type: clinic.type || "hospital",
      location: clinic.location || "Không xác định",
      address: clinic.address,
      phone: clinic.phone,
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      coordinates: clinic.geo?.coordinates,
      specialties: clinic.specialties || [],
      doctorCount: clinic.doctorCount || 0,
      rating: clinic.rating || 4.0,
      reviewCount: clinic.reviewCount || 0,
      description: clinic.description || "",
      image: clinic.image || "",
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    }));

    return ok(res, {
      clinics: formattedClinics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ /api/clinics error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Get clinic by ID
 */
export async function getClinicById(req, res) {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findById(id).lean();
    if (!clinic) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Clinic not found");
    }

    const formattedClinic = {
      id: clinic._id,
      name: clinic.name,
      type: clinic.type || "hospital",
      location: clinic.location || "Không xác định",
      address: clinic.address,
      phone: clinic.phone,
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      coordinates: clinic.geo?.coordinates,
      specialties: clinic.specialties || [],
      doctorCount: clinic.doctorCount || 0,
      rating: clinic.rating || 4.0,
      reviewCount: clinic.reviewCount || 0,
      description: clinic.description || "",
      image: clinic.image || "",
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    };

    return ok(res, { clinic: formattedClinic });
  } catch (error) {
    console.error("❌ /api/clinics/:id error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Create new clinic
 */
export async function createClinic(req, res) {
  try {
    const {
      name,
      type,
      location,
      address,
      phone,
      latitude,
      longitude,
      specialties,
      doctorCount,
      rating,
      reviewCount,
      description,
      image,
    } = req.body;

    // Build geo coordinates if provided
    let geo = null;
    if (latitude && longitude) {
      geo = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    const clinic = new Clinic({
      name,
      type: type || "hospital",
      location,
      address,
      phone,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      geo,
      specialties: specialties || [],
      doctorCount: doctorCount || 0,
      rating: rating || 4.0,
      reviewCount: reviewCount || 0,
      description: description || "",
      image: image || "",
    });

    await clinic.save();

    const formattedClinic = {
      id: clinic._id,
      name: clinic.name,
      type: clinic.type,
      location: clinic.location,
      address: clinic.address,
      phone: clinic.phone,
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      coordinates: clinic.geo?.coordinates,
      specialties: clinic.specialties,
      doctorCount: clinic.doctorCount,
      rating: clinic.rating,
      reviewCount: clinic.reviewCount,
      description: clinic.description,
      image: clinic.image,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    };

    return ok(res, { clinic: formattedClinic }, 201);
  } catch (error) {
    console.error("❌ /api/clinics POST error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Update clinic
 */
export async function updateClinic(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      location,
      address,
      phone,
      latitude,
      longitude,
      specialties,
      doctorCount,
      rating,
      reviewCount,
      description,
      image,
    } = req.body;

    const clinic = await Clinic.findById(id);
    if (!clinic) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Clinic not found");
    }

    // Update fields
    if (name) clinic.name = name;
    if (type) clinic.type = type;
    if (location) clinic.location = location;
    if (address) clinic.address = address;
    if (phone) clinic.phone = phone;
    if (latitude) clinic.latitude = parseFloat(latitude);
    if (longitude) clinic.longitude = parseFloat(longitude);
    if (specialties) clinic.specialties = specialties;
    if (doctorCount !== undefined) clinic.doctorCount = doctorCount;
    if (rating !== undefined) clinic.rating = rating;
    if (reviewCount !== undefined) clinic.reviewCount = reviewCount;
    if (description) clinic.description = description;
    if (image) clinic.image = image;

    // Update geo coordinates if provided
    if (latitude && longitude) {
      clinic.geo = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    await clinic.save();

    const formattedClinic = {
      id: clinic._id,
      name: clinic.name,
      type: clinic.type,
      location: clinic.location,
      address: clinic.address,
      phone: clinic.phone,
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      coordinates: clinic.geo?.coordinates,
      specialties: clinic.specialties,
      doctorCount: clinic.doctorCount,
      rating: clinic.rating,
      reviewCount: clinic.reviewCount,
      description: clinic.description,
      image: clinic.image,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    };

    return ok(res, { clinic: formattedClinic });
  } catch (error) {
    console.error("❌ /api/clinics/:id PUT error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}

/**
 * Delete clinic
 */
export async function deleteClinic(req, res) {
  try {
    const { id } = req.params;

    const clinic = await Clinic.findByIdAndDelete(id);
    if (!clinic) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Clinic not found");
    }

    return ok(res, { message: "Clinic deleted successfully" });
  } catch (error) {
    console.error("❌ /api/clinics/:id DELETE error:", error);
    return fail(
      res,
      500,
      ERROR_CODES.SERVER_ERROR,
      error.message || String(error)
    );
  }
}
