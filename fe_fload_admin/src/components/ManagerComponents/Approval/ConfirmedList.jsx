import { useState, useEffect } from "react";
import "./ConfirmedList.css";

export default function ConfirmedList({ data }) {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const total = data.length;
  const totalPage = Math.ceil(total / pageSize);

  // reset page nếu data thay đổi
  useEffect(() => {
    setPage(1);
  }, [data]);

  const currentData = data.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="dispatch-table">
      {/* HEADER */}
      <div className="table-head">
        <span>ID</span>
        <span>Warehouse</span>
        <span>Items</span>
        <span>Confirmed At</span>
      </div>

      {/* BODY */}
      {currentData.length === 0 ? (
        <div className="empty-box">Không có dữ liệu</div>
      ) : (
        currentData.map((t) => (
          <div className="table-row" key={t.id}>
            <div className="cell-id">#{t.id}</div>

            <div className="cell-warehouse">
              WH-{t.warehouseId}
            </div>

            <div className="cell-items">
              {t.lines?.map((l, i) => (
                <p key={i}>
                  {l.itemName} - {l.quantity} {l.unit}
                </p>
              ))}
            </div>

            <div className="confirmed-time">
              {new Date(t.confirmedAt).toLocaleString("vi-VN")}
            </div>
          </div>
        ))
      )}

      {/* FOOTER */}
      {total > 0 && (
        <div className="table-footer">
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ←
            </button>

            <span>
              Trang {page} / {totalPage}
            </span>

            <button
              disabled={page === totalPage}
              onClick={() => setPage((p) => p + 1)}
            >
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}