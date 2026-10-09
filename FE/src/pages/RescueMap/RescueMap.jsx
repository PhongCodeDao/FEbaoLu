import { useState } from "react";
import MapHeader from "../../Layout/MapHeader/MapHeader";
import RescueSidebar from "../../components/RescueSidebar/RescueSidebar";
import "./RescueMap.css";
import { EnvironmentOutlined } from "@ant-design/icons";



export default function RescueMap() {
  const [pos, setPos] = useState([]);
  const [zoom, setZoom] = useState(14);

  /* ===== GPS (GIỐNG GOOGLE MAP WEB) ===== */
  const locateUser = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ GPS");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
  
        console.log("GPS:", lat, lng); // 👈 xem có log không
  
        setPos({ lat, lng });
        setZoom(17);
      },
      (err) => {
        console.log(err);
        alert("Không lấy được vị trí");
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="rescue-page">
      <MapHeader />

      <div className="map-layout">
        <RescueSidebar />

        <div className="map-wrapper">
          {/* GOOGLE MAP IFRAME */}
          <iframe
  key={`${pos.lat}-${pos.lng}`}   // 👈 ép React render lại
  title="map"
  src={`https://www.google.com/maps?q=${pos.lat},${pos.lng}&z=${zoom}&output=embed`}
  loading="lazy"
  allowFullScreen
/>

          {/* GPS BUTTON */}
          <button className="gps-btn" onClick={locateUser} title="Vị trí của tôi">
          <EnvironmentOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
