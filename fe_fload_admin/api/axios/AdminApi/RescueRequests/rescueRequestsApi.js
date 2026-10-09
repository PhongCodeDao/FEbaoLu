import axiosInstance from "../../../axiosInstance";
import {
  getAllUrgencyLevels,
  getUrgencyLevelDetail as getUrgencyLevelById,
  createUrgencyLevel,
  updateUrgencyLevel,
  deleteUrgencyLevel,
} from "../../UrgencyLevels/urgencyLevelsApi";
import {
  getAllRequestLogs as getRequestLogs,
  createRequestLog,
  getRequestLogById,
} from "../../RequestLogs/requestLogsApi";

/** ================= RESCUE REQUESTS ================= **/

/**
 * Get all rescue requests with optional filters.
 * @param {Object} params - { RequestType, Urgency, Area, Status }
 */
export const getAllRescueRequests = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/RescueRequests", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching rescue requests:", error);
    throw error;
  }
};

/**
 * Get requests currently in the dispatch queue.
 */
export const getDispatchQueue = async () => {
  try {
    const response = await axiosInstance.get("/api/RescueRequests/dispatch");
    return response.data;
  } catch (error) {
    console.error("Error fetching dispatch queue:", error);
    throw error;
  }
};

/**
 * Get ongoing rescue requests.
 */
export const getOngoingRequests = async () => {
  try {
    const response = await axiosInstance.get("/api/RescueRequests/OnGoing");
    return response.data;
  } catch (error) {
    console.error("Error fetching ongoing requests:", error);
    throw error;
  }
};

/**
 * Get detailed info for a specific rescue request.
 */
export const getRescueRequestById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/RescueRequests/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching rescue request ${id}:`, error);
    throw error;
  }
};

/**
 * Verify and dispatch a request.
 */
export const verifyRescueRequest = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/RescueRequests/${id}/verify`, {
      urgencyLevelId: data.urgencyLevelId,
      note: data.note || "",
    });
    return response.data;
  } catch (error) {
    console.error(`Error verifying rescue request ${id}:`, error);
    throw error;
  }
};

/**
 * Reject a rescue request.
 */
export const rejectRescueRequest = async (id, rejectReason) => {
  try {
    const response = await axiosInstance.put(`/api/RescueRequests/${id}/reject`, {
      reason: rejectReason,
    });
    return response.data;
  } catch (error) {
    console.error(`Error rejecting rescue request ${id}:`, error);
    throw error;
  }
};

/**
 * Mark a mission as complete.
 */
export const completeRescueRequest = async (id) => {
  try {
    const response = await axiosInstance.put(`/api/RescueRequests/${id}/complete`);
    return response.data;
  } catch (error) {
    console.error(`Error completing rescue request ${id}:`, error);
    throw error;
  }
};

/** ================= RESCUE ASSIGNMENTS ================= **/

/**
 * Create a new rescue assignment (dispatch a team).
 */
export const createRescueAssignment = async (payload) => {
  try {
    const response = await axiosInstance.post("/api/RescueAssignments", payload);
    return response.data;
  } catch (error) {
    console.error("Error creating rescue assignment:", error);
    throw error;
  }
};

/**
 * Get all rescue assignments with optional filters.
 */
export const getAllRescueAssignments = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/RescueAssignments", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching rescue assignments:", error);
    throw error;
  }
};

/**
 * Get detailed info for a specific rescue assignment.
 */
export const getRescueAssignmentById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/RescueAssignments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching rescue assignment ${id}:`, error);
    throw error;
  }
};

/**
 * Update a rescue assignment status or info.
 */
export const updateRescueAssignment = async (id, payload) => {
  try {
    const response = await axiosInstance.put(`/api/RescueAssignments/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating rescue assignment ${id}:`, error);
    throw error;
  }
};

/** ================= RE-EXPORT URGENCY LEVELS (SINGLE SOURCE OF TRUTH) ================= **/
export {
  getAllUrgencyLevels,
  getUrgencyLevelById,
  createUrgencyLevel,
  updateUrgencyLevel,
  deleteUrgencyLevel,
};

export const getUrgencyLevels = getAllUrgencyLevels;

/** ================= RE-EXPORT REQUEST LOGS (AUDIT) ================= **/
export {
  getRequestLogs,
  createRequestLog,
  getRequestLogById,
};

export const getAllRequestLogs = getRequestLogs;

/** ================= ALIASES FOR BACKWARD COMPATIBILITY ================= **/
export const getAllAssignments = getAllRescueAssignments;
export const getPendingRescueRequests = getDispatchQueue;
export const getDispatchingRescueRequests = getDispatchQueue;
export const verifyAndDispatchRescueRequest = verifyRescueRequest;
export const confirmDispatchRescueRequest = createRescueAssignment;
