import axiosInstance from "../../../axiosInstance";

/**
 * Lấy toàn bộ danh sách cấu hình hệ thống
 * @param {string} configGroup - Lọc theo nhóm cấu hình
 * @param {string} searchKeyword - Tìm kiếm theo từ khóa
 */
export const getAllSystemConfigurations = async (configGroup = "", searchKeyword = "") => {
  try {
    const response = await axiosInstance.get("/api/SystemConfigurations", {
      params: {
        ConfigGroup: configGroup,
        SearchKeyword: searchKeyword,
      },
    });
    return response.data;
  } catch (error) {
    console.error("GET ALL CONFIGS ERROR:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * Lấy chi tiết một tham số cấu hình theo ConfigKey
 * @param {string} configKey 
 */
export const getSystemConfigurationDetail = async (configKey) => {
  try {
    const response = await axiosInstance.get(`/api/SystemConfigurations/${configKey}`);
    return response.data;
  } catch (error) {
    console.error("GET CONFIG DETAIL ERROR:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * Cập nhật giá trị của một tham số cấu hình
 * @param {string} configKey 
 * @param {Object} data - { configKey, configValue, configGroup, description }
 */
export const updateSystemConfiguration = async (configKey, data) => {
  try {
    const response = await axiosInstance.put(`/api/SystemConfigurations/${configKey}`, data);
    return response.data;
  } catch (error) {
    console.error("UPDATE CONFIG ERROR:", error?.response || error);
    throw error?.response?.data || error;
  }
};

/**
 * Nạp các giá trị cấu hình mặc định ban đầu cho hệ thống
 */
export const seedSystemConfigurations = async () => {
  try {
    const response = await axiosInstance.post("/api/SystemConfigurations/seed");
    return response.data;
  } catch (error) {
    console.error("SEED CONFIGS ERROR:", error?.response || error);
    throw error?.response?.data || error;
  }
};
