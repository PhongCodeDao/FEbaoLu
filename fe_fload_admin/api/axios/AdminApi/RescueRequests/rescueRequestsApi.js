import axiosInstance from "../../../axiosInstance";

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
      note: data.note || ""
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
    // API might expect { rejectReason: "..." } or { reason: "..." }
    // Based on previous code, it was { reason: reason }
    const response = await axiosInstance.put(`/api/RescueRequests/${id}/reject`, { reason: rejectReason });
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
/**
 * Get all urgency levels.
 */
export const getUrgencyLevels = async () => {
  try {
    const response = await axiosInstance.get("/api/urgency-levels");
    return response.data;
  } catch (error) {
    console.error("Error fetching urgency levels:", error);
    throw error;
  }
};

/**
 * Create a new urgency level.
 */
export const createUrgencyLevel = async (data) => {
  try {
    const response = await axiosInstance.post("/api/urgency-levels", data);
    return response.data;
  } catch (error) {
    console.error("Error creating urgency level:", error);
    throw error;
  }
};

/**
 * Get urgency level by ID.
 */
export const getUrgencyLevelById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/urgency-levels/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching urgency level ${id}:`, error);
    throw error;
  }
};

/**
 * Update an urgency level.
 */
export const updateUrgencyLevel = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/urgency-levels/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating urgency level ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an urgency level.
 */
export const deleteUrgencyLevel = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/urgency-levels/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting urgency level ${id}:`, error);
    throw error;
  }
};

/** ================= REQUEST LOGS (AUDIT) ================= **/

/**
 * Get list of logs for a specific rescue request.
 * @param {number} rescueRequestId 
 */
export const getRequestLogs = async (rescueRequestId) => {
  try {
    const response = await axiosInstance.get("/api/request-logs", {
      params: { rescueRequestId }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching logs for request ${rescueRequestId}:`, error);
    throw error;
  }
};

/**
 * Create a new request log.
 * @param {Object} data - { rescueRequestId, action, performedBy }
 */
export const createRequestLog = async (data) => {
  try {
    const response = await axiosInstance.post("/api/request-logs", data);
    return response.data;
  } catch (error) {
    console.error("Error creating request log:", error);
    throw error;
  }
};

/**
 * Get detail of a specific log entry.
 */
export const getRequestLogById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/request-logs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching request log ${id}:`, error);
    throw error;
  }
};

/** ================= ALIASES FOR COMPATIBILITY ================= **/

export const getAllAssignments = getAllRescueAssignments;
export const getPendingRescueRequests = getDispatchQueue;
export const getDispatchingRescueRequests = getDispatchQueue;
export const verifyAndDispatchRescueRequest = verifyRescueRequest;
export const confirmDispatchRescueRequest = createRescueAssignment;
export const getAllRequestLogs = getRequestLogs;
export const getAllUrgencyLevels = getUrgencyLevels;
