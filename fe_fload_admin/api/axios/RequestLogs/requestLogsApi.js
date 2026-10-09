import axiosInstance from "../../axiosInstance";

/**
 * Get all request logs for a specific rescue request.
 * If rescueRequestId is not provided, it may return all logs (depending on API behavior).
 * @param {number} rescueRequestId 
 * @returns {Promise<Array>}
 */
export const getAllRequestLogs = async (rescueRequestId) => {
  try {
    const params = rescueRequestId ? { rescueRequestId } : {};
    const response = await axiosInstance.get("/api/request-logs/all", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching request logs:", error);
    throw error;
  }
};

/**
 * Create a new request log entry.
 * @param {Object} logData - { rescueRequestId: number, action: string, performedBy: number }
 * @returns {Promise<Object>}
 */
export const createRequestLog = async (logData) => {
  try {
    const response = await axiosInstance.post("/api/request-logs", logData);
    return response.data;
  } catch (error) {
    console.error("Error creating request log:", error);
    throw error;
  }
};

/**
 * Get details of a specific request log.
 * @param {number} id 
 * @returns {Promise<Object>}
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

/**
 * Note: PUT and DELETE are not supported for RequestLog as per Swagger, 
 * but endpoints exist and return 200 OK without side effects.
 */
