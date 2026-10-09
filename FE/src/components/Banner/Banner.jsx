import "./Banner.css";
import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Banner = () => {

  const navigate = useNavigate();

  const handleEmergency = () => {
    navigate("/emergency");
  };

  // const handleMore = () => {
  //   navigate("/about");
  // };

  return (
    <section className="hero-banner">
      <div className="hero-overlay" />

      <div className="hero-content">
        <div className="hero-badge">
          <span className="dot"></span>
          TRỰC TUYẾN 24/7 · SẴN SÀNG ỨNG CỨU
        </div>

        <h1 className="hero-title">
          MỌI NẺO ĐƯỜNG <br />
          <span>CHÚNG TÔI CÓ MẶT</span>
        </h1>

        <p className="hero-desc">
          Hệ thống điều phối cứu hộ thông minh đầu tiên tại Việt Nam.
          Kết nối đội cứu trợ gần nhất trong vòng 15 phút.
        </p>

        <div className="hero-actions">
          <button className="btn-emergency" onClick={handleEmergency}>
            <FaExclamationTriangle />
            GỬI YÊU CẦU CỨU TRỢ
          </button>

          {/* <button className="btn-outline" onClick={handleMore}>
            <FaInfoCircle />
            Tìm hiểu thêm
          </button> */}
        </div>
      </div>
    </section>
  );
};

export { Banner as default };