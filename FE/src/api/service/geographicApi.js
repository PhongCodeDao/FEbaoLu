import axiosInstance from "../service/axiosInstance";

/* ================= PROVINCES ================= */

export const getProvinces = async () => {
  const res = await axiosInstance.get(
    "/api/geographic-areas/provinces"
  );
  return res.data;
};


/* ================= WARDS BY PROVINCE ================= */

export const getWardsByProvince = async (provinceId) => {

  if (!provinceId) throw new Error("Thiếu provinceId");

  const res = await axiosInstance.get(
    `/api/geographic-areas/provinces/${provinceId}/wards`,
    {
      headers: { Accept: "application/json" }
    }
  );

  return typeof res.data === "string"
    ? JSON.parse(res.data)
    : res.data;
};

/* ================= ALL RESCUE TEAMS ================= */


export const getAllRescueTeams = async () => {
  const res = await axiosInstance.get(
    "/api/RescueTeams"
  );

  console.log("RAW TEAM RESPONSE:", res.data);

  return res.data; // 🔥 CHỈ return data
};

/* ================= RESCUE TEAM LOCATION ================= */

// export const getRescueTeamLocation = async (teamId) => {

//   if (!teamId) throw new Error("Thiếu teamId");

//   const res = await axiosInstance.get(
//     `/api/rescueteams/${teamId}/location`,
//     {
//       headers: { Accept: "*/*" }
//     }
//   );

//   return res.data;
// };
export const getRescueTeamLocation = async (teamId) => {
  const res = await axiosInstance.get(
    `/api/rescueteams/${teamId}/location`,
    {
      headers: { Accept: "*/*" }
    }
  );
  return res.data; // 🔥 QUAN TRỌNG (KHÔNG return res)
};
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "json"
        }
      }
    );

    return res.data.display_name;
  } catch {
    return null;
  }
};