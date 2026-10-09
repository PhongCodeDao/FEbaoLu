import { Modal, Form, Select, InputNumber, Button, Spin, message, Input, Table, Empty } from "antd";
import { useEffect, useState, useMemo } from "react";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  createDistributionDetail,
  getSupplyPlansByCampaign,
  getAllDistributions,
  getDistributionDetailsByDistribution,
} from "../../../../../api/axios/ManagerApi/periodicAidApi";
import { getBeneficiariesByCampaign } from "../../../../../api/axios/AdminApi/suplyingApi";
import AuthNotify from "../../../../utils/Common/AuthNotify";

export default function AddDistributionDetail({
  open,
  onClose,
  distributionId,
  campaignId,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [supplyPlans, setSupplyPlans] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedReliefItemId, setSelectedReliefItemId] = useState(null);

  const normalize = (res) => res?.items || res?.data || res || [];

  /* ================= RELIEF ITEMS FROM SUPPLY PLAN ================= */

  const availableReliefItems = useMemo(() => {
    return supplyPlans
      .filter((plan) => {
        const undistributedQuantity =
          plan.undistributedQuantity ??
          plan.undistributed_quantity ??
          0;
        // Chỉ hiển thị các vật phẩm còn "chưa phát"
        return undistributedQuantity > 0;
      })
      .map((plan) => {
        const undistributedQuantity =
          plan.undistributedQuantity ??
          plan.undistributed_quantity ??
          0;
        const itemName = plan.itemName || plan.reliefItemName || `Vật phẩm #${plan.relief_item_id || plan.reliefItemId}`;
        
        return {
          value: plan.relief_item_id || plan.reliefItemId,
          label: `${itemName} (Chưa phát: ${undistributedQuantity})`,
          undistributed: undistributedQuantity,
          itemName: itemName,
          planId: plan.supply_plan_id || plan.supplyPlanId,
        };
      });
  }, [supplyPlans]);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (open && campaignId && distributionId != null) {
      loadData();
    }
  }, [open, campaignId, distributionId]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setSelectedItems([]);
      setSelectedBeneficiary(null);
      setSelectedReliefItemId(null);
      form.resetFields();
      itemForm.resetFields();

      const [benefRes, planRes, detailsRes, allDistRes] = await Promise.all([
        getBeneficiariesByCampaign(campaignId),
        getSupplyPlansByCampaign(campaignId),
        getDistributionDetailsByDistribution(distributionId),
        getAllDistributions(),
      ]);

      const benefList = normalize(benefRes);
      const planList = normalize(planRes);
      const detailsList = normalize(detailsRes);

      const normalizeId = (x) =>
        x == null ? null : String(x);

      const currentBeneficiaryIds = new Set(
        detailsList
          .map((d) => normalizeId(d?.beneficiaryId))
          .filter((x) => x != null)
      );

      // Collect beneficiaries already assigned in ANY distribution under this campaign
      const allDistributions = normalize(allDistRes);
      const distForCampaign = allDistributions.filter((d) => {
        const cId = normalizeId(d?.campaignId ?? d?.campaignID);
        return cId != null && cId === normalizeId(campaignId);
      });

      const distributionIds = distForCampaign
        .map((d) => normalizeId(d?.distributionId ?? d?.distributionID))
        .filter((x) => x != null);

      let campaignBeneficiaryIds = new Set();
      if (distributionIds.length > 0) {
        const allDetailsList = await Promise.all(
          distributionIds.map((did) =>
            getDistributionDetailsByDistribution(did)
              .then((res) => normalize(res))
              .catch(() => [])
          )
        );

        const assignedIds = allDetailsList
          .flat()
          .map((d) => normalizeId(d?.beneficiaryId))
          .filter((x) => x != null);

        campaignBeneficiaryIds = new Set(assignedIds);
      }

      // Keep: (A) beneficiaries not assigned in any distribution of this campaign
      // OR (B) beneficiaries already assigned in the current distribution
      const filteredBeneficiaries = benefList.filter((b) => {
        const bId = normalizeId(b?.beneficiaryId);
        if (bId == null) return false;

        const isInCurrent = currentBeneficiaryIds.has(bId);
        const isInAny = campaignBeneficiaryIds.has(bId);

        return isInCurrent || !isInAny;
      });

      setBeneficiaries(filteredBeneficiaries);
      setSupplyPlans(planList);
    } catch (err) {
      console.error("Load data error:", err);
      message.error("Lỗi tải dữ liệu");
    } finally {
      setLoadingData(false);
    }
  };

  /* ================= ADD ITEM TO LIST ================= */

  const handleAddItem = async () => {
    try {
      const values = await itemForm.validateFields();

      const selectedItemObj = availableReliefItems.find(
        (item) => item.value === values.reliefItemId
      );

      if (!selectedItemObj) {
        message.error("Vật phẩm không hợp lệ");
        return;
      }

      const reliefItemId = values.reliefItemId;
      const selectedSumForThisReliefItem = selectedItems
        .filter((x) => String(x.reliefItemId) === String(reliefItemId))
        .reduce((acc, x) => acc + Number(x.distributedQuantity ?? 0), 0);

      const maxRemaining = Number(selectedItemObj.undistributed ?? 0);
      const remaining = maxRemaining - selectedSumForThisReliefItem;

      if (remaining <= 0) {
        message.error(`Chỉ còn ${maxRemaining} cho vật phẩm này`);
        return;
      }

      if (Number(values.quantity ?? 1) > remaining) {
        message.error(`Chỉ có thể thêm tối đa ${remaining} cho vật phẩm này`);
        return;
      }

      // Check if item already added
      if (selectedItems.some((item) => item.reliefItemId === values.reliefItemId)) {
        message.warning("Vật phẩm này đã được thêm");
        return;
      }

      const newItem = {
        id: Date.now(),
        reliefItemId: values.reliefItemId,
        itemName: selectedItemObj.itemName,
        distributedQuantity: values.quantity || 1,
      };

      setSelectedItems([...selectedItems, newItem]);
      itemForm.resetFields();
      message.success("Thêm vật phẩm thành công");
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= REMOVE ITEM ================= */

  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== id));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!selectedBeneficiary) {
      message.error("Chọn người nhận");
      return;
    }

    if (selectedItems.length === 0) {
      message.error("Thêm ít nhất 1 vật phẩm");
      return;
    }

    try {
      setLoading(true);

      // Create distribution detail for each selected item
      const promises = selectedItems.map((item) =>
        createDistributionDetail({
          distributionId,
          beneficiaryId: selectedBeneficiary,
          reliefItemId: item.reliefItemId,
          distributedQuantity: item.distributedQuantity,
          status: "pending",
          note: "",
        })
      );

      await Promise.all(promises);

      AuthNotify.success(`Thêm ${selectedItems.length} vật phẩm cho người nhận thành công`);

      form.resetFields();
      itemForm.resetFields();
      setSelectedItems([]);
      setSelectedBeneficiary(null);
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      AuthNotify.error(err.message || "Thêm thất bại");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TABLE COLUMNS ================= */

  const itemColumns = [
    {
      title: "Vật phẩm",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "Số lượng",
      dataIndex: "distributedQuantity",
      key: "distributedQuantity",
      width: 100,
    },
    {
      title: "Hành động",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        />
      ),
    },
  ];

  /* ================= RENDER ================= */

  return (
    <Modal
      title="➕ Thêm cứu trợ cho người nhận"
      open={open}
      onCancel={() => {
        form.resetFields();
        itemForm.resetFields();
        setSelectedItems([]);
        setSelectedBeneficiary(null);
        setSelectedReliefItemId(null);
        onClose();
      }}
      width={700}
      destroyOnHidden
      okText="Thêm"
      cancelText="Hủy"
      onOk={handleSubmit}
      okButtonProps={{ loading, disabled: !selectedBeneficiary || selectedItems.length === 0 }}
    >
      <Spin spinning={loadingData}>
        {/* SELECT BENEFICIARY */}
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            name="beneficiaryId"
            label="Người nhận cứu trợ *"
            rules={[{ required: true, message: "Chọn người nhận" }]}
          >
            <Select
              placeholder="Chọn người nhận"
              options={beneficiaries.map((b) => ({
                value: b.beneficiaryId,
                label: `${b.fullName} - ${b.phone} (${b.address})`,
              }))}
              onChange={(value) => {
                setSelectedBeneficiary(value);
                form.setFieldValue("beneficiaryId", value);
              }}
            />
          </Form.Item>
        </Form>

        {/* ADD ITEMS FORM */}
        {selectedBeneficiary && (
          <div style={{ marginBottom: 24, padding: "16px", background: "#f5f5f5", borderRadius: 8 }}>
            <h4 style={{ marginTop: 0 }}>📦 Thêm vật phẩm</h4>
            <Form
              form={itemForm}
              layout="vertical"
              autoComplete="off"
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <Form.Item
                  name="reliefItemId"
                  label="Vật phẩm *"
                  rules={[{ required: true, message: "Chọn vật phẩm" }]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Select
                    placeholder="Chọn vật phẩm từ kế hoạch cấp phát"
                    options={availableReliefItems}
                    onChange={(value) => setSelectedReliefItemId(value)}
                  />
                </Form.Item>

                <Form.Item
                  name="quantity"
                  label="Số lượng *"
                  initialValue={1}
                  rules={[{ required: true, message: "Nhập số lượng" }]}
                  style={{ width: 120, marginBottom: 0 }}
                >
                  <InputNumber
                    min={1}
                    placeholder="Số lượng"
                    max={
                      (() => {
                        if (selectedReliefItemId == null) return undefined;
                        const selectedItemObj = availableReliefItems.find(
                          (item) => item.value === selectedReliefItemId
                        );
                        const maxRemaining = Number(selectedItemObj?.undistributed ?? 0);

                        const selectedSumForThisReliefItem = selectedItems
                          .filter((x) => String(x.reliefItemId) === String(selectedReliefItemId))
                          .reduce((acc, x) => acc + Number(x.distributedQuantity ?? 0), 0);

                        const remaining = maxRemaining - selectedSumForThisReliefItem;
                        return Number.isFinite(remaining) ? Math.max(0, remaining) : undefined;
                      })()
                    }
                    disabled={
                      (() => {
                        if (selectedReliefItemId == null) return false;
                        const selectedItemObj = availableReliefItems.find(
                          (item) => item.value === selectedReliefItemId
                        );
                        const maxRemaining = Number(selectedItemObj?.undistributed ?? 0);
                        const selectedSumForThisReliefItem = selectedItems
                          .filter((x) => String(x.reliefItemId) === String(selectedReliefItemId))
                          .reduce((acc, x) => acc + Number(x.distributedQuantity ?? 0), 0);
                        return maxRemaining - selectedSumForThisReliefItem <= 0;
                      })()
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 0 }}
                  onClick={handleAddItem}
                >
                  Thêm
                </Button>
              </div>
            </Form>
          </div>
        )}

        {/* SELECTED ITEMS TABLE */}
        {selectedBeneficiary && selectedItems.length > 0 && (
          <div>
            <h4>📋 Danh sách vật phẩm đã chọn ({selectedItems.length})</h4>
            <Table
              columns={itemColumns}
              dataSource={selectedItems}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}

        {selectedBeneficiary && selectedItems.length === 0 && (
          <Empty description="Chưa chọn vật phẩm nào" style={{ marginTop: 32 }} />
        )}
      </Spin>
    </Modal>
  );
}
