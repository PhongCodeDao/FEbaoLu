import { useState } from "react";
import MissionList from "../../../components/RescueCoordinatorComponents/MissionList";
import MissionDetail from "../../../components/RescueCoordinatorComponents/Veryfi/MissionDetail";
import { getRescueRequestById } from "../../../../api/axios/CoordinatorApi/RescueRequestApi";
import AuthNotify from "../../../utils/Common/AuthNotify";
import { Spin } from "antd";

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
        <MissionList
          onSelectMission={handleSelectMission}
          selectedMissionId={selectedMission?.id || selectedMission?.rescueRequestId}
        />
      </aside>

      {/* RIGHT */}
      <section className="rc-mission-dispatch__detail">
        {loading ? (
          <div className="rc-loading">
            <Spin size="large" />
            <p>Đang tải chi tiết hồ sơ cứu hộ...</p>
          </div>
        ) : (
          <MissionDetail mission={selectedMission} />
        )}
      </section>
    </div>
  );
}