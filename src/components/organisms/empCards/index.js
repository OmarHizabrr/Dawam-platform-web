/* eslint-disable jsx-a11y/anchor-is-valid */
import { FirebaseServices } from "../../../firebase/FirebaseServices";
// import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { Env, PrintFonts } from "./../../../styles";
import AttendanceTable from "./../attendanceTable";
import BonusTable from "./../bonusTable";
import TasksTable from "./../tasksTable";

import ReactApexChart from "react-apexcharts";

import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Collapse,
    DatePicker,
    Divider,
    Dropdown,
    Form,
    Input,
    InputNumber,
    Layout,
    Menu,
    Modal,
    notification,
    Progress,
    Rate,
    Row,
    Select,
    Skeleton,
    Space,
    Spin,
    Typography,
} from "antd";
import "./style.css";

import {
    ClockCircleOutlined,
    ClusterOutlined,
    FormOutlined,
    MoreOutlined,
    PlusOutlined,
    PrinterOutlined,
    SearchOutlined,
    TagsOutlined,
} from "@ant-design/icons";

import EmployeeModal from "./EmployeeModal";

const { Text } = Typography;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function EmpCards(props) {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [durations, setDurations] = useState([]);
  const [types, setTypes] = useState([]);

  const [phones, setPhones] = useState([]);
  const [allows, setAllows] = useState([]);
  const [deductionsData, setDeductionsData] = useState([]);

  const [qualifications, setQualifications] = useState([]);
  const [preworks, setPreworks] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [load, setLoad] = useState(true);
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [isRVisibleModal, setIsRVisibleModal] = useState(false);
  const [isDVisibleModal, setIsDVisibleModal] = useState(false);
  const [duser, setDUser] = useState([]);
  const [isAVisibleModal, setIsAVisibleModal] = useState(false);
  const [isTVisibleModal, setIsTVisibleModal] = useState(false);
  const [isBVisibleModal, setIsBVisibleModal] = useState(false);

  const [isFactorModalVisible, setIsFactorModalVisible] = useState(false);

  const [start, setStart] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .slice(0, 10)
  );
  const [end, setEnd] = useState(
    new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .slice(0, 10)
  );
  const [starList, setStarList] = useState([]);
  const [modalLoad, setModalLoad] = useState(false);
  const [userFormDisable, setUserFormDisable] = useState(true);
  const [update, setUpdate] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [vacsData, setVacsData] = useState([]);
  const [vacsCats, setVacsCats] = useState([]);
  const [discData, setDiscData] = useState([]);
  const [attDates, setAttDates] = useState([]);
  const [attAtt, setAttAtt] = useState([]);
  const [attCount, setAttCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [thresholds, setThresholds] = useState([]);
  const [spiderData, setSpiderData] = useState([]);
  const [reportLoad, setReportLoad] = useState(true);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadUsers, setLoadUsers] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Filter data based on search text
  const filteredData = data.filter((user) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      user.user_name?.toLowerCase().includes(searchLower) ||
      user.job?.toLowerCase().includes(searchLower) ||
      user.category?.toLowerCase().includes(searchLower) ||
      user.user_id?.toString().includes(searchText)
    );
  });

  const totalRatePercent = (record) => {
    const attendanceRate = Number(record?.attendance_rate) || 0;
    const attRate = Number(record?.att_rate) || 0;
    const leaveRate = Number(record?.leave_rate) || 0;

    return Math.round(
      ((attendanceRate * 100 + (attRate * 100) * attendanceRate + (leaveRate * 100) * attendanceRate) /
        3)
    );
  };

  const UploadProps = {
    showUploadList: {
      showRemoveIcon: true,
      showDownloadIcon: true,
      downloadIcon: "Download",
    },
  };

  const [userform] = Form.useForm();
  const [formDate] = Form.useForm();
  const [factorForm] = Form.useForm();
  const [ifactorForm] = Form.useForm();

  const printReport = () => {
    var report = document.getElementById("prank-report");
    //var report=document.body;
    var mywindow = window.open("");
    mywindow.document.write(
      "<html><head><title></title> <style>" +
        PrintFonts.getPrintFontsCSS() +
        "body{font-size:12px;margin:0} " +
        "</style>"
    );
    mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
    mywindow.document.write(report.innerHTML);
    mywindow.document.write("</body></html>");

    mywindow.document.close();
    mywindow.onload = function () {
      // wait until all resources loaded
      mywindow.focus(); // necessary for IE >= 10
      mywindow.print(); // change window to mywindow
      mywindow.close(); // change window to mywindow
    };
  };
  useEffect(() => {
    setLoad(true);
    FirebaseServices.getUsersData(today, start, end)
      .then((data) => {
        setData(data["users"]);
        setPhones(data["phones"]);
        setAllows(data["allownces"]);
        setDeductionsData(data["deductions"]);
        setQualifications(data["qualifications"]);
        setPreworks(data["preworks"]);
        setAttachments(data["attachments"]);

        var stars = [];
        data["lists"].forEach(function (e) {
            var avg = (e.salary && data.count?.[0]?.count) ?
              (((data.count[0].count - e.attendanceDays) *
                (e.salary / data.count[0].count) +
                parseInt(e.lateTimePrice || 0)) /
              e.salary) : 0;
            stars.push({
              user_id: e.user_id,
              category_id: e.category_id,
              star: (1 - avg) * 100,
            });
        });
        setStarList(stars);

        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
      });
    FirebaseServices.getUsersInfo()
      .then((data) => {
        setCategories(data["categroies"]);
        setDurations(data["durations"]);
        setTypes(data["types"]);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [update]);

  function callback(key) {
    // console.log(key);
  }

  const intervals = [
    { label: "سنوات", seconds: 31536000 },
    { label: "أشهر", seconds: 2592000 },
    { label: "أيام", seconds: 86400 },
    { label: "ساعات", seconds: 3600 },
    { label: "دقائق", seconds: 60 },
    { label: "ثواني", seconds: 1 },
  ];
  const sintervals = [
    { label: "سنة", seconds: 31536000 },
    { label: "شهر", seconds: 2592000 },
    { label: "يوم", seconds: 86400 },
    { label: "ساعة", seconds: 3600 },
    { label: "دقيقة", seconds: 60 },
    { label: "ثانية", seconds: 1 },
  ];
  const dintervals = [
    { label: "سنتين", seconds: 31536000 },
    { label: "شهرين", seconds: 2592000 },
    { label: "يومين", seconds: 86400 },
    { label: "ساعتين", seconds: 3600 },
    { label: "دقيقتين", seconds: 60 },
    { label: "ثانيتين", seconds: 1 },
  ];
  function timeSince(date) {
    // const datet=new Date(date);
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    const interval = intervals.find((i) => i.seconds < seconds);
    const sinterval = sintervals.find((i) => i.seconds < seconds);
    const dinterval = dintervals.find((i) => i.seconds < seconds);
    //alert(date);
    const count = Math.floor(seconds / interval?.seconds);
    if (count === 1) return `منذ ${sinterval?.label}`;
    else if (count === 2) return `منذ ${dinterval?.label}`;
    else
      return `منذ ${count} ${
        count > 2 && count <= 10 ? interval?.label : sinterval?.label
      }`;
  }
  const listData = [];

  for (let i = 0; i < 16; i++) {
    listData.push(
      <Col style={{ padding: "10px", display: load ? "" : "none" }} span={6}>
        <Skeleton loading={load} avatar active={load}></Skeleton>
      </Col>
    );
  }

  const onFactorFinish = () => {
    setSaving(true);

    var userData = factorForm.getFieldsValue();

    FirebaseServices.addFactor(userData)
      .then((res) => {
        if (res.status == 200) {
          notification.success({
            message: "تمت العملية بنجاح",
            placement: "bottomLeft",
            duration: 10,
          });
          factorForm.resetFields();
          setUpdate(update + 1);
          setIsFactorModalVisible(false);
          setSaving(false);
        } else {
          alert("فشل إضافة موظف");
          setModalLoad(false);
        }
      })
      .catch((err) => {
        console.log(err);
        alert("فشل إضافة موظف");
        setModalLoad(false);
      });
  };
  const onFinish = () => {
    setSaving(true);

    var userData = userform.getFieldsValue();

    FirebaseServices.addUser(userData)
      .then((res) => {
        if (res.status == 200) {
          notification.success({
            message: "تمت العملية بنجاح",
            placement: "bottomLeft",
            duration: 10,
          });
          factorForm.resetFields();
          setUpdate(update + 1);
          setIsVisibleModal(false);
          setModalLoad(false);
        } else {
          alert("فشل إضافة موظف");
          setModalLoad(false);
        }
      })
      .catch((err) => {
        setModalLoad(false);
        setSaving(false);
        if (
          err.response &&
          err.response.status === 422 &&
          err.response.data &&
          err.response.data.missing_fields
        ) {
          // Map backend missing fields to Ant Design form errors
          const backendFields = err.response.data.missing_fields;
          const backendMessages = err.response.data.messages;
          const fieldsError = backendFields.map((field, idx) => ({
            name: field,
            errors: [backendMessages[idx] || "هذا الحقل مطلوب"],
          }));
          userform.setFields(fieldsError);
          notification.error({
            message: "هناك حقول مطلوبة",
            description: backendMessages.join("، "),
            placement: "bottomLeft",
            duration: 8,
          });
        } else {
          alert("فشل إضافة موظف");
        }
      });
  };
  var options = {
    title: {
      text: "خلاصة الخصميات",
      align: "center",
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating: false,
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        fontFamily:
          "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        color: "#263238",
      },
    },
    series: discData,
    chart: {
      type: "donut",
    },
    labels: ["سُلف", "أقساط", "تأخرات", "غياب", "جزاءات", "صافي الاستحقاق"],

    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };
  var voptions = {
    title: {
      text: "خلاصة الإجازات",
      align: "center",
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating: true,
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        fontFamily:
          "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        color: "#263238",
      },
    },
    series: [
      {
        name: "مدة الإجازة",
        data: vacsData,
      },
    ],
    chart: {
      height: 200,
      type: "bar",
    },
    plotOptions: {
      bar: {
        columnWidth: "45%",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: vacsCats,
      labels: {
        style: {
          fontFamily:
            "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      style: {
        fontFamily:
          "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        marginLeft: "5px",
      },
      y: {
        formatter: function (val, opts) {
          return val + " دقيقة";
        },
      },
    },
  };
  const sconfig = {
    options: {
      chart: {
        dropShadow: {
          enabled: true,
          blur: 1,
          left: 1,
          top: 1,
        },
      },
      dataLabels: {
        enabled: true,
        background: {
          enabled: true,
          borderRadius: 2,
        },
      },
      xaxis: {
        categories: [
          "الحضور المبكر",
          "الانضباط",
          "الانصراف",
          "نسبة أيام الحضور",
          "احترام النظام",
        ],
        labels: {
          show: true,
          style: {
            colors: ["#808080"],
            fontSize: "11px",
            fontFamily:
              "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          },
        },
      },
      yaxis: {
        min: 0,
        max: 100,
        tickAmount: 5,
      },
      colors: ["#0972B6", "#002612"],
      stroke: {
        width: 1,
      },
      fill: {
        opacity: 0.5,
      },
      markers: {
        size: 5,
      },
    },
    series: [
      {
        name: "النسبة",
        data: spiderData,
      },
    ],
  };

  const config2 = {
    series: [
      {
        name: "صافي الدوام",
        data: attAtt,
      },
      {
        name: "الدوام المثالي",
        data: thresholds,
      },
    ],
    options: {
      title: {
        text: "حركة الحضور والانصراف",
        align: "center",
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: true,
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          fontFamily:
            "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          color: "#263238",
        },
      },
      chart: {
        height: 400,
        type: "area",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: "smooth",
        width: 2,
      },
      xaxis: {
        type: "datetime",
        categories: attDates,
      },
      yaxis: {
        type: "datetime",
        min: 0,
        max: 660,
        tickAmount: 7,
      },
      tooltip: {
        style: {
          fontFamily:
            "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          marginLeft: "5px",
        },
        x: {
          show: true,
          format: "dd-MM-yyyy",
        },
        y: {
          format: "HH:mm",
          formatter: function (val, opts) {
            return parseInt(val / 60) + ":" + (val % 60);
          },
        },
      },
    },
  };

  const openAttModal = (user) => {
    setSelectedUser(user);
    setIsAVisibleModal(true);
  };

  const openBonusModal = (user) => {
    setSelectedUser(user);
    setIsBVisibleModal(true);
  };

  const openTaskModal = (user) => {
    setSelectedUser(user);
    setIsTVisibleModal(true);
  };

  const openShowUser = (user) => {
    setSelectedUser(user);
    var birth = user.birth_date;
    var assign = user.assignment_date;
    userform.setFieldsValue(user);
    userform.setFieldsValue({ birth_date: dayjs(birth, "YYYY-MM-DD") });
    userform.setFieldsValue({ assignment_date: dayjs(assign, "YYYY-MM-DD") });
    userform.setFieldsValue({ password: user.password });
    // تحويل control_panel و general_manager إلى boolean
    userform.setFieldsValue({
      control_panel: user.control_panel == 1 || user.control_panel === 1,
    });
    userform.setFieldsValue({
      general_manager: user.general_manager == 1 || user.general_manager === 1,
    });
    setIsVisibleModal(true);

    var conts = phones;
    conts = conts.filter(function (e) {
      return e.user_id == user.id;
    });
    userform.setFieldsValue({ contacts: conts });

    var allow = allows;
    allow = allow.filter(function (e) {
      return e.user_id == user.user_id;
    });
    userform.setFieldsValue({ allownces: allow });

    var deductions = deductionsData?.filter(function (e) {
      return e.user_id == user.user_id;
    });
    userform.setFieldsValue({ deductions: deductions });

    var quals = qualifications;
    quals = quals.filter(function (e) {
      return e.user_id == user.id;
    });

    quals.forEach((element) => {
      element.qual_year = dayjs(element.qual_year, "YYYY");
    });
    userform.setFieldsValue({ qualifications: quals });
    //setQualifications(quals);

    var pworks = preworks;
    pworks = pworks.filter(function (e) {
      return e.user_id == user.id;
    });
    pworks.forEach((element) => {
      element.work_period = [
        dayjs(element.date_from, "YYYY"),
        dayjs(element.date_to, "YYYY"),
      ];
    });
    userform.setFieldsValue({ preworks: pworks });
    //setPreworks(pworks);

    //------------------------------------------
    var attachs = attachments;
    attachs = attachs.filter(function (e) {
      return e.user_id == user.id;
    });
    userform.setFieldsValue({ attachments: attachs });

    //-----------------------------
  };

  // دالة طباعة بيانات الموظف
  const printEmployeeData = (user) => {
    // إنشاء نافذة طباعة جديدة
    const printWindow = window.open("", "_blank", "width=1200,height=800");

    // الحصول على البيانات المطلوبة
    const userContacts = phones.filter((e) => e.user_id == user.id);
    const userAllowances = allows.filter((e) => e.user_id == user.user_id);
    const userDeductions = deductionsData?.filter(
      (e) => e.user_id == user.user_id
    );
    const userQualifications = qualifications.filter(
      (e) => e.user_id == user.id
    );
    const userPreworks = preworks.filter((e) => e.user_id == user.id);
    const userAttachments = attachments.filter((e) => e.user_id == user.id);

    // تنسيق التاريخ
    const formatDate = (dateString) => {
      if (!dateString) return "غير محدد";
      return dayjs(dateString).format("DD/MM/YYYY");
    };

    // الحصول على الشعار من الإعدادات
    const logoUrl = props.setting?.filter(
      (item) => item.key == "admin.logo"
    )?.[0]?.value;

    // إنشاء محتوى الطباعة
    const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>استمارة بيانات موظف - ${user.user_name}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    ${PrintFonts.getPrintFontsCSS()}

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #fff;
      color: #333;
      line-height: 1.5;
      padding: 12px;
    }

    .form-container {
      max-width: 1000px;
      margin: 0 auto;
      background: #fff;
      box-shadow: 0 0 12px rgba(0,0,0,0.08);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #eee;
    }

    /* البسملة */
    .basmala {
      text-align: center;
      padding: 12px 16px 8px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 2px solid #dee2e6;
      margin-bottom: -8px;
    }

    .basmala h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      font-family: Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      letter-spacing: 1px;
    }

    /* رأس الاستمارة */
    .form-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }

    .header-side {
      flex: 0 0 28%;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 180px;
    }

    .header-center {
      flex: 1 1 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0 8px;
    }

    .header-center h3 {
      font-size: 18px;
      font-weight: 700;
      color: #2c3e50;
    }

    .logo-img {
      max-width: 100%;
      max-height: 110px;
      width: auto;
      height: auto;
      object-fit: contain;
    }

    .header-photo {
      width: 110px;
      height: 130px;
      border: 1px dashed #bdc3c7;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #95a5a6;
      font-size: 13px;
      text-align: center;
      background: #f8f9fa;
      overflow: hidden;
      flex-shrink: 0;
    }

    .header-photo img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* أقسام الاستمارة */
    .form-section { border-bottom: 1px solid #ecf0f1; }

    .section-header {
      background: #1276DA;
      color: #fff;
      padding: 8px 12px;
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-header::before {
      content: '📋';
      font-size: 14px;
      line-height: 1;
    }

    .section-content {
      padding: 14px 16px;
      background: #fff;
    }

    /* تخطيط الحقول - تقليل المسافات */
    .field-row {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .field-group {
      flex: 1 1 0;
      display: flex;
      flex-direction: column;
      min-width: 180px;
    }

    .field-label {
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 4px;
      font-size: 13px;
      text-align: right;
    }

    .field-input {
      width: 100%;
      padding: 9px 12px;
      border: 1px solid #cfd4d9;
      border-radius: 10px;
      font-size: 13px;
      font-family: Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      background: #f9fafb;
    }

    .field-input:focus {
      outline: none;
      border-color: #3498db;
      background: #fff;
    }

    /* أحجام نسبية اختيارية */
    .full-width   { flex: 1 1 100%; }
    .half-width   { flex: 1 1 calc(50% - 5px); }
    .quarter-width{ flex: 1 1 calc(25% - 7.5px); }

    /* زر الطباعة */
    .print-btn {
      position: fixed;
      top: 12px;
      inset-inline-end: 12px;
      background: #e74c3c;
      color: #fff;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-family: Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.18);
      transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
      z-index: 1000;
    }

    .print-btn:hover {
      background: #c0392b;
      transform: translateY(-1px);
      box-shadow: 0 10px 16px rgba(0,0,0,0.22);
    }

    /* تذييل الاستمارة */
    .form-footer {
      background: #f8f9fa;
      padding: 14px 16px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }

    .footer-text {
      color: #7f8c8d;
      font-size: 13px;
      margin: 0;
    }

    /* طباعة */
    @media print {
      .print-btn { display: none; }
      body { background: #fff; padding: 0; }
      .form-container { box-shadow: none; border: 1px solid #ddd; border-radius: 0; }
      .basmala { 
        background: #f8f9fa !important; 
        padding: 8px 16px 6px !important;
        border-bottom: 1px solid #ddd !important;
        margin-bottom: -6px !important;
      }
      .basmala h2 { 
        font-size: 12px !important; 
        color: #2c3e50 !important;
        text-shadow: none !important;
      }
      .section-content { padding: 10px 12px; }
      .field-row { margin-bottom: 8px; gap: 8px; }
      .field-input { padding: 7px 10px; }
      .header-center h3 { font-size: 16px; }
      .header-photo { width: 100px; height: 120px; }
    }

    /* استجابة للشاشات الضيقة */
    @media (max-width: 600px) {
      .form-header { flex-wrap: wrap; }
      .header-side { flex: 1 1 45%; }
      .header-center { flex: 1 1 100%; order: -1; padding-bottom: 6px; }
      .quarter-width { flex: 1 1 calc(50% - 5px); }
      .half-width { flex: 1 1 100%; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ طباعة</button>

  <div class="form-container">
    <!-- البسملة في أعلى الاستمارة -->
    <div class="basmala">
      <h2>بسم الله الرحمن الرحيم</h2>
    </div>
    
    <!-- رأس الاستمارة: الشعار يساراً وصورة الموظف يميناً في نفس السطر -->
    <header class="form-header">
      <!-- الشعار -->
      <div class="header-side" aria-label="الشعار">
        <img
          loading="eager"
          class="logo-img"
          alt="logo"
          src="${Env.HOST_SERVER_STORAGE + logoUrl}"
        />
      </div>

      <!-- العنوان في الوسط -->
      <div class="header-center">
        <h3>استمارة بيانات موظف</h3>
      </div>

      <!-- صورة الموظف -->
      <div class="header-side" aria-label="صورة الموظف" style="justify-content: center;">
        <div class="header-photo">
          ${
            user.avatar
              ? `<img src="${
                  Env.HOST_SERVER_STORAGE + user.avatar
                }" alt="صورة الموظف">`
              : "صورة<br>الموظف"
          }
        </div>
      </div>
    </header>

    <!-- البيانات الشخصية -->
    <div class="form-section">
      <div class="section-header">البيانات الشخصية</div>
      <div class="section-content">
        <div class="field-row">
          <div class="field-group full-width">
            <label class="field-label">الاسم رباعياً</label>
            <input type="text" class="field-input" value="${
              user.name || ""
            }" readonly>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group quarter-width">
            <label class="field-label">الجنس</label>
            <input type="text" class="field-input" value="${
              user.sex || ""
            }" readonly>
          </div>
          <div class="field-group quarter-width">
            <label class="field-label">مكان الميلاد</label>
            <input type="text" class="field-input" value="${
              user.birth_place || ""
            }" readonly>
          </div>
          <div class="field-group quarter-width">
            <label class="field-label">تاريخ الميلاد</label>
            <input type="text" class="field-input" value="${formatDate(
              user.birth_date
            )}" readonly>
          </div>
          <div class="field-group quarter-width">
            <label class="field-label">رقم الهوية</label>
            <input type="text" class="field-input" value="${
              user.id_no || ""
            }" readonly>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group quarter-width">
            <label class="field-label">الحالة الاجتماعية</label>
            <input type="text" class="field-input" value="${
              user.marital_status || ""
            }" readonly>
          </div>
          <div class="field-group quarter-width">
            <label class="field-label">نوع الهوية</label>
            <input type="text" class="field-input" value="${
              user.id_type || ""
            }" readonly>
          </div>
          <div class="field-group quarter-width">
            <label class="field-label">عدد الأولاد</label>
            <input type="text" class="field-input" value="${
              user.children_no || "0"
            }" readonly>
          </div>
          <div class="field-group quarter-width">
            <label class="field-label">الجنسية</label>
            <input type="text" class="field-input" value="${
              user.nationality || ""
            }" readonly>
          </div>
        </div>
      </div>
    </div>

    <!-- معلومات التواصل -->
    <div class="form-section">
      <div class="section-header">معلومات التواصل</div>
      <div class="section-content">
        <div class="field-row">
          <div class="field-group full-width">
            <label class="field-label">عنوان السكن</label>
            <input type="text" class="field-input" value="${
              user.address || ""
            }" readonly>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group half-width">
            <label class="field-label">الهاتف المحمول</label>
            <input type="text" class="field-input" value="${
              userContacts.find((c) => c.contact_type === "جوال")
                ?.contact_value || ""
            }" readonly>
          </div>
          <div class="field-group half-width">
            <label class="field-label">هاتف المنزل</label>
            <input type="text" class="field-input" value="${
              userContacts.find((c) => c.contact_type === "منزل")
                ?.contact_value || ""
            }" readonly>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group full-width">
            <label class="field-label">البريد الإلكتروني</label>
            <input type="email" class="field-input" value="${
              user.email || ""
            }" readonly>
          </div>
        </div>
      </div>
    </div>

    <!-- البيانات الوظيفية -->
    <div class="form-section">
      <div class="section-header">البيانات الوظيفية</div>
      <div class="section-content">
        <div class="field-row">
          <div class="field-group half-width">
            <label class="field-label">الوظيفة</label>
            <input type="text" class="field-input" value="${
              user.job || ""
            }" readonly>
          </div>
          <div class="field-group half-width">
            <label class="field-label">الإدارة</label>
            <input type="text" class="field-input" value="${
              user.category || ""
            }" readonly>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group half-width">
            <label class="field-label">الدرجة</label>
            <input type="text" class="field-input" value="${
              user.level || ""
            }" readonly>
          </div>
          <div class="field-group half-width">
            <label class="field-label">حالة التوظيف</label>
            <input type="text" class="field-input" value="${
              user.status || ""
            }" readonly>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group half-width">
            <label class="field-label">الإعانة</label>
            <input type="text" class="field-input" value="${
              user.salary || "0"
            } ريال" readonly>
          </div>
          <div class="field-group half-width">
            <label class="field-label">تاريخ التوظيف</label>
            <input type="text" class="field-input" value="${formatDate(
              user.assignment_date
            )}" readonly>
          </div>
        </div>
      </div>
    </div>

    <!-- البدلات -->
    <div class="form-section">
      <div class="section-header">البدلات</div>
      <div class="section-content">
        <div class="field-row">
          <div class="field-group half-width">
            <label class="field-label">بدل مواصلات</label>
            <input type="text" class="field-input" value="${
              userAllowances.find((a) => a.allowance_type === "مواصلات")
                ?.amount || "0"
            } ريال" readonly>
          </div>
          <div class="field-group half-width">
            <label class="field-label">بدل إيجار</label>
            <input type="text" class="field-input" value="${
              userAllowances.find((a) => a.allowance_type === "إيجار")
                ?.amount || "0"
            } ريال" readonly>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group full-width">
            <label class="field-label">بدل اتصالات</label>
            <input type="text" class="field-input" value="${
              userAllowances.find((a) => a.allowance_type === "اتصالات")
                ?.amount || "0"
            } ريال" readonly>
          </div>
        </div>
      </div>
    </div>

    <!-- الاستقطاعات -->
    <div class="form-section">
      <div class="section-header">الاستقطاعات</div>
      <div class="section-content">
        <div class="field-row">
          <div class="field-group half-width">
            <label class="field-label">تكافل</label>
            <input type="text" class="field-input" value="${
              user.symbiosis || "0"
            } ريال" readonly>
          </div>
          <div class="field-group half-width">
            <label class="field-label">تبرعات</label>
            <input type="text" class="field-input" value="${
              userDeductions.find((d) => d.deduction_type === "تبرعات")
                ?.amount || "0"
            } ريال" readonly>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group full-width">
            <label class="field-label">كفالة أيتام</label>
            <input type="text" class="field-input" value="${
              userDeductions.find((d) => d.deduction_type === "كفالة أيتام")
                ?.amount || "0"
            } ريال" readonly>
          </div>
        </div>
      </div>
    </div>

    <!-- بيانات النظام -->
    <div class="form-section">
      <div class="section-header">بيانات النظام</div>
      <div class="section-content">
        <div class="field-row">
          <div class="field-group half-width">
            <label class="field-label">الرقم الوظيفي</label>
            <input type="text" class="field-input" value="${
              user.user_id || ""
            }" readonly>
          </div>
          <div class="field-group half-width">
            <label class="field-label">اسم المستخدم</label>
            <input type="text" class="field-input" value="${
              user.user_name || ""
            }" readonly>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group full-width">
            <label class="field-label">كلمة المرور</label>
            <input type="text" className="field-input" value={record.password} readOnly />
          </div>
        </div>
      </div>
    </div>

    <!-- المؤهلات العلمية -->
    ${
      userQualifications.length > 0
        ? `
    <div class="form-section">
      <div class="section-header">المؤهلات العلمية</div>
      <div class="section-content">
        ${userQualifications
          .map(
            (qual, index) => `
            <div class="field-row">
              <div class="field-group half-width">
                <label class="field-label">المؤهل ${index + 1}</label>
                <input type="text" class="field-input" value="${
                  qual.qualification_name || ""
                }" readonly>
              </div>
              <div class="field-group half-width">
                <label class="field-label">جهة الحصول</label>
                <input type="text" class="field-input" value="${
                  qual.institution || ""
                }" readonly>
              </div>
            </div>
            <div class="field-row">
              <div class="field-group full-width">
                <label class="field-label">سنة الحصول عليه</label>
                <input type="text" class="field-input" value="${
                  qual.qual_year ? dayjs(qual.qual_year).format("YYYY") : ""
                }" readonly>
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    <!-- الخبرات السابقة -->
    ${
      userPreworks.length > 0
        ? `
    <div class="form-section">
      <div class="section-header">الخبرات السابقة</div>
      <div class="section-content">
        ${userPreworks
          .map(
            (work, index) => `
            <div class="field-row">
              <div class="field-group half-width">
                <label class="field-label">الوظيفة ${index + 1}</label>
                <input type="text" class="field-input" value="${
                  work.job_title || ""
                }" readonly>
              </div>
              <div class="field-group half-width">
                <label class="field-label">الجهة</label>
                <input type="text" class="field-input" value="${
                  work.company_name || ""
                }" readonly>
              </div>
            </div>
            <div class="field-row">
              <div class="field-group full-width">
                <label class="field-label">فترة العمل</label>
                <input type="text" class="field-input" value="${formatDate(
                  work.date_from
                )} إلى ${formatDate(work.date_to)}" readonly>
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    <!-- المرفقات -->
    ${
      userAttachments.length > 0
        ? `
    <div class="form-section">
      <div class="section-header">الملفات المرفقة</div>
      <div class="section-content">
        ${userAttachments
          .map(
            (attachment, index) => `
            <div class="field-row">
              <div class="field-group full-width">
                <label class="field-label">المرفق ${index + 1}</label>
                <input type="text" class="field-input" value="${
                  attachment.file_name || ""
                }" readonly>
              </div>
            </div>
          `
          )
          .join("")}
      </div>
    </div>
    `
        : ""
    }

    <!-- تذييل -->
    <div class="form-footer">
      <p class="footer-text">
        تم إنشاء هذه الاستمارة في
        ${new Date().toLocaleDateString("ar-SA")}
        -
        ${new Date().toLocaleTimeString("ar-SA")}
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // كتابة المحتوى في النافذة الجديدة
    printWindow.document.write(printContent);
    printWindow.document.close();

    // انتظار تحميل الصور ثم الطباعة
    setTimeout(() => {
      printWindow.focus();
    }, 1000);
  };

  function getMinutesTime(amPmString) {
    if (amPmString) {
      var d = amPmString.split(":");
      var m = parseInt(d[0]) * 60 + parseInt(d[1]);
      return m;
    } else return 0;
  }
  const openShowReport = (user) => {
    setReportLoad(true);
    setSelectedUser(user);
    getUserData(user);
  };

  const resetReport = () => {
    setUserData(null);
    setAttCount(0);
    setLeaveCount(0);
    setDiscData([]);
    setSpiderData([]);
    setVacsData([]);
    setVacsCats([]);
    setAttDates([]);
    setAttAtt([]);
    setThresholds([]);
    formDate.resetFields();
    setStart(
      new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .slice(0, 10)
    );
    setEnd(new Date().toISOString().slice(0, 10));
  };
  const getUserData = (user) => {
    setReportLoad(true);
    FirebaseServices.getSalaryInfoForPeriod(user.user_id, start, end)
      .then((data) => {
        setUserData(data);
        setAttCount(data.att_count?.[0]?.att_count || 0);
        setLeaveCount(data.leave_count?.[0]?.leave_count || 0);
        setDiscData([
          parseInt(data.lists?.[0]?.["debt"] || 0),
          parseInt(data.lists?.[0]?.["long_debt"] || 0),
          parseInt(data.lists?.[0]?.["lateTimePrice"] || 0),
          parseInt(
            Math.round(
              ((data.count?.[0]?.count || 0) -
                (data.lists?.[0]?.["attendanceDays"] || 0)) *
                ((data.lists?.[0]?.salary || 0) / 30)
            )
          ),
          parseInt(data.lists?.[0]?.["vdiscount"] || 0),
          (data.lists?.[0]?.salary || 0) -
            (Math.round(data.lists?.[0]?.debt || 0) +
              Math.round(
                ((data.count?.[0]?.count || 0) -
                  (data.lists?.[0]?.attendanceDays || 0)) *
                  ((data.lists?.[0]?.salary || 0) / 30) +
                  parseFloat(data.lists?.[0]?.lateTimePrice || 0)
              ) +
              Math.round(data.lists?.[0]?.symbiosis || 0) +
              Math.round(data.lists?.[0]?.long_debt || 0)),
        ]);
        setSpiderData([
          Math.round(
            ((data.att_count?.[0]?.att_count || 0) /
              (data.att_count?.[0]?.count || 1)) *
              100
          ) || 0,
          Math.round(
            ((data.id_count?.[0]?.id_count || 0) /
              (data.id_count?.[0]?.count || 1)) *
              100
          ) || 0,
          Math.round(
            ((data.leave_count?.[0]?.leave_count || 0) /
              (data.leave_count?.[0]?.count || 1)) *
              100
          ) || 0,
          Math.round(
            ((data.lists?.[0]?.attendanceDays || 0) /
              (data.count?.[0]?.count || 1)) *
              100
          ) || 0,
          Math.round(
            ((data.vac_count?.[0]?.late_vacs || 0) /
              (data.vac_count?.[0]?.count || 1)) *
              100
          ) || 0,
        ]);
        var vdata = [];
        var vcats = [];
        data.vacstypes.forEach((item) => {
          var vacs_search = data.vacs.filter(function (e) {
            return e.id == item.id;
          });
          if (vacs_search.length > 0) {
            var vac_count = vacs_search[0]?.cumHours;
            vdata.push(getMinutesTime(vac_count));
          } else {
            var vac_count = 0;
            vdata.push(0);
          }

          vcats.push([item.name, vac_count]);
        });
        setVacsData(vdata);
        setVacsCats(vcats);

        var dates = [];
        var atts = [];
        var thr = [];

        data.logs.map(function (item) {
          dates.push(item.date);
          if (item.workHours == 0 && item.discount == 0) {
            thr.push(0);
            atts.push(0);
          } else {
            thr.push(getMinutesTime(item.duartion));
            atts.push(getMinutesTime(item.workHours));
          }
        });
        setAttDates(dates);
        setAttAtt(atts);
        setThresholds(thr);
        setReportLoad(false);
      })
      .catch(function (error) {
        console.log(error);
        setReportLoad(false);
      });
  };
  const changeRange = (all, date) => {
    setStart(date[0]);
    setEnd(date[1]);
    getUserData(selectedUser);
  };

  const deleteUser = () => {
    setModalLoad(true);
    FirebaseServices.deleteUser(duser.id)
      .then((response) => {
        setModalLoad(false);
        notification.success({
          message: "تمت العملية بنجاح",
          placement: "bottomLeft",
          duration: 10,
        });
        setUpdate(update + 1);
        setIsDVisibleModal(false);
      })
      .catch(function (error) {
        setModalLoad(false);
        notification.error({
          message: "فشلت العملية ",
          placement: "bottomLeft",
          duration: 10,
        });
        console.log(error);
      });
  };

  const showUsersDebt = () => {
    setLoadUsers(true);
    FirebaseServices.getUsersFactorData()
      .then((data) => {
        setLoadUsers(false);
        var users = data;
        const roundValue = ifactorForm.getFieldValue("round"); 
        const finalData = users.map((item) => {
          const field = ifactorForm.getFieldValue("field");
          const factorOperator = ifactorForm.getFieldValue("factor");
          const old_value = parseFloat(item[field]);

          let new_value;
          const factorValue = parseFloat(ifactorForm.getFieldValue("amount"));
          switch (factorOperator) {
            case "sum":
              new_value = old_value + factorValue;
              break;
            case "sub":
              new_value = old_value - factorValue;
              break;
            case "multi":
              new_value = old_value * factorValue;
              break;
            case "div":
              new_value = old_value / factorValue;
              break;
            default:
              new_value = old_value;
          }

          if (roundValue !== undefined) {
             new_value = Math.round(new_value / roundValue) * roundValue;
          }
          return { ...item, field, old_value, amount: new_value };
        });
        factorForm.setFieldsValue({ users: finalData });
      })
      .catch(function (error) {
        console.log(error);
        setLoadUsers(false);
      });
  };

  return (
    <Layout>
      <Button
        className="addBtn"
        onClick={function () {
          userform.resetFields();
          setUserFormDisable(false);
          setIsVisibleModal(true);
        }}
        style={{
          zIndex: "1000",
          position: "fixed",
          bottom: "20px",
          width: "55px",
          height: "55px",
          left: "20px",
        }}
        shape="circle"
        icon={<PlusOutlined />}
        type="primary"
      ></Button>
      <Modal
        id="emp-report"
        title={
          <div style={{ backgroundColor: "#fff" }}>
            <Text>تقرير الموظف</Text>
            <div style={{ float: "left", marginLeft: "100px" }}>
              <RangePicker
                needConfirm={true}
                inputReadOnly={window.innerWidth <= 760}
                value={[dayjs(start), dayjs(end)]}
                onChange={changeRange}
              />
              <Button
                style={{ backgroundColor: "#0972B6", borderColor: "#0972B6" }}
                onClick={function () {
                  printReport();
                }}
                type="primary"
              >
                <PrinterOutlined />
              </Button>
            </div>
          </div>
        }
        footer={[]}
        className="emp-report-modal"
        width={1400}
        open={isRVisibleModal}
        onOk={async function () {
          try {
            setModalLoad(true);
            await userform.validateFields();
            onFinish();
          } catch (err) {
            setModalLoad(false);
            // الحقول غير مكتملة، سيقوم Ant Design تلقائياً بإظهار التأشير الأحمر
          }
        }}
        onCancel={function () {
          resetReport();
          setSelectedUser(null);
          setIsRVisibleModal(false);
        }}
      >
        <Spin spinning={reportLoad}>
          <Row>
            <Col
              xs={24}
              sm={24}
              md={5}
              lg={5}
              xl={5}
              span={5}
              style={{ justifyContent: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Avatar
                  size={{ xs: 60, sm: 60, md: 80, lg: 100, xl: 100, xxl: 100 }}
                  src={Env.HOST_SERVER_STORAGE + selectedUser?.avatar}
                  style={{
                    display: "block",
                    margin: "10px",
                    alignSelf: "center",
                  }}
                />
                <Rate
                  style={{ textAlign: "center", marginBottom: "5px" }}
                  disabled
                  allowHalf
                  value={
                    starList?.filter(function (e) {
                      return e.user_id == selectedUser?.user_id;
                    })[0]?.star
                  }
                />
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: "112px",
                    marginBottom: "5px",
                  }}
                >
                  {selectedUser?.user_name}{" "}
                  <Badge
                    count={selectedUser?.user_id}
                    overflowCount={99999}
                    style={{ backgroundColor: "#DDDDDD", color: "#000" }}
                  />
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: "112px",
                    marginBottom: "5px",
                  }}
                >
                  {selectedUser?.category}{" "}
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: "112px",
                    marginBottom: "5px",
                  }}
                >
                  {selectedUser?.job}{" "}
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: "112px",
                    marginBottom: "5px",
                  }}
                >
                  {new Intl.NumberFormat("en-EN").format(selectedUser?.salary)}{" "}
                </Text>
              </div>
              <div>
                <ReactApexChart
                  options={sconfig.options}
                  series={sconfig.series}
                  type="radar"
                  height="270"
                  width="320"
                />
              </div>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={19}
              lg={19}
              xl={19}
              span={19}
              style={{ padding: "20px", backgroundColor: "#F0F2F5" }}
            >
              <section className="dawam-section">
                <div>
                  <div
                    className="card"
                    style={{
                      padding: "10px 20px",
                      width: "190px",
                      borderRadius: "10px",
                      color: "#fff",
                      background: "linear-gradient(90deg,#ffbf96,#fe7096)",
                    }}
                  >
                    <div>
                      <div style={{ marginBottom: "10px" }}>أيام الدوام</div>
                      <div style={{ fontSize: "12px", marginTop: "10px" }}>
                        {userData?.lists[0]?.attendanceDays} من{" "}
                        {userData?.count[0]?.count}
                      </div>
                    </div>
                    <div>
                      <Progress
                        trailColor={"transparent"}
                        strokeColor={"#fff"}
                        width={50}
                        type="circle"
                        percent={Math.round(
                          (userData?.lists[0].attendanceDays /
                            userData?.count[0].count) *
                            100
                        )}
                      />
                    </div>
                  </div>
                  <div
                    className="card"
                    style={{
                      padding: "10px 20px",
                      width: "190px",
                      borderRadius: "10px",
                      background: "linear-gradient(90deg,#90caf9,#047edf 99%)",
                    }}
                  >
                    <div>
                      <div style={{ marginBottom: "10px" }}>انضباط الحضور</div>
                      <div style={{ fontSize: "12px", marginTop: "10px" }}>
                        {attCount} من {userData?.att_count[0].count}
                      </div>
                    </div>
                    <div>
                      <Progress
                        trailColor={"transparent"}
                        strokeColor={"#fff"}
                        width={50}
                        type="circle"
                        percent={Math.round(
                          (attCount / userData?.att_count[0].count) * 100
                        )}
                      />
                    </div>
                  </div>
                  <div
                    className="card"
                    style={{
                      padding: "10px 20px",
                      width: "190px",
                      borderRadius: "10px",
                      background: "linear-gradient(90deg,#84d9d2,#07cdae)",
                    }}
                  >
                    <div>
                      <div style={{ marginBottom: "10px" }}>
                        انضباط الانصراف
                      </div>
                      <div style={{ fontSize: "12px", marginTop: "10px" }}>
                        {leaveCount} من {userData?.leave_count[0].count}
                      </div>
                    </div>
                    <div>
                      <Progress
                        trailColor={"transparent"}
                        strokeColor={"#fff"}
                        width={50}
                        type="circle"
                        percent={Math.round(
                          (leaveCount / userData?.leave_count[0].count) * 100
                        )}
                      />
                    </div>
                  </div>
                  <div
                    className="card"
                    style={{
                      padding: "10px 20px",
                      width: "190px",
                      borderRadius: "10px",
                      background: "linear-gradient(90deg,#E2B0FF,#9F44D3)",
                    }}
                  >
                    <div>
                      <div style={{ marginBottom: "10px" }}>التأخرات</div>
                      <div style={{ fontSize: "12px", marginTop: "10px" }}>
                        {parseInt(userData?.lists[0].lateTime / 60) +
                          ":" +
                          (parseInt(userData?.lists[0].lateTime) % 60)}
                      </div>
                    </div>
                    <div>
                      <ClockCircleOutlined
                        style={{ fontSize: "30px", color: "#fff" }}
                      />
                    </div>
                  </div>
                  <div
                    className="card"
                    style={{
                      padding: "10px 20px",
                      width: "190px",
                      borderRadius: "10px",
                      background: "linear-gradient(to left,  #603813, #b29f94)",
                    }}
                  >
                    <div>
                      <div style={{ marginBottom: "10px" }}>الوقت الفائض</div>
                      <div style={{ fontSize: "12px", marginTop: "10px" }}>
                        {parseInt(userData?.lists[0].bonusTime / 60) +
                          ":" +
                          (parseInt(userData?.lists[0].bonusTime) % 60)}
                      </div>
                    </div>
                    <div>
                      <ClockCircleOutlined
                        style={{ fontSize: "30px", color: "#fff" }}
                      />
                    </div>
                  </div>
                </div>
              </section>
              <Row style={{ marginTop: "10px" }}>
                <Col
                  xs={24}
                  sm={24}
                  md={18}
                  lg={18}
                  xl={18}
                  span={18}
                  style={{ flexGrow: 1, paddingLeft: "10px" }}
                >
                  <div className="dawam-section stat">
                    <div>
                      <ReactApexChart
                        options={options}
                        series={options.series}
                        type="donut"
                        height="350"
                        width="350"
                      />
                    </div>
                    <div>
                      <ReactApexChart
                        options={voptions}
                        series={voptions.series}
                        type="bar"
                        height="200"
                        width="350"
                      />
                    </div>
                    <div></div>
                  </div>
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={6}
                  lg={6}
                  xl={6}
                  span={6}
                  style={{ flexGrow: 1 }}
                >
                  <div
                    style={{ padding: "5px", height: "100%" }}
                    className="dawam-section vio"
                  >
                    <h3>المخالفات</h3>
                    <div style={{ marginTop: "10px" }}>
                      <table className="vio-table" style={{ width: "100%" }}>
                        {userData?.violations?.map((item) => {
                          return (
                            <tr>
                              <td>{item.vio_name}</td>
                              <td>
                                <Badge
                                  showZero
                                  style={{ backgroundColor: "#FF4560" }}
                                  count={item.vio_count}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </table>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col
                  xs={24}
                  sm={24}
                  md={24}
                  lg={24}
                  xl={24}
                  span={24}
                  style={{ marginTop: "10px", backgroundColor: "#F0F2F5" }}
                >
                  <div className="dawam-section">
                    <ReactApexChart
                      options={config2.options}
                      series={config2.series}
                      type="area"
                      height="250"
                      style={{ padding: 0 }}
                    />
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Spin>
      </Modal>
      <EmployeeModal
        isVisibleModal={isVisibleModal}
        onCancel={function () {
          setSelectedUser(null);
          userform.resetFields();
          setIsVisibleModal(false);
        }}
        onFinish={function () {
          setModalLoad(true);
          onFinish();
        }}
        modalLoad={modalLoad}
        userFormDisable={userFormDisable}
        selectedUser={selectedUser}
        user={null}
        userform={userform}
        types={types}
        categories={categories}
        durations={durations}
        attachments={attachments}
        UploadProps={UploadProps}
        callback={callback}
      />
      <Modal
        centered
        className="att-modal"
        width={1200}
        title={" سجل حضور | " + selectedUserName}
        open={isAVisibleModal}
        onOk={function () {}}
        onCancel={function () {
          setIsAVisibleModal(false);
          setSelectedUser(null);
        }}
      >
        <AttendanceTable
          setting={props.setting}
          user={selectedUser}
          key={isAVisibleModal}
        ></AttendanceTable>
      </Modal>
      <Modal
        centered
        className="task-modal"
        width={1200}
        title={"سجل إجازات | " + selectedUserName}
        open={isTVisibleModal}
        onOk={function () {}}
        onCancel={function () {
          setIsTVisibleModal(false);
          setSelectedUser(null);
        }}
      >
        <TasksTable
          setting={props.setting}
          user={selectedUser}
          key={isTVisibleModal}
        ></TasksTable>
      </Modal>
      <Modal
        centered
        className="att-modal"
        width={1200}
        title={" سجل إضافي | " + selectedUserName}
        open={isBVisibleModal}
        onOk={function () {}}
        onCancel={function () {
          setIsBVisibleModal(false);
          setSelectedUser(null);
        }}
      >
        <BonusTable
          setting={props.setting}
          user={selectedUser}
          key={isBVisibleModal}
        ></BonusTable>
      </Modal>
      <Modal
        centered
        confirmLoading={modalLoad}
        title="حذف موظف"
        open={isDVisibleModal}
        onOk={deleteUser}
        onCancel={() => {
          setIsDVisibleModal(false);
        }}
      >
        <p>هل متأكد من حذف الموظف {duser.name} ؟</p>
      </Modal>

      <Modal
        centered
        confirmLoading={saving}
        title="إضافة معامل"
        open={isFactorModalVisible}
        width={1300}
        onCancel={() => {
          setIsFactorModalVisible(false);
          factorForm.resetFields();
          ifactorForm.resetFields();
        }}
        onOk={onFactorFinish}
      >
        <Form
          form={ifactorForm}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Form.Item
            style={{ marginLeft: "20px" }}
            name="field"
            label="الحقل"
            rules={[{ required: true, message: "Missing area" }]}
          >
            <Select
              style={{ width: 200 }}
              showSearch
              optionFilterProp="children"
              notFoundContent={<Spin style={{ textAlign: "center" }}></Spin>}
              filterOption={(input, option) =>
                option.props.children?.indexOf(input) >= 0 ||
                option.props.value?.indexOf(input) >= 0 ||
                option.props.label?.indexOf(input) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.props?.children?.localeCompare(optionB.props.children)
              }
            >
              <Option key={"salary"} value={"salary"}>
                {" "}
                الإعانة الشهرية{" "}
              </Option>
              <Option key={"symbiosis"} value={"symbiosis"}>
                التكافل{" "}
              </Option>
            </Select>
          </Form.Item>
          <Form.Item
            style={{ marginLeft: "20px" }}
            name="factor"
            label="المعامل الرياضي"
          >
            <Select
              style={{ width: 100 }}
              showSearch
              optionFilterProp="children"
              notFoundContent={<Spin style={{ textAlign: "center" }}></Spin>}
              filterOption={(input, option) =>
                option.props.children?.indexOf(input) >= 0 ||
                option.props.value?.indexOf(input) >= 0 ||
                option.props.label?.indexOf(input) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.props?.children?.localeCompare(optionB.props.children)
              }
            >
              <Option key={"sum"} value={"sum"}>
                {" "}
                جمع{" "}
              </Option>
              <Option key={"sub"} value={"sub"}>
                {" "}
                طرح{" "}
              </Option>
              <Option key={"multi"} value={"multi"}>
                {" "}
                ضرب{" "}
              </Option>
              <Option key={"div"} value={"div"}>
                {" "}
                قسمة{" "}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            style={{ width: 200, marginLeft: "20px" }}
            name="amount"
            label={"القيمة"}
          >
            <InputNumber placeholder="القيمة" />
          </Form.Item>

          <Form.Item
            style={{ width: 150, marginLeft: "20px" }}
            name="round"
            label="التدوير لأقرب"
          >
            <InputNumber placeholder="التدوير لأقرب" />
          </Form.Item>
          <Button
            loading={loadUsers}
            onClick={function () {
              showUsersDebt();
            }}
            style={{ marginRight: "20px", marginBottom: "24px" }}
            type="primary"
          >
            جلب الموظفين
          </Button>
        </Form>

        <Divider />

        <Form form={factorForm}>
          <Form.List name="users">
            {(fields, { add, remove }) => {
              return (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        name="user_id"
                        hidden={true}
                        style={{ display: "none" }}
                      >
                        <Input />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        disabled
                        label={"اسم الموظف"}
                      >
                        <Input disabled />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "field"]}
                        label={"الحقل"}
                        disabled
                      >
                        <Select
                          style={{ width: 200 }}
                          showSearch
                          optionFilterProp="children"
                          notFoundContent={
                            <Spin style={{ textAlign: "center" }}></Spin>
                          }
                          filterOption={(input, option) =>
                            option.props.children?.indexOf(input) >= 0 ||
                            option.props.value?.indexOf(input) >= 0 ||
                            option.props.label?.indexOf(input) >= 0
                          }
                          filterSort={(optionA, optionB) =>
                            optionA.props?.children?.localeCompare(
                              optionB.props.children
                            )
                          }
                        >
                          <Option key={"salary"} value={"salary"}>
                            {" "}
                            الإعانة الشهرية{" "}
                          </Option>
                          <Option key={"symbiosis"} value={"symbiosis"}>
                            التكافل{" "}
                          </Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "old_value"]}
                        label={"القيمة القديمة"}
                        disabled
                      >
                        <Input disabled />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "amount"]}
                        label={"القيمة الجديدة"}
                        rules={[{ required: true, message: "هذا الحقل مطلوب" }]}
                      >
                        <InputNumber placeholder="القيمة الجديدة" />
                      </Form.Item>
                    </Space>
                  ))}
                </>
              );
            }}
          </Form.List>
        </Form>
      </Modal>

      <Row style={{ margin: "15px 10px" }}>
        <Col span={24}>
          <Card
            bodyStyle={{ padding: "10px" }}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "10px",
              flexWrap: "nowrap",
              minHeight: "40px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Input
                placeholder="البحث في الموظفين..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                style={{
                  width: 200,
                  direction: "rtl",
                }}
                allowClear
              />

              <Button
                style={{
                  border: "none",
                  backgroundColor: "#FAA61A",
                  color: "#fff",
                }}
                onClick={function () {
                  setIsFactorModalVisible(true);
                }}
              >
                <FormOutlined />
              </Button>

              <Button
                style={{
                  backgroundColor: "#0972B6",
                  borderColor: "#0972B6",
                }}
                onClick={function () {
                  printReport();
                }}
                type="primary"
              >
                <PrinterOutlined />
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Row
        gutter={[
          { xs: 2, sm: 16, md: 24, lg: 32 },
          { xs: 2, sm: 16, md: 24, lg: 32 },
        ]}
        style={{ padding: "0 20px" }}
      >
        {listData}
        {filteredData.map((user) => {
          return (
            <Col
              className="card-col"
              xs={24}
              sm={12}
              md={12}
              lg={8}
              xl={6}
              style={{ padding: "0px 10px" }}
              span={6}
            >
              <Card
                className="content"
                style={{
                  alignItems: "center",
                  borderBottomLeftRadius: "0px",
                  borderBottomRightRadius: "0px",
                  borderBottom: "none",
                }}
              >
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key="1"
                        onClick={function () {
                          setSelectedUserName(user.name);
                          openAttModal(user);
                        }}
                      >
                        سجل الحضور
                      </Menu.Item>
                      <Menu.Item
                        key="2"
                        onClick={function () {
                          setSelectedUserName(user.name);
                          openTaskModal(user);
                        }}
                      >
                        سجل الإجازات
                      </Menu.Item>

                      <Menu.Item
                        key="7"
                        onClick={function () {
                          setSelectedUserName(user.name);
                          openBonusModal(user);
                        }}
                      >
                        الدوام الإضافي
                      </Menu.Item>

                      <Menu.Divider />
                      <Menu.Item
                        key="3"
                        onClick={function () {
                          userform.resetFields();
                          setUserFormDisable(true);
                          openShowUser(user);
                        }}
                      >
                        عرض البيانات
                      </Menu.Item>
                      <Menu.Item
                        key="4"
                        onClick={function () {
                          userform.resetFields();
                          setUserFormDisable(false);
                          openShowUser(user);
                        }}
                      >
                        تعديل البيانات
                      </Menu.Item>
                      <Menu.Item
                        key="5"
                        onClick={function () {
                          printEmployeeData(user);
                        }}
                      >
                        طباعة
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        key="6"
                        onClick={function () {
                          setIsRVisibleModal(true);
                          openShowReport(user);
                        }}
                      >
                        التقرير التفصيلي
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        key="8"
                        onClick={function () {
                          setIsDVisibleModal(true);
                          setDUser(user);
                        }}
                      >
                        حذف
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <a
                    style={{ float: "left", fontSize: "20px" }}
                    className="ant-dropdown-link"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreOutlined key="ellipsis" />
                  </a>
                </Dropdown>
                <div
                  onClick={function () {
                    userform.resetFields();
                    setUserFormDisable(true);
                    openShowUser(user);
                  }}
                  className="card-content"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <Avatar
                    size={{
                      xs: 60,
                      sm: 60,
                      md: 80,
                      lg: 100,
                      xl: 100,
                      xxl: 100,
                    }}
                    src={Env.HOST_SERVER_STORAGE + user.avatar}
                    style={{
                      display: "block",
                      margin: "10px",
                      alignSelf: "center",
                    }}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: "18px",
                      marginBottom: "5px",
                    }}
                  >
                    {user.user_name}{" "}
                  </Text>
                  <div style={{ textAlign: "center" }}>
                    <Badge
                      count={user.user_id}
                      overflowCount={99999}
                      style={{ backgroundColor: "#DDDDDD", color: "#000" }}
                    />
                  </div>
                  <Rate
                    style={{ textAlign: "center", marginBottom: "5px" }}
                    disabled
                    allowHalf
                    value={
                      starList?.filter(function (e) {
                        return e.user_id == user.user_id;
                      })[0]?.star
                    }
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: "13px",
                      color:
                        user.leave_time == null && user.attendance_time == null
                          ? "#7E7D7C"
                          : "#000",
                    }}
                  >
                    {user.status != 16
                      ? types.filter(function (e) {
                          return e.parent == 5 && e.value == user.status;
                        })[0].label
                      : user.fingerprint_type == 22
                      ? user.leave_time == null && user.attendance_time != null
                        ? " متواجد الآن"
                        : "غير متواجد " + timeSince(user.last_occ)
                      : "معفي من البصمة"}

                    <Badge
                      style={{ marginRight: "5px" }}
                      status={
                        user.fingerprint_type == 22
                          ? user.leave_time == null &&
                            user.attendance_time != null
                            ? "success"
                            : "default"
                          : "blue"
                      }
                    />
                  </Text>
                </div>
              </Card>
              <Card
                className="footer"
                style={{
                  borderTopLeftRadius: "0px",
                  borderTopRightRadius: "0px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#7E7D7C", fontSize: "12px" }}>
                    <ClusterOutlined /> {user.category}{" "}
                  </Text>
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: "12px",
                      color: "#7E7D7C",
                    }}
                  >
                    <TagsOutlined /> {user.job}{" "}
                  </Text>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
      <div id="prank-report" style={{ display: "none" }}>
        <div
          style={{
            direction: "rtl",
            fontSize: "12px",
            fontFamily:
              "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            margin: "0",
          }}
        >
          <header
            style={{
              display: "flex",
              flexDirection: "row",
              borderColor: "#000",
              borderBottomStyle: "solid",
              borderBottomWidth: "1px",
              alignItems: "center", // لضبط المحاذاة العمودية
            }}
          >
            {/* شعار الجهة اليسرى */}
            <div style={{ width: "20%" }}>
              <img
                loading="eager"
                style={{ width: "250px" }}
                src={
                  Env.HOST_SERVER_STORAGE +
                  props.setting.filter((item) => item.key == "admin.logo")[0]
                    ?.value
                }
              />
            </div>

            {/* العنوان في المنتصف */}
            <div
              style={{
                fontSize: "11px",
                textAlign: "center",
                width: "60%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingBottom: "10px",
              }}
            >
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  margin: "0",
                }}
              >
                كشف بأسماء الموظفين
              </h1>
            </div>

            {/* صورة الشخص في الجهة اليمنى */}
            <div style={{ width: "20%", textAlign: "right" }}>
              <img
                loading="eager"
                style={{ width: "100px", borderRadius: "50%" }}
                src={
                  Env.HOST_SERVER_STORAGE +
                  props.setting.filter((item) => item.key == "admin.person")[0]
                    ?.value
                }
              />
            </div>
          </header>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              textAlign: "center",
              fontSize: "14px",
              borderBottom: "1px solid black",
            }}
          ></div>
          <div>
            <table
              style={{
                fontSize: "12px",
                width: " 100%",
                textAlign: " center",
                marginTop: " 20px",
              }}
            >
              <thead>
                <tr
                  style={{
                    color: "#fff",
                    backgroundColor: "#0972B6",
                    height: "30px",
                  }}
                >
                  <th style={{ fontWeight: "100" }} rowSpan="2">
                    م
                  </th>
                  <th style={{ fontWeight: "100" }}>الاسم</th>
                  <th style={{ fontWeight: "100" }}>الإدارة</th>
                  <th style={{ fontWeight: "100" }}>الوظيفة</th>
                  <th style={{ fontWeight: "100" }}>معدل الدوام</th>
                  <th style={{ fontWeight: "100" }}>انضباط الحضور</th>
                  <th style={{ fontWeight: "100" }}>انضباط الانصراف</th>
                  <th style={{ fontWeight: "100" }}>التأخرات بالساعة</th>
                  <th style={{ fontWeight: "100" }}>الوقت الفائض بالساعة</th>
                  <th style={{ fontWeight: "100" }}>إجمالي التقييم</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    style={{
                      height: " 25px",
                      backgroundColor:
                        filteredData.indexOf(item) % 2 != 0
                          ? "#e6e6e6"
                          : "#fff",
                    }}
                  >
                    <td>{filteredData.indexOf(item) + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.job}</td>
                    <td>{Math.round(item.attendance_rate * 100) + "%"}</td>
                    <td>
                      {Math.round(
                        Math.round(item.att_rate * 100) * item.attendance_rate
                      ) + "%"}
                    </td>
                    <td>
                      {Math.round(
                        Math.round(item.leave_rate * 100) * item.attendance_rate
                      ) + "%"}
                    </td>
                    <td>
                      {parseInt(item.lateTimes / 60 / 60) +
                        ":" +
                        (parseInt(item.lateTimes / 60) % 60)}
                    </td>
                    <td>
                      {parseInt(item.bonusTime / 60 / 60) +
                        ":" +
                        (parseInt(item.bonusTime / 60) % 60)}
                    </td>
                    <td>
                      {totalRatePercent(item) + "%"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ width: "50%", fontWeight: "900" }}>المختص</div>
            <div style={{ width: "50%", fontWeight: "900" }}>مدير الشؤون</div>
          </div>
          <div
            style={{
              marginTop: " 20px",
              width: "85%",
              backgroundColor: "#e6e6e61",
              padding: "5px 0",
              borderTopLeftRadius: " 5px",
              borderBottomLeftRadius: " 5px",
            }}
          >
            <div
              style={{
                backgroundColor: " #0972B6",
                width: " 95%",
                height: " 15px",
                borderTopLeftRadius: " 5px",
                borderBottomLeftRadius: " 5px",
                color: " #fff",
                paddingRight: " 20px",
              }}
            >
              نظام دوام | {new Date().toLocaleString("en-IT")}{" "}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
