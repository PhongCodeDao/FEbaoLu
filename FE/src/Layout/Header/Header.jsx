import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = () => {

  const navigate = useNavigate();

  const handleCall = () => {
    window.location.href = "tel:19008888";
  };

  return (
    <header className="header">
      <div className="header-container">

        {/* LEFT - LOGO */}
        <div className="header-logo" onClick={() => navigate("/")}>
          <img
            src="https://intriphat.com/wp-content/uploads/2023/09/logo-chu-thap-do.png"
            alt="Cứu hộ Việt Nam"
          />
        </div>

        {/* CENTER - MENU */}
        <nav className="header-menu">
        <button onClick={() => navigate("/")}>TRANG CHỦ</button>
          <button onClick={() => navigate("/map")}>TRA CỨU</button>      
          <button onClick={() => navigate("/newpage")}>TIN TỨC</button>
          <button onClick={() => navigate("/map")}>BẢN ĐỒ</button>
        </nav>

        {/* RIGHT */}
        <div className="header-actions">

          {/* <div className="search-box">
            <input placeholder="Tìm kiếm cứu trợ..." />
          </div> */}

          <div className="hotline">
            <span>HOTLINE 24/7</span>
            <strong>
              <a href="tel:19008888">1900 8888</a>
            </strong>
          </div>

          <button className="call-btn" onClick={handleCall}>
            📞 GỌI NGAY
          </button>

        </div>

      </div>
    </header>
  );
};

export default Header;