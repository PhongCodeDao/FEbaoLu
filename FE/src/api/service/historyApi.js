// src/api/service/emergencyApi.js
import axiosInstance from "../service/axiosInstance"; // import instance axios của bạn

// 1. Tra cứu lịch sử cứu hộ theo số điện thoại (GET)
export const getRescueHistoryByPhone = async (phone) => {

  if (!phone) throw new Error("Số điện thoại không được để trống");

  // Chuẩn hóa số điện thoại
  const cleanPhone = phone.replace(/[^\d]/g, "");

  try {

    const response = await axiosInstance.get(
      `/api/RescueRequests`,
      {
        params: {
          ContactPhone: cleanPhone
        }
      }
    );

    return response.data;

  } catch (error) {

    console.error("Lỗi tra cứu lịch sử cứu hộ:", error);

    const errMsg =
      error.response?.data?.message ||
      error.message ||
      "Không tìm thấy lịch sử";

    throw new Error(errMsg);

  }

};
// 2. Xóa yêu cầu cứu hộ theo ID (DELETE)
export const deleteRescueRequest = async (id) => {
  if (!id) throw new Error("Thiếu ID yêu cầu");

  try {
    const response = await axiosInstance.delete(
      `/api/RescueRequests/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi xóa yêu cầu:", error);
    const errMsg =
      error.response?.data?.message ||
      error.message ||
      "Không thể xóa yêu cầu";
    throw new Error(errMsg);
  }
};
// ================= UPDATE RESCUE REQUEST =================

export const updateRescueRequest = async (id, payload) => {
  if (!id) throw new Error("Thiếu ID yêu cầu");

  try {
    const response = await axiosInstance.put(
      `/api/RescueRequests/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật yêu cầu:", error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Cập nhật thất bại"
    );
  }
};
export const getRescueRequestById = async (id) => {

  if (!id) {
    throw new Error("Thiếu ID yêu cầu");
  }

  try {

    const response = await axiosInstance.get(
      `/api/RescueRequests/${id}`,
      {
        headers: {
          accept: "*/*"
        }
      }
    );

    return response.data;

  } catch (error) {

    console.error("Get Rescue Request Detail Error:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải chi tiết yêu cầu"
    );

  }

};
export const getRequestStatuses = async () => {

  try {

    const response = await axiosInstance.get(
      "/api/request-statuses",
      {
        headers: {
          accept: "*/*",
        },
      }
    );

    return response.data;

  } catch (error) {

    console.error("GET REQUEST STATUSES ERROR:", error?.response);

    throw error?.response?.data || error;

  }

};
// ================= GET RESCUE PROGRESS =================

export const getRescueProgress = async (id) => {

  if (!id) {
    throw new Error("Thiếu ID yêu cầu");
  }

  try {

    const response = await axiosInstance.get(
      `/api/RescueRequests/${id}/progress`,
      {
        headers: {
          accept: "*/*"
        }
      }
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
export const getUrgencyLevels = async () => {

  try {

    const response = await axiosInstance.get(
      "/api/urgency-levels"
    );

    return response.data;

  }
  catch (error) {

    console.error("Lỗi lấy mức độ khẩn cấp:", error);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      "Không thể tải danh sách mức độ khẩn cấp"
    );

  }

};
export const completeRescueRequest = async (id, note = "") => {

  if (!id) throw new Error("Thiếu ID yêu cầu");

  try {

    const response = await axiosInstance.put(
      `/api/RescueRequests/${id}/complete`,
      {
        note: note || ""
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*"
        }
      }
    );

    return response.data;

  } catch (error) {

    console.error("COMPLETE RESCUE ERROR:", error);

    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      "Không thể xác nhận hoàn thành"
    );

  }

};
