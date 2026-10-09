import { useState } from "react";
import MissionList from "../../../components/RescueCoordinatorComponents/MissionList";
import MissionDetail from "../../../components/RescueCoordinatorComponents/Veryfi/MissionDetail";
import { getRescueRequestById } from "../../../../api/axios/CoordinatorApi/RescueRequestApi";
import AuthNotify from "../../../utils/Common/AuthNotify";

import "./rc-mission-dispatch.layout.css";

export default function MissionDispatch() {

  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectMission = async (mission) => {
    const requestId = mission?.id || mission?.rescueRequestId;

    if (!requestId) {
      console.error("Missing ID:", mission);
      return;
    }
    
    try {
      setLoading(true);
    
      const data = await getRescueRequestById(requestId);
    
      setSelectedMission(data || mission);
    } catch (error) {
      console.error("Error fetching mission detail:", error);
      AuthNotify.error("Không thể tải chi tiết yêu cầu");
    
      setSelectedMission(mission);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rc-mission-dispatch">

      {/* LEFT */}
      <aside className="rc-mission-dispatch__sidebar">
        <MissionList onSelectMission={handleSelectMission} />
      </aside>

      {/* RIGHT */}
      <section className="rc-mission-dispatch__detail">

      {loading ? (
  <div className="rc-loading">
    {/* <div className="rc-spinner" /> */}
    <p>Đang tải dữ liệu...</p>
  </div>
) : (
  <MissionDetail mission={selectedMission} />
)}

      </section>

    </div>
  );
}