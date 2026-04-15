/* eslint-disable react-hooks/rules-of-hooks */
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

import excel from "xlsx";
import "./style.css";

import {
  ExportOutlined,
  FormOutlined,
  PrinterOutlined,
  SwapOutlined,
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
  Select,
  Spin,
  Table,
  Tabs,
  Typography,
} from "antd";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
// import axios from "axios";
import { useCookies } from "react-cookie";
import { Env, PrintFonts } from "./../../../styles";
const { Content } = Layout;
const { Text, Space } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const exportToExcel = (type, fn, dl) => {
  var elt = document.getElementsByTagName("table")[0];
  if (elt) {
    var wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl
      ? excel.write(wb, { bookType: type, bookSST: true, type: "base64" })
      : excel.writeFile(wb, fn || "سجل الحضور." + (type || "xlsx"));
  }
};
export default function bonusTable(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["userId"]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVModalVisible, setIsVModalVisible] = useState(false);
  const [datefromValue, setDatefromValue] = useState(null);
  const [datetoValue, setDatetoValue] = useState(null);

  const [data, setData] = useState([]);
  const [load, setLoad] = useState(true);
  const [selected, setSelected] = useState([]);
  const [totalDays, setTotalDays] = useState(0);
  const [totalAtt, settotalAtt] = useState(0);
  const [totalLate, setTotalLate] = useState(0);
  const [totalLatePrice, setTotalLatePrice] = useState(0);
  const [salary, setSalary] = useState(0);
  const [start, setStart] = useState(
    dayjs(
      dayjs().format("YYYY-MM") +
      "-" +
      props.setting.filter((item) => item.key == "admin.month_start")[0]
        ?.value,
      "YYYY-MM-DD"
    )
      .subtract(1, "months")
      .format("YYYY-MM-DD")
  );
  const [end, setEnd] = useState(dayjs().format("YYYY-MM-DD"));
  const [notes, setNotes] = useState("");

  const [dsalary, setDsalary] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [totalLoan, setTotalLoan] = useState(0);
  const [vacations, setVacations] = useState([]);
  const [vacationsTypes, setVacationsTypes] = useState([]);
  const [vacationsAmount, setVacationsAmount] = useState([]);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState(null);
  const [totalVac, setTotalVac] = useState("");
  const [star, setStar] = useState(0);

  const [givenTasks, setGivenTasks] = useState(null);
  const [restTasks, setRestTasks] = useState(null);
  const [givenLoad, setGivenLoad] = useState(true);
  const [tstypes, setTstypes] = useState([]);

  const [totalVacs, setTotalVacs] = useState([]);
  const [pdata, setPData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM"));
  const [detailedDay, setDetailedDay] = useState("");
  const [form] = Form.useForm();

  const id = cookies.user;
  var allWorkHours = 0;
  var allLateTimes = 0;
  var allVacHours = 0;
  var allBonusTimes = 0;
  var allDiscounts = 0.0;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // حماية من التواريخ غير الصالحة قبل أي طلب
    if (!start || !end || start === "Invalid Date" || end === "Invalid Date") {
      return;
    }
    FirebaseServices.getBonusLog(props.user.user_id, start, end)
      .then(async (data) => {
        setData(data);
        // جلب تفاصيل البصمات لكل يوم
        const newData = await Promise.all(
          data.map(async (item) => {
            try {
              const resData = await FirebaseServices.getAttendanceLogsByDate(props.user.user_id, item.date);
              return {
                ...item,
                extra_attendance: resData.map((x) => ({
                  in: x.attendance_time,
                  out: x.leave_time,
                })),
              };
            } catch (e) {
              return { ...item, extra_attendance: [] };
            }
          })
        );
        // ترتيب تنازلي حسب التاريخ (الأحدث أولاً)
        newData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPData(newData);
        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
      });

    FirebaseServices.getDawamInfo(props.user.user_id, start, end)
      .then((data) => {
        setTotalDays(data.count?.[0]?.count || 0);
        settotalAtt(data.data?.[0]?.attendanceDays || 0);
        setTotalLate(data.data?.[0]?.lateTime || 0);
        setTotalLatePrice(data.data?.[0]?.lateTimePrice || 0);
        setSalary(data.data?.[0]?.salary || 0);
        setDsalary(data.data?.[0]?.dsalary || 0);
        setVacations(data.vacs);
        setVacationsTypes(data.vacstypes);
        setVacationsAmount(data.tasksAmount);
        setTotalVacs(data.totalvacs);
        setTotalDebt(data.debt?.[0]?.["amount"] || 0);
        setTotalLoan(data.long_debt?.[0]?.["amount"] || 0);
        console.log(data.data?.[0]?.lateTimePrice);
        setStar(
          1 -
          (parseFloat(data.lists?.[0]?.lateTimePrice || 0) +
            parseInt(
              ((data.count?.[0]?.count || 0) -
                (data.lists?.[0]?.["attendanceDays"] || 0)) *
              (data.lists?.[0]?.salary /
                (data.count?.[0]?.count || 1))
            )) /
          parseInt(data.lists?.[0]?.salary || 0)
        );
        setLoad(false);
      })
      .catch(function (error) {
        console.log(error);
      });
    setLoad(true);

    FirebaseServices.getTasksTypes()
      .then((data) => {
        setTstypes(data);
        //setLoadt(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [start, end, props.user]);

  // useEffect لتعيين start و end بعد التأكد من تحميل الإعدادات
  useEffect(() => {
    if (
      !props.setting ||
      !props.setting.length ||
      !props.setting.find((item) => item.key == "admin.month_start")
    ) {
      return;
    }
    const monthStart = props.setting.find(
      (item) => item.key == "admin.month_start"
    )?.value;
    const startDate = dayjs(
      dayjs().format("YYYY-MM") + "-" + monthStart,
      "YYYY-MM-DD"
    )
      .subtract(1, "months")
      .format("YYYY-MM-DD");
    setStart(startDate);
    setEnd(dayjs().format("YYYY-MM-DD"));
  }, [props.setting]);

  const disabledDate = (current) => {
    // Calculate the date two days ago
    var daysCount =
      props.setting.filter((item) => item.key == "admin.vacations_tolerance")[0]
        ?.value * 1;
    var count = isNaN(daysCount) ? 1 : daysCount;

    const twoDaysAgo = dayjs().subtract(count, "day").endOf("day");

    // Disable dates that are before two days ago
    return current && current < twoDaysAgo;
  };

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);

    if (sorter.order) {
      data.sort((a, b) => {
        return sorter.column.sorter(a, b);
      });
      setPData(sorter.order == "descend" ? data.reverse() : data);
    }

    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] != null) {
          setPData(data.filter((item) => filters[key].includes(item[key])));
        }
      });
    }
  };

  const changeRange = (all, date) => {
    setStart(date[0]);
    setEnd(date[1]);
  };

  const printReport = () => {
    var report = document.getElementById("att-report");
    var mywindow = window.open("");
    mywindow.document.write(`
          <html><head><title></title>
          <style>
            ${PrintFonts.getPrintFontsCSS()}
            
            /* تنسيق عام */
            body {
              font-size: 12px;
              margin: 0;
            }
    
            /* تنسيق الجدول */
            table {
              border-collapse: collapse;
              width: 100%;
              font-size: 12px;
            }
    
            th, td {
              border: 1px solid #000;
              padding: 6px 10px;
              text-align: center;
              vertical-align: middle;
            }
    
            th {
              font-weight: 100;
              background: #0972B6;
              color: #fff;
              height: 30px;
            }
    
            /* تظليل الصفوف */
            tbody tr:nth-child(even) {
              background: #e6e6e6;
            }
    
            tbody tr:nth-child(odd) {
              background: #fff;
            }
    
            tbody tr {
              height: 25px;
            }
    
            /* تخصيص عرض الأعمدة ومنع التفاف النص */
            th:nth-child(1), td:nth-child(1) { width: 80px; white-space: nowrap; }
            th:nth-child(2), td:nth-child(2) { width: 120px; white-space: nowrap; }
            th:nth-child(3), td:nth-child(3) { width: 110px; white-space: nowrap; }
            th:nth-child(4), td:nth-child(4) { width: 110px; white-space: nowrap; }
            th:nth-child(5), td:nth-child(5) { width: 110px; white-space: nowrap; }
            th:nth-child(6), td:nth-child(6) { width: 110px; white-space: nowrap; }
            th:nth-child(7), td:nth-child(7) { width: 120px; white-space: nowrap; }
            th:nth-child(8), td:nth-child(8) { width: 220px; }
    
            /* صف الإجمالي */
            tfoot tr,
            tr[style*='background-color: #0972B6'] {
              background: #0972B6 !important;
              color: #fff !important;
              height: 30px;
            }
    
            /* إعدادات الطباعة */
            @media print {
              @page {
                size: A4 portrait; /* ✅ الوضع الطولي */
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
              }
            }
          </style>
          </head><body dir="rtl" style="font-size:12px;" >
        `);
    mywindow.document.write(report.innerHTML);
    mywindow.document.write("</body></html>");
    mywindow.print();
    // mywindow.close(); // يمكنك تفعيله إذا أردت إغلاق النافذة بعد الطباعة
  };

  //       const printReport=()=>{
  //         var report=document.getElementById('att-report');
  //         //var report=document.body;
  //        var mywindow = window.open('');
  //         mywindow.document.write("<html><head><title></title> <style>@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500&display=swap'); body{font-family:Tajawal;font-size:12px;margin:0}  </style><style type='text/css' media='print'>@page { size: A4 landscape; print-color-adjust: exact !important;  -webkit-print-color-adjust: exact !important;}</style>");
  //         mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
  //         mywindow.document.write(report.innerHTML);
  //         mywindow.document.write('</body></html>');
  //         mywindow.print();  // change window to mywindow
  //        // mywindow.close();

  //  /*        var printContents = document.getElementById("att-report").innerHTML;
  //         var originalContents = document.body.innerHTML;

  //         document.body.innerHTML = printContents;
  //         window.print();
  //         document.body.innerHTML = originalContents;*/
  //       }

  const showModal = (record) => {
    setDetailedDay(record.date);
    FirebaseServices.getAttendanceLogsByDate(props.user.user_id, record.date)
      .then((data) => {
        setSelected(data);
      })
      .catch(function (error) {
        console.log(error);
      });

    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const openNotification = (placement, text) => {
    notification.success({
      message: text,
      placement,
      duration: 10,
    });
  };

  const showVacationModal = (record) => {
    setIsVModalVisible(true);
    setNotes("");
    setTotalVac("");
    setDatefromValue(
      record.date +
      " " +
      props.setting.filter((item) => item.key == "duration_start")[0]?.value
    );
    setDatetoValue(
      record.date +
      " " +
      props.setting.filter((item) => item.key == "duration_end")[0]?.value
    );
  };

  const handleVOk = () => {
    var values = {
      user_id: props.user.user_id,
      startDate: datefromValue,
      endDate: datetoValue,
      type: type,
      note: notes,
    };

    FirebaseServices.saveVacationTask(values, false)
      .then(function (data) {
        openNotification("bottomLeft", <Text>{"تم إرسال الإجازة بنجاح"}</Text>);
        setSaving(false);
        setIsVModalVisible(false);
        form.resetFields(["date_range", "task_type", "notes"]);
        setTotalVac("");
        setDatetoValue("");
        setDatefromValue("");
        setType(null);
        form.resetFields();
        setGivenTasks(0);
        setRestTasks(0);
      })
      .catch(function (error) {
        console.log(error);
        if (error?.response?.status == 409) {
          notification.error({
            message: error.response.data.message,
            placement: "bottomLeft",
            duration: 10,
          });
          setSaving(false);
        } else {
          notification.error({
            message: "فشل إرسال الإجازة!",
            placement: "bottomLeft",
            duration: 10,
          });
          setSaving(false);
          setIsModalVisible(false);
          setType(null);
          setNotes(null);
        }
      });
  };

  const columns = [
    {
      title: "اليوم",
      dataIndex: "dayName",
      key: "dayName",
      ellipsis: true,
      render: (dayName, record, _) => <Text>{dayName}</Text>,
    },
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      sortOrder: sortedInfo.columnKey === "date" && sortedInfo.order,
      ellipsis: true,
      render: (date, record, _) => <Text>{date}</Text>,
    },
    {
      title: "وقت الحضور",
      dataIndex: "attendance_time",
      key: "attendance_time",
      sorter: (a, b) => {
        if (
          a &&
          a.attendance_time &&
          a.attendance_time.length &&
          b &&
          b.attendance_time &&
          b.attendance_time.length
        ) {
          return a.attendance_time.length - b.attendance_time.length;
        } else if (a && a.attendance_time && a.attendance_time.length) {
          return -1;
        } else if (b && b.attendance_time && b.attendance_time.length) {
          return 1;
        }
        return 0;
      },
      sortOrder: sortedInfo.columnKey === "attendance_time" && sortedInfo.order,
      ellipsis: true,
      render: (attendance_time, record, _) => <Text>{attendance_time}</Text>,
    },
    {
      title: "وقت الانصراف",
      dataIndex: "leave_time",
      key: "leave_time",
      sorter: (a, b) => {
        if (
          a &&
          a.leave_time &&
          a.leave_time.length &&
          b &&
          b.leave_time &&
          b.leave_time.length
        ) {
          return a.leave_time.length - b.leave_time.length;
        } else if (a && a.leave_time && a.leave_time.length) {
          return -1;
        } else if (b && b.leave_time && b.leave_time.length) {
          return 1;
        }
        return 0;
      },
      sortOrder: sortedInfo.columnKey === "leave_time" && sortedInfo.order,
      ellipsis: true,
      render: (leave_time, record, _) => <Text>{leave_time}</Text>,
    },
    {
      title: "صافي الدوام",
      dataIndex: "workHours",
      key: "workHours",
      sorter: (a, b) => a.workHours?.localeCompare(b.workHours),
      sortOrder: sortedInfo.columnKey === "workHours" && sortedInfo.order,
      ellipsis: true,
      render: (workHours, record, _) => <Text>{workHours}</Text>,
    },
    {
      title: "الوقت الإضافي",
      dataIndex: "bonusTime",
      key: "bonusTime",
      sorter: (a, b) => a.bonusTime?.localeCompare(b.bonusTime),
      sortOrder: sortedInfo.columnKey === "bonusTime" && sortedInfo.order,
      ellipsis: true,
      render: (bonusTime, record, _) => <Text>{bonusTime}</Text>,
    },
    {
      title: "التفاصيل",
      key: "action",
      render: (vid, record, index) => (
        <Button
          onClick={function () {
            showModal(record);
          }}
          type="primary"
          shape="round"
          icon={<SwapOutlined />}
        ></Button>
      ),
    },
    {
      title: "تقديم",
      key: "action",
      render: (vid, record, index) => (
        <Button
          disabled={isEligibleDays(record.date)}
          onClick={function () {
            showVacationModal(record);
          }}
          type="primary"
          shape="round"
          style={{ backgroundColor: "#FAA61A", border: "none" }}
          icon={<FormOutlined />}
        ></Button>
      ),
    },
  ];
  const dcolumns = [
    {
      title: "زمن الدخول",
      dataIndex: "attendance_time",
      key: "attendance_time",
      sorter: (a, b) => a.attendance_time.length - b.attendance_time.length,
      sortOrder: sortedInfo.columnKey === "attendance_time" && sortedInfo.order,
      ellipsis: true,
      render: (attendance_time) => attendance_time?.split(" ")[1],
    },
    {
      title: "زمن الخروج",
      dataIndex: "leave_time",
      key: "leave_time",
      sorter: (a, b) => a.leave_time.length - b.leave_time.length,
      sortOrder: sortedInfo.columnKey === "leave_time" && sortedInfo.order,
      ellipsis: true,
      render: (leave_time) => leave_time?.split(" ")[1],
    },
    {
      title: "ساعات العمل",
      dataIndex: "workHour",
      key: "workHour",
      sorter: (a, b) => a.workHour.length - b.workHour.length,
      sortOrder: sortedInfo.columnKey === "workHour" && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: "الوقت الإضافي",
      dataIndex: "bonusTime",
      key: "bonusTime",
      sorter: (a, b) => a.bonusTime.length - b.bonusTime.length,
      sortOrder: sortedInfo.columnKey === "bonusTime" && sortedInfo.order,
      ellipsis: true,
    },
  ];
  String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    return hours + ":" + minutes + ":" + seconds;
  };
  const convertTimeToSeconds = (fullTime) => {
    var seconds = 0;
    if (fullTime == null || fullTime == 0) {
      seconds = 0;
    } else {
      var time = fullTime.split(":");
      seconds =
        parseInt(time[0]) * 60 * 60 +
        parseInt(time[1]) * 60 +
        parseInt(time[2]);
    }
    return seconds;
  };

  const isEligibleDays = (dateString) => {
    // Calculate the date two days ago
    var daysCount =
      props.setting.filter((item) => item.key == "admin.vacations_tolerance")[0]
        ?.value * 1;
    var count = isNaN(daysCount) ? 1 : daysCount;
    return (
      new Date() >
      new Date(
        new Date(dateString).setDate(new Date(dateString).getDate() + count)
      )
    );
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    return dayjs(dateTimeString, "YYYY-MM-DD HH:mm:ss")
      .locale("en") // يضمن عرض AM/PM
      .format("hh:mm:ss A");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleVCancel = () => {
    setIsVModalVisible(false);
    setDatefromValue("");
    setDatetoValue("");
  };

  const handleTypeChange = (e) => {
    setType(e);
    getGivenRest(e, datefromValue);
  };

  const getGivenRest = (e, start) => {
    FirebaseServices.getGivenTasks(props.user.user_id, start, end)
      .then((data) => {
        setGivenTasks(
          data.vacs.filter((record) => record.id == e)[0]?.cumHours
        );
        var min = data.tasksAmount.filter(
          (record) => record.vid == e
        )[0]?.rest;
        if (typeof min === "undefined") setRestTasks("-");
        else {
          var startMon = props.setting.filter(
            (item) => item.key == "admin.month_start"
          )[0]?.value;

          var perMonth = (30 * 7 * 60) / 12;
          var curr = parseInt(dayjs(start, "YYYY-MM-DD HH:mm").format("MM"));
          var currMonth =
            parseInt(dayjs(start, "YYYY-MM-DD HH:mm").format("DD")) >= startMon
              ? curr + 1
              : curr;
          var restMin = min - perMonth * (12 - currMonth);
          setRestTasks(
            parseInt(restMin / 60)
              .toString()
              .padStart(2, "0") +
            ":" +
            (restMin % 60).toString().padStart(2, "0")
          );
        }

        setGivenLoad(false);
      })
      .catch(function (error) {
        console.log(error);
        setGivenLoad(false);
      });
  };

  const onChange = (all, data) => {
    setCurrentMonth(all.format("MMMM"));

    var startDay = props.setting.filter(
      (item) => item.key == "admin.month_start"
    )[0]?.value;
    var endDay = props.setting.filter(
      (item) => item.key == "admin.month_end"
    )[0]?.value;

    setStart(
      dayjs(data + "-" + startDay, "YYYY-MM-DD")
        .subtract(1, "months")
        .format("YYYY-MM-DD")
    );
    setEnd(dayjs(data + "-" + endDay, "YYYY-MM-DD").format("YYYY-MM-DD"));
  };
  const checkPeriod = (all, date) => {
    if (date[1] != "") {
      const minutes = (new Date(date[1]) - new Date(date[0])) / 60000;
      var alerta = "";
      if (minutes <= 420)
        alerta =
          Math.floor(minutes / 60) + " ساعة و " + (minutes % 60) + " دقيقة ";
      else alerta = Math.floor(minutes / 1440) + 1 + " يوم ";
      setTotalVac(alerta);
    }
  };

  const onRangeChange = (all, dates) => {
    checkPeriod(all, dates);
    setDatefromValue(dates[0]);
    setDatetoValue(dates[1]);
  };

  // --- أضف دالة timeToSeconds وخوارزمية الحساب ---
  function timeToSeconds(time) {
    if (!time) return 0;
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }
  let round =
    props.setting.filter((item) => item.key == "admin.round")[0]?.value * 1 ||
    1;
  let bonusPrice =
    props.setting.filter((item) => item.key == "admin.bonus_price")[0]?.value *
    1 || 1;

  return (
    <Layout className="attendance">
      <Modal
        centered
        title="تقديم إجازة / مهمة"
        confirmLoading={saving}
        visible={isVModalVisible}
        onOk={function () {
          setSaving(true);
          handleVOk();
        }}
        onCancel={function () {
          handleVCancel();
        }}
      >
        <Form form={form}>
          <Form.Item
            className="rangee"
            name={"date_range"}
            label="فترة الإجازة / المهمة :"
          >
            <RangePicker
              needConfirm={true}
              inputReadOnly={window.innerWidth <= 760}
              disabledDate={disabledDate}
              value={[
                dayjs(datefromValue, "YYYY-MM-DD HH:mm"),
                dayjs(datetoValue, "YYYY-MM-DD HH:mm"),
              ]}
              showTime={{
                defaultValue: [
                  dayjs(
                    props.setting.filter(
                      (item) => item.key == "duration_start"
                    )[0]?.value,
                    "HH:mm"
                  ),
                  dayjs(
                    props.setting.filter(
                      (item) => item.key == "duration_end"
                    )[0]?.value,
                    "HH:mm"
                  ),
                ],
              }}
              format="YYYY-MM-DD HH:mm"
              onChange={function (all, dates) {
                onRangeChange(all, dates);
              }}
            />
            <div style={{ marginTop: "10px", fontWeight: 600 }}>
              مدة الإجازة: <Text type="danger">{totalVac}</Text>
            </div>
          </Form.Item>
          <Form.Item
            style={{ marginTop: "10px" }}
            name={"task_type"}
            label="نوع الإجازة"
          >
            <Select
              showSearch
              notFoundContent={<Spin style={{ textAlign: "center" }}></Spin>}
              style={{ width: 150 }}
              onSelect={handleTypeChange}
              options={tstypes}
              placeholder="نوع الإجازة"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children?.indexOf(input) >= 0 ||
                option.props.label?.indexOf(input) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.props?.children?.localeCompare(optionB.props.children)
              }
            ></Select>
            <div style={{ marginRight: "10px", display: "inline-block" }}>
              <div>
                الممنوحة:{" "}
                <span
                  style={{
                    fontWeight: "600",
                    color: "#f00",
                    marginLeft: "20px",
                  }}
                >
                  {givenTasks ?? 0}
                </span>{" "}
                المتبقية:{" "}
                <span style={{ fontWeight: "600", color: "#f00" }}>
                  {restTasks ?? 0}
                </span>{" "}
              </div>
            </div>
          </Form.Item>
          <Form.Item name={"notes"} label="تفاصيل ">
            <TextArea
              onChange={function (e) {
                setNotes(e.target.value);
              }}
              row={3}
            ></TextArea>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        centered
        className="att-model"
        width={1100}
        title={"أحداث اليوم | " + detailedDay}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Table
          pagination={false}
          style={{ textAlign: "center!important" }}
          scroll={{ x: "1000px" }}
          columns={dcolumns}
          dataSource={selected}
          onChange={handleChange}
        />
      </Modal>
      <Card>
        <div className="attHeader">
          <div className="attPer"></div>
          <div className="disPer"></div>
          <div className="attOper">
            <div style={{ marginLeft: "10px" }}>
              <span>اختر شهرًا : </span>
              <DatePicker
                needConfirm={false}
                inputReadOnly={window.innerWidth <= 760}
                defaultValue={dayjs()}
                onChange={onChange}
                picker="month"
              />
            </div>
            {window.innerWidth <= 760 ? (
              <></>
            ) : (
              <div className="attOperRange" style={{ marginBottom: "10px" }}>
                <span>اختر فترة : </span>
                <RangePicker
                  needConfirm={true}
                  inputReadOnly={window.innerWidth <= 760}
                  value={[dayjs(start, "YYYY-MM-DD"), dayjs(end, "YYYY-MM-DD")]}
                  style={{ width: "230px" }}
                  onChange={changeRange}
                />
              </div>
            )}
            <div className="attOperBtn" style={{ textAlign: "left" }}>
              {window.innerWidth <= 760 ? (
                <></>
              ) : (
                <Button
                  disabled={load}
                  style={{
                    margin: "0 10px",
                    textAlign: "center",
                    marginLeft: "5px",
                  }}
                  onClick={function () {
                    exportToExcel("xlsx");
                  }}
                  type="primary"
                >
                  <ExportOutlined />
                </Button>
              )}
              <Button
                disabled={load}
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
        </div>
        <Table
          loading={load}
          style={{ textAlign: "center!important" }}
          columns={columns}
          scroll={{ x: "1000px" }}
          onRow={(record, rowIndex) => {
            var bc;
            if (record.attendance_time == null || record.leave_time == null)
              bc = "#FCEF96";

            return {
              className: record.status,
              style: { backgroundColor: bc },
            };
          }}
          dataSource={data}
          onChange={handleChange}
        />
      </Card>
      <div id="att-report" style={{ display: "none" }}>
        <div
          style={{
            direction: "rtl",
            fontSize: "12px",
            fontFamily: "Tajawal, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
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
            }}
          >
            <div style={{ width: "30%" }}>
              <img
                loading="eager"
                style={{ width: "320px" }}
                src={
                  Env.HOST_SERVER_STORAGE +
                  props.setting.filter((item) => item.key == "admin.logo")[0]
                    ?.value
                }
              />
            </div>
            <div
              style={{
                fontSize: "11px",
                textAlign: "center",
                width: "35%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "end",
                paddingBottom: "10px",
              }}
            >
              <h1
                style={{ fontSize: "18px", marginBottom: "5px", margin: "0" }}
              >
                سجل الدوام الإضافي
              </h1>
              <h2 style={{ fontSize: "14px", fontWeight: "200", margin: "0" }}>
                للفترة من {start} إلى {end}
              </h2>
            </div>
            <div style={{ width: "35%" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  margin: "20px 5px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      paddingTop: "10px",
                      marginRight: "5px",
                    }}
                  >
                    <div style={{ marginBottom: "5px" }}>
                      الاسم: <span>{props.user.name}</span>
                    </div>
                    <div>
                      الوظيفة: <span>{props.user.job}</span>
                    </div>
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      paddingTop: "10px",
                      marginRight: "5px",
                    }}
                  >
                    <div style={{ marginBottom: "5px" }}>
                      الرقم الوظيفي: <span>{props.user.user_id}</span>
                    </div>
                    <div>
                      الإدارة:{" "}
                      {typeof props.user.category === "object"
                        ? props.user.category.name
                        : props.user.category}
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </header>
          <div
            class="table-info"
            style={{
              display: "flex",
              flexDirection: "row",
              textAlign: "center",
              padding: "10px",
              fontSize: "14px",
              borderBottom: "1px solid black",
            }}
          >
            <div style={{ width: " 30%" }}>الاسم: {props.user.name}</div>
            <div style={{ width: " 20%" }}>
              {" "}
              الرقم الوظيفي: {props.user.user_id}{" "}
            </div>
            <div style={{ width: " 20%" }}>الوظيفة: {props.user.job}</div>
            <div style={{ width: " 30%" }}>
              الإدارة:{" "}
              {typeof props.user.category === "object"
                ? props.user.category.name
                : props.user.category}
            </div>
          </div>
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
                  <th style={{ fontWeight: "100" }}>اليوم</th>
                  <th style={{ fontWeight: "100" }}>التاريخ</th>
                  <th style={{ fontWeight: "100" }}>الحضور</th>
                  <th style={{ fontWeight: "100" }}>الانصراف</th>
                  <th style={{ fontWeight: "100" }}>ساعات العمل</th>
                  <th style={{ fontWeight: "100" }}>الوقت الفائض</th>
                  <th style={{ fontWeight: "100" }}>المبلغ المستحق</th>
                  <th style={{ fontWeight: "100", width: "300px" }}>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {pdata.flatMap((item, idx) => {
                  allWorkHours += convertTimeToSeconds(item.workHours);
                  allLateTimes += convertTimeToSeconds(item.lateTime);
                  allVacHours += convertTimeToSeconds(item.vacHours);
                  allBonusTimes += convertTimeToSeconds(item.bonusTime);
                  allDiscounts += item.discount * 1;
                  let salary =
                    Number(item.salary || (props.user && props.user.salary)) ||
                    0;
                  let bonusTime = item.bonusTime || "00:00:00";
                  let roundVal = round || 1;
                  let bonusPriceVal = bonusPrice || 1;
                  let bonusSeconds = timeToSeconds(bonusTime);
                  let bonus_value = 0;
                  if (
                    salary > 0 &&
                    bonusSeconds > 0 &&
                    roundVal > 0 &&
                    bonusPriceVal > 0
                  ) {
                    bonus_value =
                      Math.round(
                        ((bonusSeconds / 60) *
                          (salary / 30 / 7 / 60) *
                          bonusPriceVal) /
                        roundVal
                      ) * 100;
                  }

                  // تحقق من وجود بصمات متعددة في نفس اليوم
                  const hasExtra =
                    Array.isArray(item.extra_attendance) &&
                    item.extra_attendance.length > 0;

                  // الصف الأساسي (البصمة الأولى)
                  const baseRow = (
                    <tr
                      key={`${idx}-0`}
                      style={{
                        height: "25px",
                        backgroundColor:
                          item.attendance_time ||
                            item.discount == 0 ||
                            item.types
                            ? idx % 2 !== 0
                              ? "#e6e6e6"
                              : "#fff"
                            : "rgb(233 184 184)",
                      }}
                    >
                      <td>{item.dayName}</td>
                      <td>{item.date}</td>
                      <td>{item.attendance_time}</td>
                      <td>{item.leave_time}</td>
                      <td>{item.workHours}</td>
                      <td>{item.bonusTime}</td>
                      <td>
                        {new Intl.NumberFormat("en-EN").format(bonus_value)}
                      </td>
                      <td style={{ width: "300px" }}> </td>
                    </tr>
                  );

                  // إذا لم تكن هناك بصمات إضافية، نعيد فقط الصف الأساسي
                  if (!hasExtra || item.extra_attendance.length < 2)
                    return [baseRow];

                  // البصمات الإضافية (نكرر نفس المعلومات مع تغير وقت الدخول والخروج)
                  const extraRows = item.extra_attendance.map((extra, i) => (
                    <tr
                      key={`${idx}-extra-${i}`}
                      style={{
                        height: "25px",
                        backgroundColor:
                          (idx + i + 1) % 2 !== 0 ? "#e6e6e6" : "#fff",
                      }}
                    >
                      <td>{"-"}</td>
                      <td>{"-"}</td>
                      <td>{formatTime(extra.in)}</td>
                      <td>{formatTime(extra.out)}</td>
                      <td>{"-"}</td>
                      <td>{"-"}</td>
                      <td>{"-"}</td>
                      <td>{"-"}</td>
                    </tr>
                  ));

                  return [baseRow, ...extraRows];
                })}

                {/* إجمالي الصفوف */}
                <tr
                  style={{
                    color: "#fff",
                    backgroundColor: "#0972B6",
                    height: "30px",
                  }}
                >
                  <td colSpan={4}>الإجمالي</td>
                  <td>{allWorkHours.toString().toHHMMSS()}</td>
                  <td>{allBonusTimes.toString().toHHMMSS()}</td>
                  <td>
                    {new Intl.NumberFormat("en-EN").format(
                      (() => {
                        let totalBonusValue = 0;
                        pdata.forEach((item) => {
                          let salary =
                            Number(
                              item.salary || (props.user && props.user.salary)
                            ) || 0;
                          let bonusTime = item.bonusTime || "00:00:00";
                          let roundVal = round || 1;
                          let bonusPriceVal = bonusPrice || 1;
                          let bonusSeconds = timeToSeconds(bonusTime);
                          if (
                            salary > 0 &&
                            bonusSeconds > 0 &&
                            roundVal > 0 &&
                            bonusPriceVal > 0
                          ) {
                            totalBonusValue +=
                              Math.round(
                                ((bonusSeconds / 60) *
                                  (salary / 30 / 7 / 60) *
                                  bonusPriceVal) /
                                roundVal
                              ) * 100;
                          }
                        });
                        return totalBonusValue;
                      })()
                    )}
                  </td>
                  <td>-</td>
                </tr>
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
