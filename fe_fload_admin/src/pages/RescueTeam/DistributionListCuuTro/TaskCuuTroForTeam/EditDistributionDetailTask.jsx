// src/components/EditDistributionDetailTask.jsx

import { Modal } from "antd";
import { useState } from "react";
import { confirmAllDistributionDetail } from "../../../../../api/axios/RescueApi/RescueTask";
import AuthNotify from "../../../../utils/Common/AuthNotify";

// 🔥 helper check status (EN + VI)
const isCompletedStatus = (status) => {
  if (!status) return false;

  const normalized = status.toString().trim().toLowerCase();

  return [
    "completed",
    "complete",
    "done",
    "hoàn thành"
  ].includes(normalized);
};

export default function EditDistributionDetailTask({
  open,
  onClose,
  data,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);

  const isCompleted = isCompletedStatus(data?.status);

  const handleSubmit = async () => {
    if (!data?.distributionId || !data?.beneficiaryId) {
      AuthNotify.error("Thiếu thông tin phân phối");
      return;
    }

    if (isCompleted) {
      AuthNotify.warning("Phiếu đã hoàn thành");
      return;
    }

    setLoading(true);

    try {
      await confirmAllDistributionDetail(
        data.distributionId,
        data.beneficiaryId
      );

      AuthNotify.success("Xác nhận thành công");

      // cập nhật lại item (chuẩn hóa luôn status)
      onSuccess({
        ...data,
        status: "completed"
      });

      onClose();
    } catch (err) {
      console.error(err);
      AuthNotify.error("Xác nhận thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isCompleted ? "Không thể chỉnh sửa" : "Xác nhận phân phối"}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Xác nhận"
      cancelText="Hủy"
      okButtonProps={{
        disabled: isCompleted,
        loading: loading
      }}
      destroyOnClose
    >
      {isCompleted ? (
        <p style={{ color: "red" }}>
          ⚠ Phiếu này đã hoàn thành, không thể chỉnh sửa
        </p>
      ) : (
        <div>
          <p>
            Bạn có chắc muốn <b>xác nhận tất cả phân phối</b> cho người này?
          </p>

          <ul style={{ paddingLeft: 16 }}>
            <li>
              <b>ID phân phối:</b> {data?.distributionId}
            </li>
            <li>
              <b>Người nhận:</b> {data?.fullName || "Không rõ"}
            </li>
          </ul>
        </div>
      )}
    </Modal>
  );
}