import "./EmergencyHeader.css";
import { NavLink, Link } from "react-router-dom";
import { FaPhoneAlt, FaAmbulance } from "react-icons/fa";

const EmergencyHeader = () => {
  return (
    <header className="emergency-header">

      {/* LOGO */}
      <Link to="/" className="logoemergency">
        <FaAmbulance className="logo-icon-emergency" />
       
        <div className="title-emergency">
          <h3>Yêu Cầu CỨU HỘ</h3>
          <span>HỆ THỐNG TRỰC TUYẾN</span>
        </div>
      </Link>

      {/* NAVIGATION */}
      <nav className="nav">
        <NavLink to="/">Trang chủ</NavLink>
        <NavLink to="/map">Bản đồ cứu hộ</NavLink>
        <NavLink to="/map">Tra Cứu Yêu Cầu</NavLink>
      </nav>

      {/* HOTLINE */}
      <a href="tel:18001111" className="hotline-btn">
        <FaPhoneAlt />
        <span>1800 1111</span>
      </a>

    </header>
  );
};

export default EmergencyHeader;