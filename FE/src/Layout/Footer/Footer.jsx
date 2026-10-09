import {
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaFacebookF,
  FaShareAlt,
  FaGlobe,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = () => {

  const navigate = useNavigate();

  return (
    <footer className="footer">

      <div className="footer-container">

        {/* LEFT */}
        <div className="footer-brand">

          <div className="brand">
            <div className="logo">✱</div>

            <div>
              <h3>CỨU HỘ BÃO LŨ VIỆT NAM</h3>
              <span>HỆ THỐNG HỖ TRỢ THIÊN TAI TRỰC TUYẾN</span>
            </div>
          </div>

          <p className="mission">
            “Sứ mệnh của chúng tôi là hỗ trợ và cứu trợ người dân
            trong các tình huống thiên tai như bão, lũ lụt và sạt lở,
            đảm bảo không ai bị bỏ lại phía sau.”
          </p>

          <div className="socials">

            <button onClick={() => window.open("https://facebook.com")}>
              <FaFacebookF />
            </button>

            <button onClick={() => navigator.share?.({
              title: "Cứu hộ bão lũ Việt Nam",
              url: window.location.href
            })}>
              <FaShareAlt />
            </button>

            <button onClick={() => navigate("/")}>
              <FaGlobe />
            </button>

          </div>

        </div>

        {/* SERVICES */}
        <div className="footer-col">
          <h4>DỊCH VỤ</h4>

          <ul>
            <li onClick={() => navigate("/rescue")}>Cứu nạn người mắc kẹt</li>
            <li onClick={() => navigate("/evacuation")}>Hỗ trợ sơ tán</li>
            <li onClick={() => navigate("/medical-support")}>Hỗ trợ y tế khẩn cấp</li>
            <li onClick={() => navigate("/relief")}>Tiếp tế lương thực</li>
          </ul>

        </div>

        {/* LEGAL */}
        <div className="footer-col">
          <h4>THÔNG TIN</h4>

          <ul>
            <li onClick={() => navigate("/about")}>Giới thiệu hệ thống</li>
            <li onClick={() => navigate("/guide")}>Hướng dẫn yêu cầu cứu hộ</li>
            <li onClick={() => navigate("/safety")}>Hướng dẫn an toàn mùa bão</li>
            <li onClick={() => navigate("/feedback")}>Góp ý & phản hồi</li>
          </ul>

        </div>

        {/* CONTACT */}
        <div className="footer-contact">
          <span className="contact-title">LIÊN HỆ TRỰC TIẾP</span>

          <div className="hotline-box">
            <small>TRUNG TÂM ĐIỀU PHỐI 24/7</small>
            <h2>1900 8888</h2>

            <div className="address">
              <FaMapMarkerAlt />
              <span>
                Trung tâm điều phối cứu hộ <br />
                Hà Nội, Việt Nam
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* BOTTOM */}

      <div className="footer-bottom">

        <span>© 2026 HỆ THỐNG CỨU HỘ BÃO LŨ VIỆT NAM</span>

        <div className="bottom-right">

          <span onClick={() => navigate("/privacy")}>
            CHÍNH SÁCH BẢO MẬT
          </span>

          <span onClick={() => navigate("/terms")}>
            ĐIỀU KHOẢN SỬ DỤNG
          </span>

          <span className="status">
            TRẠNG THÁI: <strong>ĐANG HOẠT ĐỘNG</strong>
          </span>

        </div>

      </div>

    </footer>
  );
};

export default Footer;