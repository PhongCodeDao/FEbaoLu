import { useEffect, useState, useMemo } from "react";
import { Select } from "antd";

import {
  getAllAssignments,
  getPendingRescueRequests,
  getUrgencyLevels
} from "../../../../../api/axios/CoordinatorApi/RescueRequestApi";

import { getAllRescueTeams } from "../../../../../api/axios/ManagerApi/rescueTeamApi";
import { getAllVehicles } from "../../../../../api/axios/ManagerApi/vehicleApi";
import { getRequestStatuses } from "../../../../../api/axios/Auth/authApi";

import "./list-team-cuuho.css";


const getPriorityClass = (id) => {
  const map = {
    1: "priority-high",     // đỏ
    2: "priority-medium",   // cam
    3: "priority-low",      // xanh lá
    4: "priority-blue",     // xanh dương
    5: "priority-purple",   // tím
    6: "priority-cyan",     // cyan
    7: "priority-gold",     // vàng
    8: "priority-lime",     // lime
    9: "priority-magenta",  // hồng
    10: "priority-volcano"  // đỏ cam
  };

  return map[id] || "priority-default";
};

const assignmentStatusMap = {
  PENDING:"Chờ điều phối",
  ASSIGNED: "Đã điều động",
  ACCEPTED: "Đội đã nhận nhiệm vụ",
  DEPARTED: "Đã xuất phát",
  ARRIVED: "Đã đến hiện trường",
  COMPLETED: "Hoàn thành",
  REJECTED: "Từ chối nhiệm vụ"
}

