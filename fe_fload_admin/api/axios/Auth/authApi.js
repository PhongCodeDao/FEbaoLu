// src/api/authApi.js

import axiosInstance from "../../axiosInstance";

export const loginApi = async ({ phone, password }) => {

  const response = await axiosInstance.post(
    "/api/User/login",
    {
      phone: phone.trim(),
      password: password.trim(),
    }
  );

  return response.data;
};

export const getUserProfile = async () => {

  try {

    const response = await axiosInstance.get(
      "/api/User/profile"
    );

    return response.data;

  } catch (error) {

    console.error("PROFILE ERROR:", error?.response);

    throw error?.response?.data || error;

  }

};

export const updateUserProfile = async (data) => {

  const response = await axiosInstance.put(
    "/api/User/profile",
    data
  );
  

  return response.data;

}
export const getProvinces = async () => {
  try {
    const response = await axiosInstance.get(
      "/api/geographic-areas/provinces",
      {
        headers: {
          accept: "text/plain", // nếu API yêu cầu text/plain
        },
      }
    );

    return response.data;

  } catch (error) {

    console.error("GET PROVINCES ERROR:", error?.response);

    throw error?.response?.data || error;
  }
};
export const getWardsByProvince = async (provinceId) => {
  try {
    const response = await axiosInstance.get(
      `/api/geographic-areas/provinces/${provinceId}/wards`,
      {
        headers: {
          accept: "text/plain", // đổi thành application/json nếu API trả JSON
        },
      }
    );

    return response.data;

  } catch (error) {

    console.error("GET WARDS ERROR:", error?.response);

    throw error?.response?.data || error;
  }
};
export const updateUser = async (id, data) => {

  try {

    const response = await axiosInstance.put(
      `/api/User/${id}`,
      {
        userId: Number(data?.userId ?? id),
        fullName: data?.fullName?.trim(),
        phone: data?.phone?.trim(),
        areaId: Number(data?.areaId ?? 0),
      }
    );

    return response.data;

  } catch (error) {

    console.error("UPDATE USER ERROR:", error?.response);

    throw error?.response?.data || error;

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