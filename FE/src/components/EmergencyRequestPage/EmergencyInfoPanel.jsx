import "../../pages/EmergencyRequest/EmergencyRequest.css";

const EmergencyInfoPanel = ({ timeAgo }) => {

    return (
    
        <aside className="emergency-info">

        {/* ===== BOX 1: HOTLINE ===== */}
        <div className="info-card hotline-card">
          <div className="card-header red">
            <span>📞 HOTLINE KHẨN CẤP</span>
          </div>
        
          <div className="card-body">
            <div className="hotline-item">🚓 113 – CẢNH SÁT</div>
            <div className="hotline-item">🔥 114 – CỨU HỎA</div>
            <div className="hotline-item">🚑 115 – CẤP CỨU</div>
          </div>
        </div>
        
        {/* ===== BOX 2: HƯỚNG DẪN ===== */}
        <div className="info-card guide-card">
          <div className="card-header blue">
            <span>📘 HƯỚNG DẪN AN TOÀN</span>
          </div>
        
          <div className="card-body">
            <ul className="guide-list">
              <li>Giữ điện thoại luôn bật.</li>
              <li>Di chuyển đến nơi an toàn.</li>
              <li>Dùng đèn pin hoặc vật sáng.</li>
            </ul>
          </div>
        </div>
        
        {/* ===== BOX 3: TRẠNG THÁI ===== */}
        <div className="info-card status-card">
          <div className="card-header green">
            <span>TRẠNG THÁI HỆ THỐNG</span>
          </div>
        
          <div className="card-body status-body">
            <div className="status-line">
              <span className="status-dot"></span>
              <span className="status-text">
                HỆ THỐNG : ĐANG HOẠT ĐỘNG
              </span>
            </div>
        
            <div className="status-update">
          Cập nhật: {timeAgo}
        </div>
          </div>
        </div>
        
        </aside>
    
    );
    
    };
    
    export default EmergencyInfoPanel;