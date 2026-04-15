/* eslint-disable react-hooks/rules-of-hooks */
import { FormOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Divider,
  Form,
  Input,
  Layout,
  Modal,
  notification,
  Table,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import "./style.css";

import { calculateDuration } from "../../../utilites/durationCalculator";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import { Env } from "./../../../styles";
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Text } = Typography;
const CheckboxGroup = Checkbox.Group;
const openNotification = (placement, text) => {
  notification.success({
    message: text,
    placement,
    duration: 10,
  });
};
export default function AlertsTable(props) {
  const [data, setData] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState([]);
  const [sortedInfo, setSortedInfo] = useState([]);
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [type, setType] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tstypes, setTstypes] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [currentEmployees, setCurrentEmployees] = useState([]);
  const [checkAll, setCheckAll] = React.useState(false);
  const [indeterminate, setIndeterminate] = React.useState(true);
  const [checkedList, setCheckedList] = React.useState([]);

  const id = cookies.user;
  const [load, setLoad] = useState(true);
  const [form] = Form.useForm();

  const [start, setStart] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10)
  );
  const [end, setEnd] = useState(
    new Date(new Date().setDate(new Date().getDate() + 1))
      .toISOString()
      .slice(0, 10)
  );
  const handleChange = (pagination, filters, sorter) => {
    console.log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  useEffect(() => {
    FirebaseServices.getUserType(props.user?.id)
      .then((data) => {
        setType(data);
      })
      .catch(function (error) {
        console.log(error);
      });

    FirebaseServices.getEmpNames()
      .then((data) => {
        if (props.user.role_id === 1) {
          setTstypes(data);
        } else {
          const filtered = data.filter(
            (record) => record.category === props.user.category.id
          );
          setTstypes(filtered);
        }
      })
      .catch(function (error) {
        console.error("❌ API Error:", error);
      });

    // جلب بيانات المستخدمين مع الصور
    FirebaseServices.getUsersFactorData()
      .then((data) => {
        setUsersData(data);
      })
      .catch(function (error) {
        console.log("Debug - get-users-factor-data error:", error);
      });

    FirebaseServices.getAlerts(id.user_id, start, end)
      .then((data) => {
        setData(data);
        setLoad(false);
      })
      .catch(function (error) {
        console.log("Debug - alerts error:", error);
      });
  }, [start, end]);

  const columns = [
    {
      title: "المرسل",
      dataIndex: "sender_id",
      key: "sender_id",
      width: 280,
      ellipsis: false,
      render: (sender_id, record) => {
        // البحث عن بيانات المرسل من قائمة الموظفين بالاسم
        const sender = tstypes.find(
          (emp) => emp.value === `"${sender_id}"` || emp.value === sender_id
        );
        const senderName = sender ? sender.label : "غير معروف";

        // البحث عن بيانات المرسل مع الصورة من usersData
        const userData = usersData.find(
          (user) =>
            user.user_id === sender_id || user.user_id === parseInt(sender_id)
        );

        // إنشاء صورة افتراضية إذا لم تتوفر صورة
        const avatarUrl = userData?.avatar
          ? Env.HOST_SERVER_STORAGE + userData.avatar
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              senderName
            )}&background=8c7ae6&color=fff&size=64`;

        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar size={40} src={avatarUrl} style={{ marginLeft: "10px" }} />
            <Text>{userData?.name || senderName}</Text>
          </div>
        );
      },
    },
    {
      title: "الإشعار",
      dataIndex: "text",
      key: "text",
      sorter: (a, b) => a.text.length - b.text.length,
      sortOrder: sortedInfo.columnKey === "text" && sortedInfo.order,
      ellipsis: false,
      render: (text, record) => {
        // تنسيق الفترة الزمنية إذا كانت متوفرة
        let periodText = "";
        if (record.date_from && record.date_to) {
          const fromDate = new Date(record.date_from);
          const toDate = new Date(record.date_to);

          const fromYear = fromDate.getFullYear();
          const fromMonth = String(fromDate.getMonth() + 1).padStart(2, "0");
          const fromDay = String(fromDate.getDate()).padStart(2, "0");
          const fromHours = String(fromDate.getHours()).padStart(2, "0");
          const fromMinutes = String(fromDate.getMinutes()).padStart(2, "0");

          const toYear = toDate.getFullYear();
          const toMonth = String(toDate.getMonth() + 1).padStart(2, "0");
          const toDay = String(toDate.getDate()).padStart(2, "0");
          const toHours = String(toDate.getHours()).padStart(2, "0");
          const toMinutes = String(toDate.getMinutes()).padStart(2, "0");

          const fromDateString = `${fromYear}/${fromMonth}/${fromDay}`;
          const toDateString = `${toYear}/${toMonth}/${toDay}`;
          const fromTimeString = `${fromHours}:${fromMinutes}`;
          const toTimeString = `${toHours}:${toMinutes}`;

          periodText = `من ${fromDateString} ${fromTimeString} إلى ${toDateString} ${toTimeString}`;
        }

        return (
          <div>
            <div style={{ marginBottom: "4px" }}>
              <Text>{text}</Text>
            </div>
            {periodText && (
              <div style={{ fontSize: "12px", color: "#666" }}>
                <Text type="secondary">{periodText}</Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "مدة الإجازة",
      key: "duration",
      width: 160,
      ellipsis: false,
      align: "center",
      render: (_, record) => {
        const dailyWorkingHours =
          props.dailyWorkingHours || props.user?.dailyWorkingHours || 7;
        const duration = calculateDuration(
          record.date_from,
          record.date_to,
          dailyWorkingHours
        );

        // إذا لم تكن هناك مدة صالحة، عرض نص بديل
        if (typeof duration === "string") {
          return (
            <div
              style={{
                textAlign: "center",
                color: "#bfbfbf",
                fontStyle: "italic",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: "40px",
              }}
            >
              {duration}
            </div>
          );
        }

        // عرض المدة حسب النوع الجديد
        if (duration.type === "full-days") {
          return (
            <div className="duration-display">
              {/* إخفاء الساعات إذا كانت المدة يوم أو أكثر */}
              {!duration.hasDays && (
                <div className="duration-hours">{duration.hours}</div>
              )}
              <div className="duration-days">{duration.days}</div>
            </div>
          );
        } else if (duration.type === "partial-days") {
          return (
            <div className="duration-display">
              <div className="duration-days">{duration.days}</div>
              {/* إظهار الوقت فقط إذا كانت المدة أقل من يوم */}
              {!duration.hasDays && (
                <div className="duration-time">{duration.time}</div>
              )}
            </div>
          );
        } else if (duration.type === "full-day") {
          return (
            <div className="duration-display">
              {/* إخفاء الساعات إذا كانت المدة يوم أو أكثر */}
              {!duration.hasDays && (
                <div className="duration-hours">{duration.hours}</div>
              )}
              <div className="duration-days">{duration.days}</div>
            </div>
          );
        } else if (duration.type === "time-only") {
          return (
            <div className="duration-display">
              <div className="duration-time" style={{ marginBottom: 0 }}>
                {duration.time}
              </div>
            </div>
          );
        }

        return duration;
      },
    },
    {
      title: "تاريخ الإشعار",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      sorter: (a, b) => a.created_at.length - b.created_at.length,
      sortOrder: sortedInfo.columnKey === "created_at" && sortedInfo.order,
      ellipsis: false,
      render: (created_at) => {
        if (!created_at) return "غير محدد";

        const date = new Date(created_at);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        const dateString = `${year}/${month}/${day}`;
        const timeString = `${hours}:${minutes}:${seconds}`;

        return (
          <div>
            <div style={{ marginBottom: "4px" }}>
              <Text>{dateString}</Text>
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              <Text type="secondary">{timeString}</Text>
            </div>
          </div>
        );
      },
    },
  ];
  const onCheckAllChange = (e) => {
    var selOptions = [];
    if (e.target.checked) {
      const allOptions = getNameOptions(currentEmployees);
      allOptions.map((item) => selOptions.push(item.value));
    }

    setCheckedList(selOptions);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
  };
  const options = [];
  const changeRange = (all, date) => {
    //const id=cookies.user;
    setLoad(true);
    setStart(date[0]);
    setEnd(date[1]);
  };
  const getNameOptions = (employeesData = null) => {
    options.length = 0; // مسح البيانات القديمة
    const dataToUse = employeesData || tstypes;
    console.log("🎯 getNameOptions called!");
    console.log("🎯 Using data length:", dataToUse.length);
    console.log(
      "🎯 Data source:",
      employeesData ? "Direct API" : "tstypes state"
    );

    for (var i = 0; i < dataToUse.length; i++)
      options.push({
        label: dataToUse[i].label,
        value: '"' + dataToUse[i].value + '"',
      });
    console.log("🎯 Generated options:", options);
    return options;
  };
  const onFinish = (values) => {
    setSaving(true);
    values.users = checkedList;
    values.sender_id = cookies.user.user_id;
    FirebaseServices.addAlert(values)
      .then((response) => {
        setIsModalVisible(false);
        setSaving(false);
        openNotification(
          "bottomLeft",
          <span> {"تم إرسال الإشعار بنجاح!"}</span>
        );
      })
      .catch(function (error) {
        alert("يوجد مشكلة في الإرسال!");
        setSaving(false);
      });
  };
  const onChange = (list) => {
    setCheckedList(list);
    const allOptions = getNameOptions(currentEmployees);
    setIndeterminate(!!list.length && list.length < allOptions.length);
    setCheckAll(list.length === allOptions.length);
  };
  return (
    <Layout>
      <Modal
        centered
        footer={null}
        width={1000}
        style={{ direction: "rtl" }}
        title="إضافة إشعار"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
          name="dynamic_form_nest_item"
          autoComplete="on"
          onFinish={onFinish}
        >
          <Form.Item label="نص الإشعار" name="text">
            <TextArea rows={4} />
          </Form.Item>

          <div style={{ marginBottom: "12px" }}>
            <Checkbox
              value={checkAll}
              indeterminate={indeterminate}
              onChange={onCheckAllChange}
              checked={checkAll}
            >
              تحديد الكل
            </Checkbox>
          </div>

          <Divider style={{ margin: "10px 0" }} />

          <Form.Item style={{ marginBottom: "24px" }}>
            <CheckboxGroup
              name="users"
              className="usersNames"
              options={getNameOptions(currentEmployees)}
              value={checkedList}
              onChange={onChange}
            />
          </Form.Item>

          {/* الأزرار مع تباعد متناسق */}
          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* زر الإلغاء جهة اليسار */}
              <Button onClick={() => setIsModalVisible(false)}>إلغاء</Button>

              {/* زر الإرسال جهة اليمين */}
              <Button loading={saving} type="primary" htmlType="submit">
                إرسال
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Card>
        <div
          className="discountBtn"
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <div className="discountRange">
            <div style={{ marginLeft: "10px" }}>
              <span>اختر فترة : </span>
              <RangePicker
                needConfirm={true}
                inputReadOnly={window.innerWidth <= 760}
                onChange={changeRange}
              />
            </div>
            <div className="addbtn">
              {type && (props.user.role_id === 1 || type !== 3) ? (
                <Button
                  style={{ marginRight: "5px" }}
                  onClick={function () {
                    FirebaseServices.getEmpNames()
                      .then((data) => {
                        let employeesToUse;
                        if (props.user.role_id === 1) {
                          employeesToUse = data;
                        } else {
                          employeesToUse = data.filter((record) => {
                            return record.category === props.user.category.id;
                          });
                        }
                        setTstypes(employeesToUse);
                        setCurrentEmployees(employeesToUse);
                        form.resetFields(["text"]);
                        setIsModalVisible(true);
                      })
                      .catch((error) => {
                        form.resetFields(["text"]);
                        setIsModalVisible(true);
                      });
                  }}
                  type="primary"
                >
                  <FormOutlined />
                  إضافة إشعار{" "}
                </Button>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        <Table
          loading={load}
          columns={columns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: "1100px" }}
          onChange={handleChange}
        />
      </Card>
    </Layout>
  );
}