const assignmentStatusClass = {
  PENDING:  "status-pending",
  ASSIGNED: "status-assigned",
  ACCEPTED: "status-accepted",
  DEPARTED: "status-departed",
  ARRIVED: "status-arrived",
  COMPLETED: "status-completed",
  REJECTED: "status-rejected"
}
const normalizeAddress = (address) => {
  if (!address) return "";

  return address
    .replace(/^(Hẻm|Ngõ|Hẽm)\s*\d*\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

export default function ListTeamCuuHo({ onSelectMission }) {

  const [missions, setMissions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading,setLoading] = useState(false)

  const [tab,setTab] = useState("new")
  const [tabLoading,setTabLoading] = useState(null)

  const [filters,setFilters] = useState({
    requestType:"",
    address:"",
    urgency:""
  })

  /* ================= LOAD API ================= */

  const fetchData = async()=>{

    try{

      setLoading(true)

      const [
        assignmentRes,
        teamRes,
        vehicleRes,
        requestRes,
        urgencyRes,
        statusRes
      ] = await Promise.all([
        getAllAssignments(),
        getAllRescueTeams(),
        getAllVehicles(),
        getPendingRescueRequests(),
        getUrgencyLevels(),
        getRequestStatuses()
      ])

      const assignments = assignmentRes?.data || assignmentRes || []
      const teams = teamRes?.data?.items || []
      const vehicles = vehicleRes?.data || []
      const requests = requestRes?.data || requestRes || []
      const urgencies = urgencyRes || []
      const statuses = statusRes?.data || statusRes || []

      /* MAP LOOKUP */

      const teamMap={}
      teams.forEach(t=>{
        teamMap[t.rcid]=t.rcName
      })

      const vehicleMap={}
      vehicles.forEach(v=>{
        vehicleMap[v.vehicleId]=v.vehicleName
      })

      const requestMap={}
      requests.forEach(r=>{
        requestMap[r.rescueRequestId]=r
      })

      const urgencyMap = {};
      urgencies.forEach(u => {
        urgencyMap[u.urgencyLevelId] = u;
      });

      /* STATUS MAP (VIETNAMESE) */

      const statusMap={}
      statuses.forEach(s=>{
        statusMap[s.statusId]=s.description
      })

      /* ACTIVE ASSIGNMENTS */

      const activeAssignments = assignments.map(a => a)

      const mapped = activeAssignments.map(a=>{

        const req = requestMap[a.rescueRequestId]
        
        const urgencyObj = urgencyMap[req?.urgencyLevelId];
        
        const requestStatus = statusMap[req?.statusId]
        
        const assignmentStatus = a.assignmentStatus
        
        return{
        
        id:a.rescueRequestId,
        assignmentId:a.assignmentId,
        
        team:teamMap[a.rescueTeamId] || `Team ${a.rescueTeamId}`,
        
        vehicle:vehicleMap[a.vehicleId] || `Vehicle ${a.vehicleId}`,
        
        fullname:req?.fullname || req?.fullName || "Không rõ",
        
        phone:req?.contactPhone || "Không có",
        
        address:req?.address || "Không xác định",
        
        incident:req?.requestType || "",
        
        assignmentStatus:assignmentStatus,
        
        urgency: urgencyObj?.levelName || "Không xác định",
        urgencyLevelId: req?.urgencyLevelId,
        
        status:requestStatus || "Đang xử lý",
        
        time:a.assignedAt
        ? new Date(a.assignedAt).toLocaleTimeString("vi-VN",{
        hour:"2-digit",
        minute:"2-digit"
        })
        :""
        
        }
        
        })
      setMissions(mapped)

    }catch(err){

      console.error("Load mission error:",err)

    }finally{
      setLoading(false)
    }

  }

  useEffect(()=>{
    fetchData()
  },[])

  /* ================= FILTER OPTIONS ================= */

   const ADDRESS_OPTIONS = useMemo(() => {
  
      const unique = [...new Set(
        missions
          .map(m => normalizeAddress(m.address))
          .filter(Boolean)
      )];
    
      return unique.map(addr => ({
        label: addr,
        value: addr
      }));
    
    }, [missions]);

    const URGENCY_OPTIONS = useMemo(() => {

      const unique = [...new Set(
        missions
          .map(m => m.urgencyLevelId)
          .filter(Boolean)
      )];
    
      return [
        { label: "Tất cả", value: "" },
        ...unique.map(id => {
    
          const item = missions.find(
            m => m.urgencyLevelId === id
          );
    
          return {
            label: item?.urgency || `Level ${id}`,
            value: id
          };
    
        })
      ];
    
    }, [missions]);

  /* ================= TAB ================= */

  const changeTab=(key)=>{

    setTabLoading(key)

    setTimeout(()=>{
      setTab(key)
      setTabLoading(null)
      setFilters({
        requestType:"",
        address:"",
        urgency:""
      })
    },200)

  }

  /* ================= FILTER ================= */

  const filtered = useMemo(()=>{

    let list=[...missions]

    if(search){
      list=list.filter(m=>
        m.team?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (filters.address)
      list = list.filter(m =>
        normalizeAddress(m.address)
          .toLowerCase()
          .includes(filters.address.toLowerCase())
      );
      if (filters.urgency) {
        list = list.filter(
          m => m.urgencyLevelId === filters.urgency
        );
      }

    return list

  },[missions,filters,search])

  /* ================= UI ================= */

  return(

<section className="rc-team-list">

<div className="rc-team-list__header">

<div className="rc-team-list__header-left">

<div className="rc-team-list__title">

<h3>Đang cứu hộ ({filtered.length})</h3>

<button
className="rc-refresh-btn"
onClick={fetchData}
disabled={loading}
>

{loading ? (
<span className="rc-spinner"></span>
) : (
"🔄 Làm mới"
)}

</button>

</div>
{/* 
<input
className="rc-team-list__search"
placeholder="Lọc theo đội..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
/> */}

</div>

<div className="rc-team-list__header-right">



<div className="rc-queue__tabs">

<button
className={tab==="new"?"active":""}
onClick={()=>changeTab("new")}
>
MỚI NHẤT
</button>


<button
className={tab==="merge"?"active":""}
onClick={()=>changeTab("merge")}
>
TÌM YÊU CẦU
</button>

</div>

</div>

</div>

{/* FILTER */}

{tab==="merge" && (

<div className="rc-filter">

<Select
placeholder="Địa chỉ"
allowClear
style={{width:"100%"}}
options={ADDRESS_OPTIONS}
value={filters.address || undefined}
onChange={(v)=>setFilters({
requestType:"",
address:v || "",
urgency:""
})}
/>

<Select
placeholder="Mức độ nguy hiểm"
allowClear
style={{width:"100%",marginTop:8}}
options={URGENCY_OPTIONS}
value={filters.urgency || undefined}
onChange={(v)=>setFilters({
requestType:"",
address:"",
urgency:v || ""
})}
/>

</div>

)}

{/* LIST */}

<div className="rc-team-list__items">

{loading && <div>Đang tải dữ liệu...</div>}

{!loading && filtered.length===0 && (
  <div className="rc-empty">
  Không có dữ liệu
</div>
)}

{filtered.map(item => (

<div
  key={item.assignmentId}
  className="rc-team-item"
  onClick={()=>onSelectMission?.(item.assignmentId)}
>

<div className="rc-team-item__top">
<div className="rc-team-item__id">
  Mã yêu cầu: #{item.id}
</div>

<span className={`rc-team-item__priority ${getPriorityClass(item.urgencyLevelId)}`}>
  {item.urgency}
</span>

<span
className={`status-badge ${assignmentStatusClass[item.assignmentStatus]}`}
>
{assignmentStatusMap[item.assignmentStatus]}
</span>
</div>

<div
  className="info-box-minato"
  style={{
    background: "#fff",
    borderRadius: 12,
    padding: "14px 16px",
    border: "1px solid #eee",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: 8
  }}
>

  <strong
    style={{
      fontSize: 15,
      fontWeight: 700,
      color: "#1677ff"
    }}
  >
     Họ và tên: {item.fullname}
  </strong>

  <div
    style={{
      fontSize: 14,
      color: "#444",
      padding: "6px 10px",
      background: "#fafafa",
      borderRadius: 8,
      border: "1px solid #eee"
    }}
  >
     Tên đội: {item.team}
  </div>

  <div
    style={{
      fontSize: 14,
      color: "#444",
      padding: "6px 10px",
      background: "#fafafa",
      borderRadius: 8,
      border: "1px solid #eee"
    }}
  >
     Tên phương tiện: {item.vehicle}
  </div>

  <div
    style={{
      fontSize: 14,
      color: "#444",
      padding: "6px 10px",
      background: "#fafafa",
      borderRadius: 8,
      border: "1px solid #eee"
    }}
  >
     Vị trí: {item.address}
  </div>

  <div
    style={{
      fontSize: 14,
      fontWeight: 600,
      color: "#52c41a",
      padding: "6px 10px",
      background: "#f6ffed",
      borderRadius: 8,
      border: "1px solid #b7eb8f"
    }}
  >
    Số điện thoại: {item.phone}
  </div>

</div>
<div className="rc-team-item__footer">
⏱Phân công lúc:  {item.time}
</div>

</div>

))}

</div>

</section>

)

}