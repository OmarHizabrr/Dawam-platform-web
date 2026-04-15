/* eslint-disable react-hooks/rules-of-hooks */
import { ImportOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Modal,
  notification,
  Select,
  Table,
  Typography,
  Upload,
} from "antd";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
// import axios from "axios";
import ZKLib from "node-zklib";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import excel from "xlsx";
import { Env } from "../../../styles";
import "./style.css";
const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function events() {
  const [cookies, setCookie, removeCookie] = useCookies(["userId"]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [startVac, setStartVac] = useState("");
  const [type, setType] = useState(null);
  const [start, setStart] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10)
  );
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [endVac, setEndVac] = useState("");
  const [notes, setNotes] = useState("");
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [connected, setConnected] = useState(true);
  const user = cookies.user;
  useEffect(() => {
    setLoad(true);
    FirebaseServices.getEvents(start, end)
      .then((data) => {
        setData(data);
        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [start, end]);

  const handleTypeChange = (e) => {
    setType(e);
  };
  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };
  const onRangeChange = (all, dates) => {
    setStartVac(dates[0]);
    setEndVac(dates[1]);
  };
  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    var values = {
      user_id: cookies.user.user_id,
      startDate: startVac,
      endDate: endVac,
      type: type,
      note: notes,
    };
    FirebaseServices.addTask(values)
      .then(function (response) {
        if (response.statusText == "OK") {
          alert("تم إرسال الإجازة بنجاح");
        }
      })
      .catch(function (error) {
        alert("error..");
        console.log(error);
      });
    setIsModalVisible(false);
  };
  const notesChange = (e) => {
    setNotes(e.target.value);
  };
  const columns = [
    {
      title: "اسم الموظف",
      dataIndex: "fullname",
      key: "fullname",
      ellipsis: true,
    },
    {
      title: "الرقم الوظيفي",
      dataIndex: "user_id",
      key: "user_id",
      ellipsis: true,
    },
    {
      title: "التاريخ",
      dataIndex: "events_datetime",
      key: "events_datetime",
      ellipsis: true,
      render: (dt) => dt?.split(" ")[0],
    },
    {
      title: "الوقت",
      dataIndex: "events_datetime",
      key: "events_datetime_time",
      ellipsis: true,
      render: (dt) => dt?.split(" ")[1],
    },
    {
      title: "نوع الحدث",
      dataIndex: "event_type",
      key: "event_type",
      ellipsis: true,
      render: (event_type) => {
        if (
          event_type === null ||
          event_type === undefined ||
          event_type === ""
        ) {
          return "-";
        }
        const eventTypes = {
          0: "دخول",
          1: "خروج",
        };
        return eventTypes[event_type] || `نوع ${event_type}`;
      },
    },
    {
      title: "اسم الجهاز",
      dataIndex: "device_name",
      key: "device_name",
      ellipsis: true,
      render: (device_name) => device_name || "-",
    },
    {
      title: "عنوان الآيبي",
      dataIndex: "device_ip",
      key: "device_ip",
      ellipsis: true,
      render: (device_ip) => device_ip || "-",
    },
    {
      title: "رقم الجهاز",
      dataIndex: "device_id",
      key: "device_id",
      ellipsis: true,
      render: (device_id) => device_id || "-",
    },
    {
      title: "حالة البصمة",
      dataIndex: "device_status",
      key: "device_status",
      ellipsis: true,
      render: (status, record) => {
        // استخدام device_status_code إذا كان متوفراً، وإلا نتحقق من device_status
        const statusCode = record.device_status_code;
        const statusText = record.device_status || status;

        if (statusCode === 0 || statusText === "مرفوضة") {
          return (
            <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
              ❌ مرفوضة
            </span>
          );
        } else if (statusCode === 1 || statusText === "مقبولة") {
          return (
            <span style={{ color: "#52c41a", fontWeight: "bold" }}>
              ✅ مقبولة
            </span>
          );
        }
        return "-";
      },
    },
  ];
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const testConnection = async () => {
    // ZKLib = require('./zklib')
    let zkInstance = new ZKLib("192.168.0.201", 4370, 10000, 4000);
    try {
      // Create socket to machine
      await zkInstance.createSocket();
      // Get general info like logCapacity, user counts, logs count
      // It's really useful to check the status of device
      console.log(await zkInstance.getInfo());
    } catch (e) {
      console.log(e);
      if (e.code === "EADDRINUSE") {
      }
    }
  };
  const changeRange = (all, date) => {
    setStart(date[0]);
    setEnd(date[1]);
  };
  const openNotification = (placement, text) => {
    notification.success({
      message: text,
      placement,
      duration: 10,
    });
  };
  const testUpload = (file) => {
    setUploading(true);
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = (e) => {
      const bstr = e.target.result;

      const wb = excel.read(bstr, { type: rABS ? "binary" : "array" });

      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = excel.utils.sheet_to_json(ws, { header: 1 });

      /* Check if first row contains headers */
      const hasHeaders =
        data.length > 0 &&
        typeof data[0][0] === "string" &&
        (data[0][0].toLowerCase().includes("user") ||
          data[0][0].toLowerCase().includes("user_id"));

      const startIndex = hasHeaders ? 1 : 0;
      const eventsArray = [];

      for (let i = startIndex; i < data.length; i++) {
        const element = data[i];
        if (!element || !element[0]) continue; // Skip empty rows

        const eventObj = {
          user_id: element[0]?.toString() || "",
          events_datetime: element[1]?.toString() || "",
        };

        // إضافة الحقول الجديدة إذا كانت موجودة
        // التنسيق المتوقع: [user_id, events_datetime, device_id, device_ip, device_name, event_type]
        if (
          element[2] !== undefined &&
          element[2] !== null &&
          element[2] !== ""
        ) {
          eventObj.device_id = element[2]?.toString();
        }
        if (
          element[3] !== undefined &&
          element[3] !== null &&
          element[3] !== ""
        ) {
          eventObj.device_ip = element[3]?.toString();
        }
        if (
          element[4] !== undefined &&
          element[4] !== null &&
          element[4] !== ""
        ) {
          eventObj.device_name = element[4]?.toString();
        }
        if (
          element[5] !== undefined &&
          element[5] !== null &&
          element[5] !== ""
        ) {
          eventObj.event_type = element[5]?.toString();
        }

        eventsArray.push(eventObj);
      }

      console.log("Events to import:", eventsArray);
      FirebaseServices.importEvents(eventsArray)
        .then((response) => {
          console.log(response);
          setUploading(false);
          openNotification("bottomLeft", "تم الاستيراد بنجاح");
          // إعادة تحميل البيانات
          setLoad(true);
          FirebaseServices.getEvents(start, end)
            .then((data) => {
              setData(data);
              setLoad(false);
            })
            .catch(function (error) {
              console.log(error);
              setLoad(false);
            });
        })
        .catch(function (error) {
          console.error("Import error:", error);
          notification.error({
            message: "فشل الاستيراد",
            description:
              error.message || "يوجد مشكلة في الاتصال بالسرفر!",
            placement: "bottomLeft",
            duration: 5,
          });
          setUploading(false);
        });
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);

    // Prevent upload
    return false;
  };
  return (
    <Card>
      <div className="discountHeader">
        <div className="discountRange">
          <span>اختر فترة : </span>
          <RangePicker
            needConfirm={true}
            inputReadOnly={window.innerWidth <= 760}
            onChange={changeRange}
          />
        </div>
        <Upload
          accept=".xlsx, .csv"
          showUploadList={false}
          beforeUpload={(file) => {
            testUpload(file);
          }}
        >
          <Button
            loading={uploading}
            className="discountBtn"
            style={{
              display: "block",
              backgroundColor: "#0972B6",
              borderColor: "#0972B6",
            }}
            type="primary"
          >
            <ImportOutlined /> استيراد البصمات{" "}
          </Button>
        </Upload>
      </div>
      <Modal
        centered
        title="تقديم إجازة / مهمة"
        visible={isModalVisible}
        onOk={function () {
          handleOk();
        }}
        onCancel={function () {
          handleCancel();
        }}
      ></Modal>
      <Table
        scroll={{ x: "1400px" }}
        loading={load}
        columns={columns}
        dataSource={data}
        onChange={handleChange}
        rowKey={(record, index) =>
          record.user_id + "_" + record.events_datetime + "_" + index
        }
      />
    </Card>
  );
}
