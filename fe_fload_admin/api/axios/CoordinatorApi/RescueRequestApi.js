import axiosInstance from "../../axiosInstance";
import {
  getAllUrgencyLevels as getUrgencyLevelsCommon,
} from "../UrgencyLevels/urgencyLevelsApi";

/* ================= GET ALL RESCUE REQUESTS ================= */

export const getPendingRescueRequests = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/RescueRequests", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy RescueRequests:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách RescueRequests"
    );
  }
};

/* ================= GET URGENCY LEVEL ================= */

export const getUrgencyLevels = getUrgencyLevelsCommon;

/* ================= GET DISPATCHING REQUESTS ================= */

export const getDispatchingRescueRequests = async () => {
  try {
    const response = await axiosInstance.get("/api/RescueRequests/dispatch");
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách đang điều phối:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách đang điều phối"
    );
  }
};

/* ================= VERIFY REQUEST ================= */

export const verifyAndDispatchRescueRequest = async (requestId, data) => {
  try {
    const response = await axiosInstance.put(
      `/api/RescueRequests/${requestId}/verify`,
      {
        urgencyLevelId: data.urgencyLevelId,
        note: data.note,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi xác nhận yêu cầu:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể xác nhận yêu cầu cứu hộ"
    );
  }
};

/* ================= CONFIRM DISPATCH ================= */

export const confirmDispatchRescueRequest = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/api/RescueAssignments/batch",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("DISPATCH ERROR:", error?.response?.data || error.message);
    throw (
      error?.response?.data || { message: "Dispatch rescue request failed" }
    );
  }
};

/* ================= GET ALL ASSIGNMENTS ================= */

export const getAllAssignments = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/api/RescueAssignments", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy RescueAssignments:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách điều phối"
    );
  }
};

/* ================= UPDATE ASSIGNMENT ================= */

export const updateRescueAssignment = async (assignmentId, payload) => {
  try {
    const response = await axiosInstance.put(
      `/api/RescueAssignments/${assignmentId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("UPDATE ASSIGNMENT ERROR:", error);
    throw error;
  }
};

/* ================= GET ASSIGNMENT BY ID ================= */

export const getRescueAssignmentById = async (assignmentId) => {
  try {
    const response = await axiosInstance.get(
      `/api/RescueAssignments/${assignmentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy assignment:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải thông tin điều phối"
    );
  }
};

/* ================= REJECT RESCUE REQUEST ================= */

export const rejectRescueRequest = async (requestId, reason) => {
  try {
    const response = await axiosInstance.put(
      `/api/RescueRequests/${requestId}/reject`,
      {
        reason: reason,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi từ chối yêu cầu:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể từ chối yêu cầu cứu hộ"
    );
  }
};

/* ================= GET RESCUE REQUEST BY ID ================= */

export const getRescueRequestById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/RescueRequests/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy chi tiết RescueRequest:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải chi tiết yêu cầu cứu hộ"
    );
  }
};

/* ================= GET RESCUE PROGRESS ================= */

export const getRescueProgress = async (id) => {
  if (!id) {
    throw new Error("Thiếu ID yêu cầu");
  }

  try {
    const response = await axiosInstance.get(
      `/api/RescueRequests/${id}/progress`
    );
    return response.data;
  } catch (error) {
    console.error("GET RESCUE PROGRESS ERROR:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải tiến trình cứu hộ"
    );
  }
};

/* ================= GET RESCUE TEAM MEMBERS ================= */

export const getRescueTeamMembers = (teamId) => {
  return axiosInstance.get(`/api/rescueteams/${teamId}/members`);
};