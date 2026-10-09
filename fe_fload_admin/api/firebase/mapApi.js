// import axios from "axios";

// const GOOGLE_MAP_KEY =
//   import.meta.env.VITE_GOOGLE_MAPS_KEY;


// /**
//  * FIX FORMAT lng,lat → lat,lng
//  */
// export const reverseGeocode = async (location) => {

//   try {

//     if (!location) return "Không xác định";

//     const [lng, lat] = location.split(",");

//     if (!lat || !lng)
//       return "Không xác định";


//     const response =
//       await axios.get(
//         "https://maps.googleapis.com/maps/api/geocode/json",
//         {
//           params: {

//             latlng: `${lat},${lng}`, // ✅ đảo lại

//             key: GOOGLE_MAP_KEY

//           }
//         }
//       );


//     if (
//       response.data.status === "OK" &&
//       response.data.results.length > 0
//     ) {

//       return response.data.results[0]
//         .formatted_address;

//     }

//     return "Không xác định";

//   }
//   catch (error) {

//     console.error(error);

//     return "Không xác định";

//   }

// };

import axios from "axios";


/**
 * Reverse geocode FREE (OpenStreetMap)
 * input: "lng,lat"
 * output: "Quận 1, TP Hồ Chí Minh"
 */
export const reverseGeocode = async (location) => {

  try {

    if (!location) return "Không xác định";

    const [lng, lat] = location.split(",");

    if (!lng || !lat) return "Không xác định";


    const res = await axios.get(

      "https://nominatim.openstreetmap.org/reverse",

      {

        params: {

          lat: lat,

          lon: lng,

          format: "json"

        }

      }

    );


    return res.data.display_name
      || "Không xác định";

  }

  catch {

    return "Không xác định";

  }

};