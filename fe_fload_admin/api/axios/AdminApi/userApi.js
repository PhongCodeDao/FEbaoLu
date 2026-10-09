// src/api/userApi.js

import axiosInstance from "../../axiosInstance";

export const registerUser = async (data) => {

  try {

    const payload = {
      phone: data?.phone?.trim() || "",
      password: data?.password || "",
      name: data?.name?.trim() || "",
      roleId: Number(data?.roleId ?? 0),
      areaId: Number(data?.areaId ?? 0),
    };

    const response = await axiosInstance.post(
      "/api/User/register",
      payload
    );

    return response?.data;

  } catch (error) {

    console.error("REGISTER ERROR:", error?.response || error);

    throw error?.response?.data?.message || "Đăng ký user thất bại";

  }

};

export const getAllUser = async () => {

    try {
  
      const response = await axiosInstance.get(
        "/api/User/all"   // FIX thêm dấu /
      );
  
      return response.data;
  
    } catch (error) {
  
      console.error("GET ALL USER ERROR:", error?.response);
  
      throw error?.response?.data || error;
  
    }
  
  };
  export const deleteUser = async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/User/${id}`);
      
      // Có thể thêm kiểm tra nếu muốn chặt chẽ hơn
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Unexpected status: ${response.status}`);
      }
      
      return response.data;  
    } catch (error) {
      console.error("DELETE USER ERROR:", error);
      // Có thể log thêm response nếu có
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
      throw error;
    }
  };