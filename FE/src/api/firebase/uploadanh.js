import axiosInstance from "../service/axiosInstance";
import axios from "axios";
/* ================= UPLOAD IMAGE ================= */

export const uploadImages = async (files, folder = "citizen") => {

  const formData = new FormData();

  files.forEach((file) => {
    formData.append("Files", file);
  });

  formData.append("Folder", folder || "citizen");

  const res = await axiosInstance.post(
    "/api/Upload/images",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data;

};


/* ================= VERIFY FLOOD IMAGE ================= */

export const verifyFloodImage = async (file) => {

  const formData = new FormData();

  // 🔥 BẮT BUỘC key = image
  formData.append("image", file);

  const res = await axiosInstance.post(
    "/api/ImageVerification/verify-flood",
    formData
  );

  return res.data;
};
