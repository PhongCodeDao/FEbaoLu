import "./Services.css";
import { useState } from "react";
import {
  FaCarSide,
  FaMotorcycle,
  FaBriefcaseMedical,
  FaHouseFloodWater,
} from "react-icons/fa6";

const services = [
  {
    icon: <FaCarSide />,
    title: "CỨU NẠN NGƯỜI BỊ MẮC KẸT",
    desc: "Triển khai đội cứu hộ tiếp cận và giải cứu người dân bị mắc kẹt.",
  },
  {
    icon: <FaMotorcycle />,
    title: "HỖ TRỢ SƠ TÁN KHẨN CẤP",
    desc: "Tổ chức sơ tán người dân khỏi khu vực nguy hiểm.",
  },
  {
    icon: <FaBriefcaseMedical />,
    title: "HỖ TRỢ Y TẾ & SƠ CỨU",
    desc: "Cung cấp sơ cứu ban đầu và hỗ trợ vận chuyển người bị thương.",
  },
  {
    icon: <FaHouseFloodWater />,
    title: "TIẾP TẾ LƯƠNG THỰC",
    desc: "Phân phối nước uống và nhu yếu phẩm cho vùng lũ.",
  },
];

export default function Services() {

  const [active,setActive] = useState(null);

  return (
    <section className="services">

      <div className="services-header">

        <div>
          <span className="services-label">DỊCH VỤ CỨU HỘ</span>
          <h2>
            HỖ TRỢ NGƯỜI DÂN <br/> TRONG THIÊN TAI BÃO LŨ
          </h2>
        </div>

        <p>
          Hệ thống cứu hộ hỗ trợ người dân trong các tình huống thiên tai
          với mạng lưới phản ứng nhanh trên toàn quốc.
        </p>

      </div>

      <div className="services-grid">

        {services.map((item,index)=>(
          <div
            className="service-card"
            key={item.title}
            onClick={()=>setActive(item)}
          >

            <div className="icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>

            <a>
              XEM CHI TIẾT <span>→</span>
            </a>

          </div>
        ))}

      </div>


      {/* POPUP */}

      {active && (

        <div
          className="service-popup"
          onClick={()=>setActive(null)}
        >

          <div
            className="popup-card"
            onClick={(e)=>e.stopPropagation()}
          >

            <div className="popup-icon">{active.icon}</div>

            <h2>{active.title}</h2>

            <p>{active.desc}</p>

            <button
              className="popup-close"
              onClick={()=>setActive(null)}
            >
              ĐÓNG
            </button>

          </div>

        </div>

      )}

    </section>
  );
}