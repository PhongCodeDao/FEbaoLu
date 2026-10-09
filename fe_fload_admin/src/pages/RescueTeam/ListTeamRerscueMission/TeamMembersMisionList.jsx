import "./TeamMembersMisionList.css";
import { useEffect, useState } from "react";
import { Pagination, Spin, Tag } from "antd";
import { getAllUser } from "../../../../api/axios/AdminApi/userApi";
import {
  getRescueTeamMembers,
  getAllRescueTeams
} from "../../../../api/axios/RescueApi/RescueTask";

export default function TeamMembersMisionList() {

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;

  const user =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(sessionStorage.getItem("user")) ||
    {};

  /* ================= HELPER ================= */

  const normalizeStatus = (status) =>
    status?.toLowerCase().replace("_", " ").trim();

  const getStatusColor = (status) => {
    const s = normalizeStatus(status);

    switch (s) {
      case "on duty":
        return "green";
      case "off duty":
        return "default";
      default:
        return "blue";
    }
  };

  const translateStatus = (status) => {
    const s = normalizeStatus(status);

    switch (s) {
      case "on duty":
        return "Đang trực";
      case "off duty":
        return "Nghỉ";
      default:
        return "Không xác định";
    }
  };

  /* ================= FIND TEAM ================= */

  const findMyTeamId = async (teams, userId) => {
    for (const team of teams) {
      try {
        const res = await getRescueTeamMembers(team.rcid);
        const data = res?.data;

        const isMember = data?.items?.some(
          (m) => m.userId === userId
        );

        if (isMember) return team.rcid;

      } catch {}
    }
    return null;
  };

  /* ================= LOAD ================= */

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const [teamRes, userRes] = await Promise.all([
        getAllRescueTeams(),
        getAllUser()
      ]);

      const teams = teamRes?.data?.items || [];
      const users = userRes || [];

      const userMap = {};
      users.forEach((u) => {
        userMap[u.userId] = u;
      });

      const myTeamId = await findMyTeamId(teams, user.userId);

      if (!myTeamId) {
        setMembers([]);
        return;
      }

      // 🔥 LẤY TEAM ĐÚNG
      const myTeam = teams.find(t => t.rcid === myTeamId);

      // 🔥 FIX QUAN TRỌNG: dùng rcStatus
      const teamStatus = normalizeStatus(myTeam?.rcStatus) || "off duty";

      // 🔥 LẤY MEMBER
      const res = await getRescueTeamMembers(myTeamId);
      const data = res?.data?.items || [];

      const mapped = data.map((m) => {
        const userInfo = userMap[m.userId];

        return {
          id: m.userId,
          name: m.fullName,
          phone: m.phone,
          role: userInfo?.roleName || "Không rõ",

          // 🔥 KEY FIX: status từ TEAM
    
        };
      });

      setMembers(mapped);

    } catch (err) {
      console.error("Load members error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [members]);

  /* ================= PAGINATION ================= */

  const paginatedMembers = members.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* ================= UI ================= */

  return (
    <div className="tm-table">

      <div className="tm-header">
        <h3>Thành viên đội</h3>
        <span>{members.length} thành viên</span>
      </div>

      {loading ? (
        <div className="tm-loading">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>STT</th>
                <th>Thành viên</th>
                <th>SĐT</th>
                <th>Vai trò</th>
     
              </tr>
            </thead>

            <tbody>
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="tm-empty">
                    Không có thành viên
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m, index) => (
                  <tr key={m.id}>

                    <td>
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    <td>
                      <div className="tm-user">
                        <span>{m.name}</span>
                      </div>
                    </td>

                    <td>{m.phone}</td>

                    <td>
                      <Tag color="purple">
                        {m.role}
                      </Tag>
                    </td>

                  

                  </tr>
                ))
              )}
            </tbody>

          </table>

          {members.length > pageSize && (
            <div className="tm-pagination">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={members.length}
                onChange={setCurrentPage}
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      )}

    </div>
  );
}