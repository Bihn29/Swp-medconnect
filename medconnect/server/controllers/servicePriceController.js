/* =======================================================
 * CONTROLLER: ServicePriceController
 *  Quản lý giá dịch vụ - Chỉ Manager mới được truy cập
 * ======================================================= */

import ServicePrice from "../models/servicePrice.model.js";
import User from "../models/user.model.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

/**
 * Get all service prices (active and inactive)
 * GET /api/managers/service-prices
 */
export async function getAllServicePrices(req, res) {
  try {
    const { isActive } = req.query;
    
    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const servicePrices = await ServicePrice.find(filter)
      .populate("createdBy", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    return ok(res, { servicePrices });
  } catch (error) {
    console.error("Error fetching service prices:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get single service price by ID
 * GET /api/managers/service-prices/:id
 */
export async function getServicePriceById(req, res) {
  try {
    const { id } = req.params;

    const servicePrice = await ServicePrice.findById(id)
      .populate("createdBy", "fullName email")
      .lean();

    if (!servicePrice) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Service price not found");
    }

    return ok(res, { servicePrice });
  } catch (error) {
    console.error("Error fetching service price:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Create new service price
 * POST /api/managers/service-prices
 */
export async function createServicePrice(req, res) {
  try {
    const { serviceName, price } = req.body;
    const userId = req.user?.app_user_id || req.user?.uid;

    if (!userId) {
      return fail(res, 401, ERROR_CODES.UNAUTHORIZED, "User ID not found");
    }

    // Validate input
    if (!serviceName || !serviceName.trim()) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Service name is required"
      );
    }

    if (!price || price < 0 || !Number.isInteger(Number(price))) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Price must be a positive integer"
      );
    }

    // Check if service name already exists
    const existingService = await ServicePrice.findOne({
      serviceName: serviceName.trim(),
    });

    if (existingService) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Service name already exists"
      );
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "User not found");
    }

    // Create service price
    const servicePrice = new ServicePrice({
      serviceName: serviceName.trim(),
      price: parseInt(price),
      createdBy: user._id,
    });

    await servicePrice.save();

    const populatedServicePrice = await ServicePrice.findById(servicePrice._id)
      .populate("createdBy", "fullName email")
      .lean();

    return ok(res, {
      servicePrice: populatedServicePrice,
      message: "Service price created successfully",
    });
  } catch (error) {
    console.error("Error creating service price:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Service name already exists"
      );
    }

    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Update service price
 * PUT /api/managers/service-prices/:id
 */
export async function updateServicePrice(req, res) {
  try {
    const { id } = req.params;
    const { serviceName, price, isActive } = req.body;

    const servicePrice = await ServicePrice.findById(id);

    if (!servicePrice) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Service price not found");
    }

    // Validate input
    if (serviceName !== undefined) {
      if (!serviceName || !serviceName.trim()) {
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Service name cannot be empty"
        );
      }

      // Check if service name already exists (excluding current record)
      const existingService = await ServicePrice.findOne({
        serviceName: serviceName.trim(),
        _id: { $ne: id },
      });

      if (existingService) {
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Service name already exists"
        );
      }

      servicePrice.serviceName = serviceName.trim();
    }

    if (price !== undefined) {
      if (price < 0 || !Number.isInteger(Number(price))) {
        return fail(
          res,
          400,
          ERROR_CODES.INVALID_INPUT,
          "Price must be a positive integer"
        );
      }
      servicePrice.price = parseInt(price);
    }

    if (isActive !== undefined) {
      servicePrice.isActive = isActive === true || isActive === "true";
    }

    await servicePrice.save();

    const populatedServicePrice = await ServicePrice.findById(id)
      .populate("createdBy", "fullName email")
      .lean();

    return ok(res, {
      servicePrice: populatedServicePrice,
      message: "Service price updated successfully",
    });
  } catch (error) {
    console.error("Error updating service price:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return fail(
        res,
        400,
        ERROR_CODES.INVALID_INPUT,
        "Service name already exists"
      );
    }

    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Delete service price (soft delete by setting isActive = false)
 * DELETE /api/managers/service-prices/:id
 */
export async function deleteServicePrice(req, res) {
  try {
    const { id } = req.params;

    const servicePrice = await ServicePrice.findById(id);

    if (!servicePrice) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Service price not found");
    }

    // Soft delete - set isActive to false
    servicePrice.isActive = false;
    await servicePrice.save();

    return ok(res, {
      message: "Service price deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service price:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Get active service prices (for doctor to select services)
 * GET /api/service-prices/active
 */
export async function getActiveServicePrices(req, res) {
  try {
    const servicePrices = await ServicePrice.find({ isActive: true })
      .select("serviceName price")
      .sort({ serviceName: 1 })
      .lean();

    return ok(res, { servicePrices });
  } catch (error) {
    console.error("Error fetching active service prices:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}
