import axiosInstance from "./axiosInstance";

/* ================================
   CREATE RESCUE REQUEST
================================ */

export const createRescueRequest = async (payload) => {

  try {

    const response = await axiosInstance.post(
      "/api/RescueRequests",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*"
        }
      }
    );

    return response.data;

  } catch (error) {

    console.error("Create Rescue Request Error:", error);

    throw error;

  }

};