import {
  FaLocationDot,
  FaBolt
} from "react-icons/fa6";

import "./NetworkSection.css";

const NetworkSection = () => {
  return (
    <section className="network-section">
      <div className="network-container">

        {/* LEFT */}
        <div className="network-left">

          <span className="network-tag">MẠNG LƯỚI CỨU HỘ THIÊN TAI</span>

          <h2 className="network-title">
            HỆ THỐNG ĐỘI CỨU HỘ <br />
            ỨNG PHÓ BÃO LŨ TOÀN QUỐC
          </h2>

          <p className="network-desc">
            Chúng tôi xây dựng mạng lưới liên kết với các
            <strong> đội cứu hộ chuyên nghiệp</strong>, lực lượng
            <strong> tình nguyện</strong> và các trung tâm
            <strong> phòng chống thiên tai</strong> tại
            <strong> 63 tỉnh thành</strong> nhằm hỗ trợ người dân
            kịp thời trong các tình huống
            <strong> bão, lũ lụt, sạt lở và thiên tai khẩn cấp</strong>.
          </p>

          <div className="network-features">

            <div className="feature-item">
              <FaLocationDot className="feature-icon" />
              <div>
                <h4>ĐỊNH VỊ NẠN NHÂN CHÍNH XÁC</h4>
                <p>
                  Hệ thống xác định vị trí GPS của người cần trợ giúp để
                  điều phối đội cứu hộ gần nhất tiếp cận hiện trường.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <FaBolt className="feature-icon" />
              <div>
                <h4>ĐIỀU PHỐI CỨU HỘ NHANH CHÓNG</h4>
                <p>
                  Trung tâm điều phối lập tức phân công đội cứu hộ
                  phù hợp để tiếp cận khu vực bị ảnh hưởng bởi bão lũ.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="network-right">

          <div className="map-card">

            <iframe
              title="Bản đồ cứu hộ Việt Nam"
              src="https://maps.google.com/maps?q=vietnam&t=&z=6&ie=UTF8&iwloc=&output=embed"
              className="map-frame"
              loading="lazy"
            ></iframe>

          </div>

        </div>

      </div>
    </section>
  );
};

export default NetworkSection;