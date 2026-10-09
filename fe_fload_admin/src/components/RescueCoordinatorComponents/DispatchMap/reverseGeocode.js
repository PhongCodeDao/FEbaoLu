export async function getAddressFromLatLng(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      const data = await res.json();
      return data.display_name || "Không xác định địa chỉ";
    } catch {
      return "Không lấy được địa chỉ";
    }
  }