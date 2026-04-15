/* eslint-disable react-hooks/rules-of-hooks */
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

import {
  CalendarOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  FormOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Layout,
  Modal,
  notification,
  Popconfirm,
  Select,
  Spin,
  Table,
  TimePicker,
  Typography,
  Checkbox,
  List,
  Avatar,
  Row,
  Col,
  Divider,
  Space,
} from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import { Env } from "./../../../styles";
import "./style.css";
const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function AttendanceSetting(props) {
  const [load, setLoad] = useState(false);
  const [data, setData] = useState([]);
  const [update, setUpdate] = useState(0);
  const [types, setTypes] = useState([]);

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [batchSearchText, setBatchSearchText] = useState("");
  const [batchWorkType, setBatchWorkType] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const [durationForm] = Form.useForm();

  useEffect(() => {
    setLoad(true);
    FirebaseServices.getDurations(selectedYear)
      .then((data) => {
        setData(data);
        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoad(false);
      });

    FirebaseServices.getDurationTypes()
      .then((data) => {
        setTypes(data);
      })
      .catch(function (error) {
        console.log(error);
        setLoad(false);
      });

    // Fetch all employees for batch assignment using the factor-data endpoint for correct IDs
    FirebaseServices.getUsersFactorData()
      .then((dataBody) => {
        const mapped = (dataBody || []).map(u => ({
          label: u.name,
          value: u.id, // Primary key ID
          user_id: u.user_id, // Employment ID
          avatar: u.avatar
        }));
        const sorted = mapped.sort((a, b) =>
          a.label.localeCompare(b.label, "ar")
        );
        setAllEmployees(sorted);
      })
      .catch((error) => {
        console.log("Error fetching employees:", error);
      });
  }, [update, selectedYear]);

  const columns = [
    {
      title: "العنوان",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.length - b.title.length,
      sortOrder: sortedInfo.columnKey === "title" && sortedInfo.order,
      ellipsis: false,
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "النوع",
      dataIndex: "durationtype",
      key: "durationtype",
      sorter: (a, b) => a.durationtype.length - b.durationtype.length,
      sortOrder: sortedInfo.columnKey === "durationtype" && sortedInfo.order,
      ellipsis: true,
      width: 120,
    },
    {
      title: "تاريخ البدء",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      sortOrder: sortedInfo.columnKey === "startDate" && sortedInfo.order,
      ellipsis: false,
      width: 130,
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <Text>{dayjs(text).format("YYYY-MM-DD")}</Text>
        </div>
      ),
    },
    {
      title: "تاريخ الانتهاء",
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a, b) => new Date(a.endDate) - new Date(b.endDate),
      sortOrder: sortedInfo.columnKey === "endDate" && sortedInfo.order,
      ellipsis: false,
      width: 130,
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <CalendarOutlined style={{ color: "#52c41a" }} />
          <Text>{dayjs(text).format("YYYY-MM-DD")}</Text>
        </div>
      ),
    },
    {
      title: "وقت الحضور",
      dataIndex: "startTime",
      key: "startTime",
      sorter: (a, b) => a.startTime.localeCompare(b.startTime),
      sortOrder: sortedInfo.columnKey === "startTime" && sortedInfo.order,
      ellipsis: false,
      width: 120,
      align: "center",
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            justifyContent: "center",
          }}
        >
          <ClockCircleOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: "سماح الحضور",
      dataIndex: "allowedStartTime",
      key: "allowedStartTime",
      sorter: (a, b) => a.allowedStartTime.localeCompare(b.allowedStartTime),
      sortOrder:
        sortedInfo.columnKey === "allowedStartTime" && sortedInfo.order,
      ellipsis: false,
      width: 130,
      align: "center",
      render: (text) => <Text style={{ color: "#52c41a" }}>{text}</Text>,
    },
    {
      title: "وقت الانصراف",
      dataIndex: "endTime",
      key: "endTime",
      sorter: (a, b) => a.endTime.localeCompare(b.endTime),
      sortOrder: sortedInfo.columnKey === "endTime" && sortedInfo.order,
      ellipsis: false,
      width: 120,
      align: "center",
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            justifyContent: "center",
          }}
        >
          <ClockCircleOutlined style={{ color: "#ff4d4f" }} />
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: "سماح الانصراف",
      dataIndex: "allowedEndTime",
      key: "allowedEndTime",
      sorter: (a, b) => a.allowedEndTime.localeCompare(b.allowedEndTime),
      sortOrder: sortedInfo.columnKey === "allowedEndTime" && sortedInfo.order,
      ellipsis: false,
      width: 130,
      align: "center",
      render: (text) => <Text style={{ color: "#52c41a" }}>{text}</Text>,
    },
    {
      title: "أيام العمل",
      dataIndex: "weekends",
      key: "weekends",
      width: 150,
      render: (text) => {
        if (!text) return <Text type="secondary">حسب النظام</Text>;
        try {
          const days = JSON.parse(text);
          if (Array.isArray(days)) {
            return days.join(" | ");
          }
          return text;
        } catch (e) {
          return text;
        }
      },
    },
    {
      title: "الإجراءات",
      dataIndex: "",
      width: "150px",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <Button
            onClick={function () {
              setIsModalVisible(true);
              durationForm.setFieldsValue({
                id: record.id,
                title: record.title,
                durationtype_id: record.durationtype_id,
                date_range: [dayjs(record.startDate), dayjs(record.endDate)],
                periods: [
                  {
                    time_range: [
                      dayjs(record.startTime, "HH:mm"),
                      dayjs(record.endTime, "HH:mm"),
                    ],
                    allowed_range: [
                      dayjs(record.allowedStartTime, "HH:mm"),
                      dayjs(record.allowedEndTime, "HH:mm"),
                    ],
                  },
                ],
                weekends: record.weekends ? JSON.parse(record.weekends) : [],
              });
            }}
            type="primary"
            size="small"
            icon={<FormOutlined />}
            title="تعديل"
          />
          <Popconfirm
            title="هل أنت متأكد من حذف الفترة؟"
            description="سيتم حذف هذه الفترة بشكل نهائي"
            onConfirm={function () {
              deleteDur(record.id);
            }}
            okText="نعم"
            cancelText="لا"
            okButtonProps={{ loading: confirmLoading }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} title="حذف" />
          </Popconfirm>
        </div>
      ),
    },
  ];
  const deleteDur = (id) => {
    setConfirmLoading(true);
    FirebaseServices.deleteDuration(id)
      .then((response) => {
        console.log(response);
        setUpdate(update + 1);
        setConfirmLoading(false);
        openNotification("bottomLeft", "تم حذف الفترة بنجاح!");
        setIsModalVisible(false);
      })
      .catch(function (error) {
        setConfirmLoading(false);
        console.log(error);
        notification.error({
          message: "حدث خطأ",
          description: "فشل في حذف الفترة. يرجى المحاولة مرة أخرى.",
          placement: "bottomLeft",
          duration: 5,
        });
      });
  };
  const openNotification = (placement, text) => {
    notification.success({
      message: text,
      placement,
      duration: 10,
    });
  };
  const addDuration = () => {
    durationForm
      .validateFields()
      .then(async () => {
        setConfirmLoading(true);

        const formValues = durationForm.getFieldsValue();
        const { id, title, date_range, durationtype_id, weekends, periods } = formValues;

        const startDate = date_range[0].format("YYYY-MM-DD");
        const endDate = date_range[1].format("YYYY-MM-DD");

        try {
          const mappedPeriods = periods.map(p => ({
            startTime: p.time_range[0].format("HH:mm"),
            endTime: p.time_range[1].format("HH:mm"),
            allowedStartTime: p.allowed_range[0].format("HH:mm"),
            allowedEndTime: p.allowed_range[1].format("HH:mm"),
          }));

          const values = {
            id, // Will be present in Edit mode
            title,
            startDate,
            endDate,
            durationtype_id,
            weekends,
            periods: mappedPeriods
          };

          await FirebaseServices.updateDuration(values);

          if (id) {
            openNotification("bottomLeft", "تم تعديل الفترة بنجاح!");
          } else {
            openNotification("bottomLeft", "تم إضافة الفترات بنجاح!");
          }

          setUpdate(update + 1);
          setIsModalVisible(false);
          durationForm.resetFields();
        } catch (error) {
          console.log(error);
          notification.error({
            message: "حدث خطأ",
            description: "فشل في حفظ البيانات. يرجى المحاولة مرة أخرى.",
            placement: "bottomLeft",
            duration: 5,
          });
        } finally {
          setConfirmLoading(false);
        }
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
      });
  };

  // إنشاء قائمة السنوات (من 2020 إلى السنة الحالية + 2)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = 2020; year <= currentYear + 2; year++) {
    years.push(year);
  }

  const handleBatchUpdate = async () => {
    if (!batchWorkType) {
      notification.warning({ message: "يرجى اختيار نوع الدوام" });
      return;
    }
    if (selectedEmployees.length === 0) {
      notification.warning({ message: "يرجى اختيار موظف واحد على الأقل" });
      return;
    }

    setBatchLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const empId of selectedEmployees) {
        try {
          const userResBody = await FirebaseServices.getUserDataComplete(empId);
          const { user, phones, qualifications, preworks, attachments } = userResBody;

          if (user) {
            // Merge all data to send a complete user object
            const updatedData = {
              ...user,
              durationtype_id: batchWorkType,
              // Convert boolean-like fields to 1/0 as expected by backend
              control_panel: (user.control_panel == 1 || user.control_panel === true) ? 1 : 0,
              general_manager: (user.general_manager == 1 || user.general_manager === true) ? 1 : 0,
              // Rename phones to contacts as expected by UserAPIController@addUser
              contacts: phones || [],
              qualifications: qualifications || [],
              preworks: (preworks || []).map(pw => ({
                ...pw,
                // The preworks on backend expect work_period if not using specific dates
                work_period: [pw.date_from, pw.date_to]
              })),
              attachments: attachments || []
            };

            await FirebaseServices.updateUserDataComplete(updatedData);
            successCount++;
          }
        } catch (err) {
          console.error(`Error updating employee ${empId}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        notification.success({
          message: "تم التحديث بنجاح",
          description:
            `تم تحديث ${successCount} موظف بنجاح.` +
            (errorCount > 0 ? ` فشل تحديث ${errorCount} موظف.` : ""),
          placement: "bottomLeft",
        });
        setBatchModalVisible(false);
        setSelectedEmployees([]);
        setBatchWorkType(null);
        setUpdate(update + 1);
      } else {
        notification.error({
          message: "فشل التحديث",
          description: "تعذر تحديث الموظفين المختارين.",
          placement: "bottomLeft",
        });
      }
    } catch (error) {
      console.error("Batch update error:", error);
      notification.error({ message: "حدث خطأ أثناء التحديث الجماعي" });
    } finally {
      setBatchLoading(false);
    }
  };

  const filteredEmployees = allEmployees.filter(
    (emp) =>
      (emp.label || "").toLowerCase().includes(batchSearchText.toLowerCase()) ||
      (emp.value || "").toString().includes(batchSearchText) ||
      (emp.user_id || "").toString().includes(batchSearchText)
  );

  return (
    <Layout
      style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <Text
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1890ff",
            }}
          >
            إدارة الدوام
          </Text>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <Text strong style={{ fontSize: "14px" }}>
                السنة:
              </Text>
              <Select
                value={selectedYear}
                onChange={(year) => setSelectedYear(year)}
                style={{ width: 130 }}
                placeholder="اختر السنة"
              >
                {years.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </div>
            <Button
              type="primary"
              ghost
              icon={<PlusOutlined />}
              onClick={() => {
                setBatchModalVisible(true);
              }}
              style={{
                borderRadius: "6px",
                fontWeight: "500",
              }}
            >
              تعميم نوع دوام
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                setIsModalVisible(true);
                durationForm.resetFields();
                // تعيين القيم الافتراضية للتواريخ والأوقات
                const currentYear = selectedYear || new Date().getFullYear();
                const startOfYear = dayjs(`${currentYear}-01-01`);
                const endOfYear = dayjs(`${currentYear}-12-31`);

                // القيم الافتراضية للأوقات
                const defaultStartTime = dayjs("08:00", "HH:mm");
                const defaultEndTime = dayjs("14:00", "HH:mm");
                const defaultAllowedStart = dayjs("07:30", "HH:mm");
                const defaultAllowedEnd = dayjs("14:30", "HH:mm");

                durationForm.setFieldsValue({
                  date_range: [startOfYear, endOfYear],
                  periods: [
                    {
                      time_range: [defaultStartTime, defaultEndTime],
                      allowed_range: [defaultAllowedStart, defaultAllowedEnd],
                    },
                  ],
                });
              }}
              style={{
                borderRadius: "6px",
                fontWeight: "500",
              }}
            >
              إضافة فترة جديدة
            </Button>
          </div>
        </div>

        {/* Batch Update Modal */}
        <Modal
          title="تعميم نوع الدوام على الموظفين"
          open={batchModalVisible}
          onCancel={() => setBatchModalVisible(false)}
          onOk={handleBatchUpdate}
          confirmLoading={batchLoading}
          width={700}
          okText="تطبيق التعميم"
          cancelText="إلغاء"
          centered
        >
          <div style={{ marginBottom: 16 }}>
            <Text strong>اختر نوع الدوام المراد تعميمه:</Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              placeholder="اختر نوع الدوام"
              onChange={(val) => setBatchWorkType(val)}
              value={batchWorkType}
            >
              {(types || []).map((dur) => (
                <Option key={dur.value} value={dur.value}>
                  {dur.label}
                </Option>
              ))}
            </Select>
          </div>

          <Divider orientation="right">اختيار الموظفين</Divider>

          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Input
              placeholder="البحث عن موظف..."
              prefix={<SearchOutlined />}
              value={batchSearchText}
              onChange={(e) => setBatchSearchText(e.target.value)}
              style={{ borderRadius: "20px", width: "70%" }}
            />
            <Checkbox
              indeterminate={selectedEmployees.length > 0 && selectedEmployees.length < filteredEmployees.length}
              checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedEmployees(filteredEmployees.map(emp => emp.value));
                } else {
                  setSelectedEmployees([]);
                }
              }}
            >
              تحديد الكل
            </Checkbox>
          </div>

          <div
            style={{
              maxHeight: 400,
              overflowY: "auto",
              border: "1px solid #f0f0f0",
              borderRadius: 8,
              padding: 8,
            }}
          >
            <Checkbox.Group
              style={{ width: "100%" }}
              value={selectedEmployees}
              onChange={(list) => setSelectedEmployees(list)}
            >
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={filteredEmployees}
                renderItem={(emp) => (
                  <List.Item key={emp.value} style={{ marginBottom: 8 }}>
                    <Checkbox value={emp.value}>
                      <Space direction="horizontal" size={8}>
                        <Avatar
                          size="small"
                          src={Env.HOST_SERVER_STORAGE + emp.avatar}
                          icon={!emp.avatar && <SearchOutlined />}
                        />
                        <Space direction="vertical" size={0}>
                          <Text style={{ fontSize: "13px", fontWeight: 500 }}>{emp.label}</Text>
                          <Text type="secondary" style={{ fontSize: "11px" }}>
                            رقم الموظف: {emp.user_id}
                          </Text>
                        </Space>
                      </Space>
                    </Checkbox>
                  </List.Item>
                )}
              />
            </Checkbox.Group>
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Space>
              <Button
                type="link"
                onClick={() =>
                  setSelectedEmployees(filteredEmployees.map((e) => e.value))
                }
                style={{ padding: 0 }}
              >
                تحديد المفلتر
              </Button>
              <Button
                type="link"
                onClick={() => setSelectedEmployees(allEmployees.map((e) => e.value))}
                style={{ padding: 0 }}
              >
                تحديد الكل
              </Button>
            </Space>
            <Button
              type="link"
              danger
              onClick={() => setSelectedEmployees([])}
              style={{ padding: 0 }}
            >
              إلغاء التحديد
            </Button>
          </div>
        </Modal>

        {/* Table Section */}
        <div style={{ marginTop: "24px" }}>
          <Table
            scroll={{ x: "1200px" }}
            loading={load}
            columns={columns}
            dataSource={data}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} من ${total} فترة`,
              pageSizeOptions: ["10", "20", "50", "100"],
              showQuickJumper: true,
            }}
            style={{
              borderRadius: "6px",
            }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "table-row-light" : "table-row-dark"
            }
          />
        </div>
        <Modal
          centered
          confirmLoading={confirmLoading}
          title={
            <div style={{ textAlign: "center", padding: "4px 0" }}>
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#1890ff",
                }}
              >
                {durationForm.getFieldValue("id")
                  ? "تعديل فترة"
                  : "إضافة فترة جديدة"}
              </Text>
            </div>
          }
          visible={isModalVisible}
          onOk={function () {
            addDuration();
          }}
          okText="حفظ"
          cancelText="إلغاء"
          width={580}
          okButtonProps={{
            style: { borderRadius: "6px", fontWeight: "500", minWidth: "80px" },
          }}
          cancelButtonProps={{
            style: { borderRadius: "6px", minWidth: "80px" },
          }}
          onCancel={function () {
            setIsModalVisible(false);
            durationForm.resetFields();
          }}
          bodyStyle={{ padding: "20px 24px" }}
        >
          <Form
            form={durationForm}
            layout="vertical"
            style={{ marginTop: "0px" }}
          >
            <Form.Item name="id" hidden={true} style={{ display: "none" }}>
              <Input />
            </Form.Item>
            <Form.Item
              label={
                <Text strong style={{ fontSize: "13px", color: "#262626" }}>
                  التسمية
                </Text>
              }
              name="title"
              rules={[{ required: true, message: "يرجى إدخال التسمية" }]}
              style={{ marginBottom: "16px" }}
            >
              <Input
                placeholder="أدخل تسمية الفترة (مثال: دوام صباحي، دوام كامل...)"
                style={{ borderRadius: "6px" }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Text strong style={{ fontSize: "13px", color: "#262626" }}>
                  أيام العمل الإسبوعية
                </Text>
              }
              name="weekends"
              style={{ marginBottom: "16px" }}
            >
              <Select
                mode="multiple"
                placeholder="اختر أيام العمل لهذه الفترة"
                style={{ borderRadius: "6px" }}
              >
                {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map(day => (
                  <Option key={day} value={day}>{day}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <Text strong style={{ fontSize: "13px", color: "#262626" }}>
                  النوع
                </Text>
              }
              name="durationtype_id"
              rules={[{ required: true, message: "يرجى اختيار النوع" }]}
              style={{ marginBottom: "16px" }}
            >
              <Select
                showSearch
                options={types}
                placeholder="ابحث واختر نوع الفترة"
                optionFilterProp="children"
                notFoundContent={<Spin style={{ textAlign: "center" }} />}
                filterOption={(input, option) =>
                  option.props.children?.indexOf(input) >= 0 ||
                  option.props.value?.indexOf(input) >= 0 ||
                  option.props.label?.indexOf(input) >= 0
                }
                filterSort={(optionA, optionB) =>
                  optionA.props?.children?.localeCompare(optionB.props.children)
                }
                style={{ borderRadius: "6px" }}
              />
            </Form.Item>

            <Form.Item
              name={"date_range"}
              label={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <CalendarOutlined
                    style={{ color: "#1890ff", fontSize: "14px" }}
                  />
                  <Text strong style={{ fontSize: "13px", color: "#262626" }}>
                    الفترة الزمنية
                  </Text>
                </div>
              }
              rules={[
                { required: true, message: "يرجى اختيار فترة البدء والانتهاء" },
                {
                  validator: (_, value) => {
                    if (value && value[0] && value[1]) {
                      if (value[0].isAfter(value[1])) {
                        return Promise.reject(
                          new Error(
                            "تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء"
                          )
                        );
                      }
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              style={{ marginBottom: "16px" }}
            >
              <RangePicker
                needConfirm={true}
                inputReadOnly={window.innerWidth <= 760}
                format="YYYY-MM-DD"
                style={{ width: "100%", borderRadius: "6px" }}
                placeholder={["تاريخ البدء", "تاريخ الانتهاء"]}
              />
            </Form.Item>

            <Divider orientation="right">فترات الدوام اليومية</Divider>

            <Form.List name="periods">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Card
                      key={key}
                      size="small"
                      title={`الفترة ${index + 1}`}
                      extra={
                        fields.length > 1 ? (
                          <DeleteOutlined
                            style={{ color: "#ff4d4f", cursor: "pointer" }}
                            onClick={() => remove(name)}
                          />
                        ) : null
                      }
                      style={{
                        marginBottom: "16px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "6px",
                      }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "time_range"]}
                        label={
                          <div
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <ClockCircleOutlined
                              style={{ color: "#1890ff", fontSize: "14px" }}
                            />
                            <Text strong style={{ fontSize: "13px", color: "#262626" }}>
                              وقت الحضور والانصراف
                            </Text>
                          </div>
                        }
                        rules={[
                          { required: true, message: "يرجى اختيار أوقات هذه الفترة" },
                          {
                            validator: (_, value) => {
                              if (value && value[0] && value[1]) {
                                if (value[0].isAfter(value[1])) {
                                  return Promise.reject(
                                    new Error("وقت الحضور يجب أن يكون قبل وقت الانصراف")
                                  );
                                }
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        style={{ marginBottom: "16px" }}
                      >
                        <TimePicker.RangePicker
                          format="HH:mm"
                          style={{ width: "100%", borderRadius: "6px" }}
                          placeholder={["وقت الحضور", "وقت الانصراف"]}
                        />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "allowed_range"]}
                        label={
                          <div
                            style={{ display: "flex", alignItems: "center", gap: "6px" }}
                          >
                            <ClockCircleOutlined
                              style={{ color: "#52c41a", fontSize: "14px" }}
                            />
                            <Text strong style={{ fontSize: "13px", color: "#262626" }}>
                              أوقات السماح
                            </Text>
                          </div>
                        }
                        rules={[
                          { required: true, message: "يرجى اختيار أوقات السماح" },
                          {
                            validator: (_, value) => {
                              if (value && value[0] && value[1]) {
                                if (value[0].isAfter(value[1])) {
                                  return Promise.reject(
                                    new Error("سماح الحضور يجب أن يكون قبل سماح الانصراف")
                                  );
                                }
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        style={{ marginBottom: "8px" }}
                      >
                        <TimePicker.RangePicker
                          format="HH:mm"
                          style={{ width: "100%", borderRadius: "6px" }}
                          placeholder={["سماح الحضور", "سماح الانصراف"]}
                        />
                      </Form.Item>
                    </Card>
                  ))}

                  {/* Hide Add Period button in Edit mode, or allow multiple? Let's allow multiple always, but usually they edit single records */}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      style={{ borderRadius: "6px" }}
                    >
                      إضافة فترة دوام أخرى في نفس اليوم
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

          </Form>
        </Modal>
      </Card>
    </Layout>
  );
}
