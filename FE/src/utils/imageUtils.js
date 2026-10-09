// src/utils/imageUtils.js

export const API_BASE = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "https://bebaolu.onrender.com"
).replace(/\/$/, "");

export const FALLBACK_RESCUE_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f1f5f9'/><text x='50%25' y='42%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36'>📷</text><text x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23475569' font-weight='600'>Hình ảnh hiện trường</text><text x='50%25' y='72%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394a3b8'>Ảnh lưu tạm hoặc đã hết hạn lưu trữ</text></svg>";

export const FALLBACK_VEHICLE_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f1f5f9'/><text x='50%25' y='42%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='36'>🚐</text><text x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23475569' font-weight='600'>Phương tiện cứu hộ</text><text x='50%25' y='72%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394a3b8'>Chưa có ảnh chụp thực tế</text></svg>";

/**
 * Chuẩn hóa một URL ảnh bất kỳ (xử lý domain cũ, relative path, localhost)
 */
export const resolveImageUrl = (rawUrl) => {
  if (!rawUrl) return "";
  let clean = String(rawUrl).trim();
  if (!clean || clean === "string" || clean === "/string") return "";

  // Thay thế domain cũ đã chết hoặc localhost
  if (clean.includes("api-rescue.purintech.id.vn")) {
    clean = clean.replace("https://api-rescue.purintech.id.vn", API_BASE);
  } else if (clean.startsWith("http://localhost:8080")) {
    clean = clean.replace("http://localhost:8080", API_BASE);
  } else if (clean.startsWith("http://localhost:5200")) {
    clean = clean.replace("http://localhost:5200", API_BASE);
  }

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  const path = clean.replace(/^\/+/, "");
  return `${API_BASE}/${path}`;
};

/**
 * Trích xuất và chuẩn hóa toàn bộ ảnh từ object yêu cầu cứu trợ / nhiệm vụ
 */
export const extractImageUrls = (data) => {
  if (!data) return [];
  const rawList = [];

  if (Array.isArray(data.imageUrls)) {
    rawList.push(...data.imageUrls);
  }
  if (Array.isArray(data.images)) {
    rawList.push(...data.images);
  }
  if (data.locationImageUrl) {
    if (typeof data.locationImageUrl === "string") {
      rawList.push(...data.locationImageUrl.split(","));
    } else if (Array.isArray(data.locationImageUrl)) {
      rawList.push(...data.locationImageUrl);
    }
  }
  if (Array.isArray(data.attachments)) {
    data.attachments.forEach((att) => {
      const url = att?.url || att?.fileUrl || (typeof att === "string" ? att : null);
      if (url) rawList.push(url);
    });
  }

  return [...new Set(
    rawList
      .map((item) => (item ? String(item).trim() : ""))
      .filter((item) => item && item !== "string" && item !== "/string")
      .map((item) => resolveImageUrl(item))
  )];
};
