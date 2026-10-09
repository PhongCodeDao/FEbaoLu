import axiosInstance from "../../axiosInstance";

/**
 * Lấy toàn bộ danh sách các cấp độ khẩn cấp
 */
export const getAllUrgencyLevels = async () => {
  try {
    const response = await axiosInstance.get("/api/urgency-levels");
    return response.data;
  } catch (error) {
    console.error("GET ALL URGENCY LEVELS ERROR:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * Lấy thông tin chi tiết một cấp độ khẩn cấp theo ID
 * @param {number} id 
 */
export const getUrgencyLevelDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/urgency-levels/${id}`);
    return response.data;
  } catch (error) {
    console.error("GET URGENCY LEVEL DETAIL ERROR:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * Tạo mới một cấp độ khẩn cấp
 * @param {Object} data - { levelName, description, slaMinutes }
 */
export const createUrgencyLevel = async (data) => {
  try {
    const response = await axiosInstance.post("/api/urgency-levels", data);
    return response.data;
  } catch (error) {
    console.error("CREATE URGENCY LEVEL ERROR:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * Cập nhật thông tin một cấp độ khẩn cấp theo ID
 * @param {number} id 
 * @param {Object} data - { levelName, description, slaMinutes }
 */
export const updateUrgencyLevel = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/urgency-levels/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("UPDATE URGENCY LEVEL ERROR:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * Xóa một cấp độ khẩn cấp theo ID
 * @param {number} id 
 */
export const deleteUrgencyLevel = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/urgency-levels/${id}`);
    return response.data;
  } catch (error) {
    console.error("DELETE URGENCY LEVEL ERROR:", error?.response || error);
    throw error?.response?.data || error;
  }
};
