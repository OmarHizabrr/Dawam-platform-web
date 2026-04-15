/* eslint-disable react-hooks/rules-of-hooks */
import { FirebaseServices } from "../../../firebase/FirebaseServices";
// import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import excel from "xlsx";
import "./style.css";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  ExportOutlined,
  FormOutlined,
  MinusCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
  Progress,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { Env, PrintFonts } from "../../../styles";
const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// ثوابت
const ANNUAL_VAC_ID = 2; // رقم نوع الإجازة السنوية لديك

const exportToExcel = (type, fn, dl) => {
  const elt = document.getElementsByTagName("table")[0];
  if (elt) {
    const wb = excel.utils.table_to_book(elt, { sheet: "sheet1" });
    return dl
      ? excel.write(wb, { bookType: type, bookSST: true, type: "base64" })
      : excel.writeFile(wb, fn || "الإجازات والمهام." + (type || "xlsx"));
  }
};

export default function tasksTable(props) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isuModalVisible, setIsUModalVisible] = useState(false);

  const [startVac, setStartVac] = useState("");
  const [type, setType] = useState(null);
  const [userType, setUserType] = useState(null);

  const [endVac, setEndVac] = useState("");
  const [start, setStart] = useState(
    dayjs(
      dayjs().format("YYYY-MM") +
      "-" +
      props.setting?.filter((item) => item.key === "admin.month_start")?.[0]
        ?.value,
      "YYYY-MM-DD"
    )
      .subtract(1, "months")
      .format("YYYY-MM-DD")
  );
  const [end, setEnd] = useState(dayjs().format("YYYY-MM-DD"));

  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM"));
  const [star, setStar] = useState(0);

  const [notes, setNotes] = useState("");
  const [tstypes, setTstypes] = useState([]);
  const [data, setData] = useState([]);

  const [vacationsTypes, setVacationsTypes] = useState([]);
  const [vacationsAmount, setVacationsAmount] = useState([]);
  const [totalConsumedVacs, setTotalConsumedVacs] = useState([]);
  const [requiredTasks, setRequiredTasks] = useState([]);

  const [load, setLoad] = useState(true);
  const [loadt, setLoadt] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usaving, setUSaving] = useState(false);

  const [visible, setVisible] = React.useState(false);
  const [givenTasks, setGivenTasks] = useState(null);
  const [restTasks, setRestTasks] = useState(null);
  const [totalDays, setTotalDays] = useState(0);
  const [totalAtt, settotalAtt] = useState(0);
  const [totalLate, setTotalLate] = useState(0);
  const [givenLoad, setGivenLoad] = useState(true);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [datefromValue, setDatefromValue] = useState(null);
  const [datetoValue, setDatetoValue] = useState(null);
  const [vacType, setVacType] = useState(null);

  // السنوية من المصدر الجديد فقط
  const [annuPerc, setAnnuPerc] = useState(0);
  const [annuDays, setAnnuDays] = useState(0);

  const [selectedLogs, setSelectedLogs] = useState(null);
  const [logload, setLogLoad] = useState(true);
  const [totalVac, setTotalVac] = useState("");
  const [vacId, setVacId] = useState();
  const [edit, setEdit] = useState();
  const [update, setUpdate] = useState(null);
  const [form] = Form.useForm();
  const [uform] = Form.useForm();

  const toNumber = (v, def = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  // يحسب عدد ساعات اليوم من إعدادات النظام (duration_start, duration_end)
  const computeDayHours = () => {
    // Return 7 hours to match Annual Report logic and fix balance discrepancy
    return 7;
  };

  // محاولة تحليل التاريخ بعدة صيغ محتملة
  const parseDateFlexible = (value) => {
    if (!value) return null;
    const fmts = ["YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm", "YYYY-MM-DD"];
    for (let i = 0; i < fmts.length; i++) {
      const d = dayjs(value, fmts[i], true);
      if (d.isValid()) return d;
    }
    const d2 = dayjs(value);
    return d2.isValid() ? d2 : null;
  };

  // يحسب عدد الأيام التقويمية بشكل شامل (من التاريخ إلى التاريخ) +1
  const computeCalendarDays = (dateFrom, dateTo) => {
    if (!dateFrom || !dateTo) return 0;
    // استخدم الجزء التاريخي فقط لتجنّب أي التباسات متعلقة بالوقت/التوقيت
    const fromDatePart = String(dateFrom).split(" ")[0];
    const toDatePart = String(dateTo).split(" ")[0];
    const fromParsed = dayjs(fromDatePart, "YYYY-MM-DD", true);
    const toParsed = dayjs(toDatePart, "YYYY-MM-DD", true);
    if (!fromParsed.isValid() || !toParsed.isValid()) return 0;
    const startDay = fromParsed.startOf("day");
    const endDay = toParsed.startOf("day");
    const diff = endDay.diff(startDay, "day");
    return diff >= 0 ? diff + 1 : 0;
  };

  // دالة مساعدة لحساب المدة من الأيام والساعات والدقائق
  const calculateDuration = (days, period) => {
    let totalDays = 0;
    let totalHours = 0;
    let totalMinutes = 0;

    // في حالة نفس اليوم وفترة أقل من ساعات الدوام: اعتبر الأيام = 0
    let effectiveDays = toNumber(days, 0);
    const dHoursForCalc = computeDayHours();
    if (effectiveDays === 1 && period && period !== "00:00") {
      const timeParts0 = period.split(":");
      if (timeParts0.length >= 2) {
        const ph = toNumber(timeParts0[0], 0);
        const pm = toNumber(timeParts0[1], 0);
        const pMinutes = ph * 60 + pm;
        if (pMinutes < dHoursForCalc * 60) {
          effectiveDays = 0;
        }
      }
    }

    // حساب الأيام
    if (effectiveDays > 0) {
      totalDays += effectiveDays;
    }

    // حساب الساعات والدقائق: من عمود period
    if (period && period !== "00:00") {
      const timeParts = period.split(":");
      if (timeParts.length >= 2) {
        const hours = toNumber(timeParts[0], 0);
        const minutes = toNumber(timeParts[1], 0);

        // تحويل ساعات الفترة إلى أيام يتم فقط إذا لم تكن هناك أيام تقويمية
        const dHours = computeDayHours();
        if (hours >= dHours && effectiveDays === 0) {
          const additionalDays = Math.floor(hours / dHours);
          totalDays += additionalDays;
          const remainingHours = hours % dHours;
          totalHours += remainingHours;
          totalMinutes += minutes;
        } else {
          // إذا كان هناك أيام تقويمية بالفعل، نتجاهل ساعات الفترة لتجنب مضاعفة الأيام في التجميعات
          if (effectiveDays === 0) {
            totalHours += hours;
            totalMinutes += minutes;
          }
        }
      }
    }

    // تحويل الدقائق الزائدة إلى ساعات
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;

    // تحويل الساعات الزائدة إلى أيام: فقط عندما لا توجد أيام تقويمية فعّالة
    {
      const dHours = computeDayHours();
      if (effectiveDays === 0 && totalHours >= dHours) {
        totalDays += Math.floor(totalHours / dHours);
        totalHours = totalHours % dHours;
      }
    }

    return { totalDays, totalHours, totalMinutes };
  };

  // دالة مساعدة لتنسيق المدة بالتنسيق DD:HH:MM
  const formatDuration = (days, period) => {
    const { totalDays, totalHours, totalMinutes } = calculateDuration(
      days,
      period
    );

    const formattedDays = String(totalDays).padStart(2, "0");
    const formattedHours = String(totalHours).padStart(2, "0");
    const formattedMinutes = String(totalMinutes).padStart(2, "0");

    return `${formattedDays}:${formattedHours}:${formattedMinutes}`;
  };

  // دالة مساعدة لتنسيق الساعات والدقائق بالتنسيق HH:MM
  const formatTimeOnly = (days, period) => {
    const { totalDays, totalHours, totalMinutes } = calculateDuration(
      days,
      period
    );

    const formattedHours = String(totalHours).padStart(2, "0");
    const formattedMinutes = String(totalMinutes).padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}`;
  };

  // إن كانت (prev/curr/trans) ليست بالدقائق لديك، عدّل التحويل هنا
  const normalizeGrant = (prev, curr, trans) => {
    // نفترض أنها بالدقائق مسبقاً
    return toNumber(prev, 0) + toNumber(curr, 0) + toNumber(trans, 0); // دقائق
  };

  const calcAnnualFromReport = (report) => {
    if (!report) {
      setAnnuDays(0);
      setAnnuPerc(100); // النسبة المتبقية 100% عندما لا يوجد تقرير
      return;
    }

    // New format check (from getAnnualyReportByUser)
    if (report.success && report.data && report.data.remaining !== undefined) {
      // Use the breakdown if available to match Annual Report logic exactly
      // (prev + curr + trans) - consumed
      let remainingMinutes = Number(report.data.remaining);
      let grantedMinutes = Number(report.data.balance);

      if (
        report.data.prev !== undefined &&
        report.data.curr !== undefined &&
        report.data.trans !== undefined
      ) {
        // Recalculate based on components to be super sure we match Annual Report structure
        const prev = Number(report.data.prev || 0);
        const curr = Number(report.data.curr || 0);
        const trans = Number(report.data.trans || 0);
        const consumed = Number(report.data.consumed || 0);

        // Annual Report Logic: Op (prev+curr+trans) - Consumed (totalg)
        grantedMinutes = prev + curr + trans;
        remainingMinutes = Math.max(0, grantedMinutes - consumed);
      }

      const minutesPerDay = 7 * 60; // 7 hours to match Annual Report logic
      const daysRemaining = minutesPerDay > 0 ? remainingMinutes / minutesPerDay : 0;

      const remainingPerc = grantedMinutes > 0 ? (remainingMinutes / grantedMinutes) * 100 : 0;

      setAnnuDays(daysRemaining);
      setAnnuPerc(remainingPerc);
      return;
    }

    // fallback for old format (should not happen for annual)
    // grantedMinutes: من prev+curr+trans
    const grantedMinutes = normalizeGrant(
      report.prev,
      report.curr,
      report.trans
    ); // بالدقائق

    // consumedSeconds: مجموع m1..m12 (ثوانٍ من attendancelogs)
    const consumedSeconds =
      toNumber(report.m1) +
      toNumber(report.m2) +
      toNumber(report.m3) +
      toNumber(report.m4) +
      toNumber(report.m5) +
      toNumber(report.m6) +
      toNumber(report.m7) +
      toNumber(report.m8) +
      toNumber(report.m9) +
      toNumber(report.m10) +
      toNumber(report.m11) +
      toNumber(report.m12);

    const consumedMinutes = Math.floor(consumedSeconds / 60);

    // المتبقي بالدقائق
    const remainingMinutes = Math.max(0, grantedMinutes - consumedMinutes);

    // الأيام المتبقية بناءً على ساعات اليوم من الإعدادات
    const minutesPerDay = computeDayHours() * 60;
    const daysRemaining =
      minutesPerDay > 0 ? remainingMinutes / minutesPerDay : 0;

    // النسبة المتبقية (100% - النسبة المستهلكة)
    const remainingPerc =
      grantedMinutes > 0 ? 100 - (consumedMinutes / grantedMinutes) * 100 : 100;

    setAnnuDays(daysRemaining);
    setAnnuPerc(remainingPerc);
  };

  useEffect(() => {
    // نوع المستخدم
    FirebaseServices.getUserType(props.user?.id)
      .then((data) => setUserType(data))
      .catch((error) => console.log(error));

    // أنواع الإجازات
    FirebaseServices.getTasksTypes()
      .then((data) => {
        setTstypes(data || []);
        setLoadt(false);
      })
      .catch((error) => console.log(error));

    // بيانات الجدول الرئيسية
    setLoad(true);
    FirebaseServices.getTasks(props.user.user_id, start, end)
      .then((data) => setData(data || []))
      .catch((error) => {
        console.log("Error fetching tasks:", error);
        setData([]);
      });

    // خلاصة/أنواع الإجازات الأخرى (غير السنوية) إن كنت لا تزال تحتاجها في الجدول السفلي
    FirebaseServices.getTasksInfo(props.user.user_id, start, end)
      .then((data) => {
        const resp = data || {};
        setVacationsTypes(resp.vacstypes || []);
        setTotalConsumedVacs(resp.totalConsumedVacs || []);
        setRequiredTasks(resp.requiredTasks || []);
        setVacationsAmount(resp.tasksAmount || []);
      })
      .catch(() => {
        setVacationsTypes([]);
        setTotalConsumedVacs([]);
        setRequiredTasks([]);
        setVacationsAmount([]);
      });

    // الحضور والغياب
    FirebaseServices.getDawamInfo(props.user.user_id, start, end)
      .then((data) => {
        const r = data || {};
        setTotalDays(r.count?.[0]?.count || 0);
        settotalAtt(r.data?.[0]?.attendanceDays || 0);
        setTotalLate(r.data?.[0]?.lateTime || 0);

        if (r.lists && r.count?.[0]?.count) {
          const lateTimePrice = toNumber(r.lists.lateTimePrice, 0);
          const attendanceDays = toNumber(r.lists.attendanceDays, 0);
          const salary = toNumber(r.lists.salary, 0);
          const totalCount = toNumber(r.count?.[0]?.count, 0);

          if (salary > 0 && totalCount > 0) {
            const starValue =
              1 -
              (lateTimePrice +
                parseInt(
                  (totalCount - attendanceDays) * (salary / totalCount)
                )) /
              salary;
            setStar(Math.max(0, Math.min(1, starValue)));
          } else {
            setStar(0);
          }
        } else {
          setStar(0);
        }

        setLoad(false);
      })
      .catch((error) => {
        console.log("Error fetching attendance data:", error);
        setTotalDays(0);
        settotalAtt(0);
        setTotalLate(0);
        setStar(0);
        setLoad(false);
      });

    // السنوية من المصدر الجديد فقط
    const year = dayjs(end).format("YYYY");
    FirebaseServices.getAnnualTasksReport(ANNUAL_VAC_ID, year, props.user.user_id)
      .then((data) => {
        calcAnnualFromReport(data);
      })
      .catch((err) => {
        console.log("annual report error:", err);
        setAnnuDays(0);
        setAnnuPerc(100); // النسبة المتبقية 100% عند حدوث خطأ
      });
  }, [start, end, update, props.user, props.setting]);

  const printReport = () => {
    const report = document.getElementById("task-report");
    const mywindow = window.open("");
    mywindow.document.write(
      "<html><head><title></title> <style>" +
      PrintFonts.getPrintFontsCSS() +
      "body{font-size:12px;margin:0} " +
      "</style>"
    );
    mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
    mywindow.document.write(report.innerHTML);
    mywindow.document.write("</body></html>");
    mywindow.print();
  };

  const disabledDate = (current) => {
    const daysCount =
      props.setting?.filter(
        (item) => item.key === "admin.vacations_tolerance"
      )?.[0]?.value * 1;
    const count = isNaN(daysCount) ? 1 : daysCount;
    const twoDaysAgo = dayjs().subtract(count, "day").endOf("day");
    return current && current < twoDaysAgo;
  };

  const safeRange = (from, to) => {
    const f = from || start + " 00:00";
    const t = to || end + " 23:59";
    return [f, t];
  };

  const getGivenRest = (vacId, from, to) => {
    if (!vacId) {
      setGivenTasks(null);
      setRestTasks(null);
      return;
    }
    setGivenLoad(true);

    const [sf, st] = safeRange(from, to);

    FirebaseServices.getGivenTasks(props.user.user_id, sf, st)
      .then((data) => {
        const r = data || {};
        const selectedVacation = (r.vacs || []).find(
          (rec) => toNumber(rec.id) === toNumber(vacId)
        );
        if (selectedVacation) {
          setGivenTasks(selectedVacation.cumHours ?? "-"); // "HH:MM"
        } else {
          setGivenTasks("-");
        }

        const selAmount = (r.tasksAmount || []).find(
          (rec) => toNumber(rec.vid) === toNumber(vacId)
        );

        if (
          selAmount &&
          selAmount.rest !== undefined &&
          selAmount.rest !== null
        ) {
          const restMin = toNumber(selAmount.rest, 0);
          const hh = Math.floor(restMin / 60);
          const mm = restMin % 60;
          setRestTasks(
            `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
          );
        } else {
          setRestTasks("-");
        }

        setGivenLoad(false);
      })
      .catch((error) => {
        console.log("Error fetching given tasks:", error);
        setGivenTasks("-");
        setRestTasks("-");
        setGivenLoad(false);
      });
  };

  const handleTypeChange = (e) => {
    setType(e);
    setGivenTasks(null);
    setRestTasks(null);
    getGivenRest(e, startVac, endVac);
  };
  const handleUTypeChange = (e) => {
    setVacType(e);
    setGivenTasks(null);
    setRestTasks(null);
    getGivenRest(e, datefromValue, datetoValue);
  };

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const onRangeChange = (all, dates) => {
    setStartVac(dates[0]);
    setEndVac(dates[1]);
    setDatefromValue(dates[0]);
    setDatetoValue(dates[1]);
    checkPeriod(all, dates);
    FirebaseServices.getAttendanceLogsBetween(props.user.user_id, dates[0], dates[1])
      .then((data) => {
        setSelectedLogs(data);
        setLogLoad(false);
      })
      .catch(function (error) {
        console.log(error);
        setLogLoad(false);
      });
  };

  const checkPeriod = (all, date) => {
    if (date[1] !== "") {
      const minutes = (new Date(date[1]) - new Date(date[0])) / 60000;
      let alerta = "";
      if (minutes <= 420)
        alerta =
          Math.floor(minutes / 60) + " ساعة و " + (minutes % 60) + " دقيقة ";
      else {
        const per = Math.floor(minutes / 1440) + 1;
        alerta = per;
        alerta += per <= 10 ? " أيام " : " يومًا ";
      }
      setTotalVac(alerta);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
    setSelectedLogs(null);
    setType(null);
    setGivenTasks(null);
    setRestTasks(null);
    setTotalVac("");
    setNotes("");
    form.resetFields();
  };

  const handleOk = () => {
    const values = {
      user_id: props.user.user_id,
      startDate: startVac,
      endDate: endVac,
      type: type,
      note: notes,
    };

    FirebaseServices.saveVacationTask(values, false)
      .then(function () {
        openNotification("bottomLeft", <Text>{"تم إرسال الإجازة بنجاح"}</Text>);
        setSaving(false);
        setIsModalVisible(false);
        setUpdate((u) => (u || 0) + 1);
        form.resetFields(["date_range", "task_type", "notes"]);
        setTotalVac("");
        setType(null);
        setNotes(null);
        setGivenTasks(null);
        setRestTasks(null);
      })
      .catch(function (error) {
        console.log(error);
        if (error?.response?.status === 409) {
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

  const handleuOk = () => {
    const values = {
      id: vacId,
      startDate: datefromValue,
      endDate: datetoValue,
      type: vacType,
      note: notes,
    };
    FirebaseServices.saveVacationTask(values, true)
      .then(function () {
        openNotification("bottomLeft", <Text>{"تم تعديل الإجازة بنجاح"}</Text>);
        setUSaving(false);
        setIsUModalVisible(false);
        setUpdate((u) => (u || 0) + 1);
        uform.resetFields(["date_range", "task_type", "notes"]);
        setTotalVac("");
        setVacType(null);
        setNotes(null);
        setGivenTasks(null);
        setRestTasks(null);
      })
      .catch(function (error) {
        console.log(error);
        notification.error({
          message: "فشل إرسال الإجازة!",
          placement: "bottomLeft",
          duration: 10,
        });
        setUSaving(false);
        setIsUModalVisible(false);
      });
  };

  const openNotification = (placement, text) => {
    notification.success({
      message: text,
      placement,
      duration: 10,
    });
  };

  const deleteTask = (record) => {
    FirebaseServices.deleteTask(record.id)
      .then(() => {
        setVisible(false);
        setConfirmLoading(false);
        openNotification(
          "bottomLeft",
          <span> {"تم حذف الإجازات/المهام بنجاح."}</span>
        );
        setUpdate((u) => (u || 0) + 1);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handlePOk = (record) => {
    setConfirmLoading(true);
    deleteTask(record);
  };
  const handlePCancel = () => {
    setVisible(false);
  };
  const handleuCancel = () => {
    setIsUModalVisible(false);
    setTotalVac("");
    setVacType(null);
    setGivenTasks(null);
    setRestTasks(null);
    setNotes(null);
    uform.resetFields(["date_range", "task_type", "notes"]);
  };
  const notesChange = (e) => setNotes(e.target.value);

  const updateTask = (record) => {
    FirebaseServices.saveVacationTask({id: record.id, type: vacType, startDate: datefromValue, endDate: datetoValue}, true)
      .then(() => {
        setVisible(false);
        setConfirmLoading(false);

        openNotification(
          "bottomLeft",
          <span>{"تم تعديل الإجازات/المهام بنجاح."}</span>
        );
        setUpdate((u) => (u || 0) + 1);
      })
      .catch(function (error) {
        console.log(error);
        setUpdate(1);
      });
  };

  const vacationsFilter = useMemo(() => {
    const vacations = [];
    if (Array.isArray(data)) {
      data.forEach((element) => {
        if (
          element &&
          element.name &&
          !vacations.some((item) => element.name === item.text)
        ) {
          vacations.push({ text: element["name"], value: element["name"] });
        }
      });
    }
    return vacations;
  }, [data]);

  const columns = [
    {
      title: "النوع",
      dataIndex: "name",
      key: "name",
      width: 150,
      filters: vacationsFilter,
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.name?.includes(value),
      sorter: (a, b) => (a.name || "").length - (b.name || "").length,
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
      ellipsis: false,
      render: (amount, record, index) => {
        if (index === edit) {
          return (
            <Select
              showSearch
              style={{ width: 120 }}
              optionFilterProp="children"
              notFoundContent={<Spin style={{ textAlign: "center" }}></Spin>}
              onSelect={function (e) {
                setVacType(e);
              }}
              filterOption={(input, option) =>
                option.props.children?.indexOf(input) >= 0 ||
                option.props.value?.indexOf(input) >= 0 ||
                option.props.label?.indexOf(input) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.props?.children?.localeCompare(optionB.props.children)
              }
              onPressEnter={function () {
                updateTask(record);
                setEdit(null);
              }}
              defaultValue={record.vac_id}
            >
              {tstypes.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          );
        } else {
          return <Text>{amount}</Text>;
        }
      },
    },
    {
      title: "من",
      dataIndex: "date_from",
      key: "date_from",
      width: window.innerWidth <= 760 ? 120 : 150,
      sorter: (a, b) => (a.date_from || "").localeCompare(b.date_from || ""),
      sortOrder: sortedInfo.columnKey === "date_from" && sortedInfo.order,
      ellipsis: false,
      render: (amount, record, index) => {
        if (index === edit) {
          return (
            <Input
              onChange={function (e) {
                setDatefromValue(e.target.value);
              }}
              onPressEnter={function () {
                updateTask(record);
                setEdit(null);
              }}
              defaultValue={dayjs(amount, "YYYY-MM-DD HH:mm:ss").format(
                "YYYY-MM-DD HH:mm"
              )}
            ></Input>
          );
        } else {
          if (window.innerWidth <= 760) {
            return (
              <div className="date-time-container">
                <div className="date">
                  {dayjs(amount, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD")}
                </div>
                <div className="time">
                  {dayjs(amount, "YYYY-MM-DD HH:mm:ss").format("HH:mm")}
                </div>
              </div>
            );
          } else {
            return (
              <Text>
                {dayjs(amount, "YYYY-MM-DD HH:mm:ss").format(
                  "YYYY-MM-DD HH:mm"
                )}
              </Text>
            );
          }
        }
      },
    },
    {
      title: "إلى",
      dataIndex: "date_to",
      key: "date_to",
      width: window.innerWidth <= 760 ? 120 : 150,
      sorter: (a, b) => (a.date_to || "").localeCompare(b.date_to || ""),
      sortOrder: sortedInfo.columnKey === "date_to" && sortedInfo.order,
      ellipsis: false,
      render: (amount, record, index) => {
        if (index === edit) {
          return (
            <Input
              onChange={function (e) {
                setDatetoValue(e.target.value);
              }}
              onPressEnter={function () {
                updateTask(record);
                setEdit(null);
              }}
              defaultValue={dayjs(amount, "YYYY-MM-DD HH:mm:ss").format(
                "YYYY-MM-DD HH:mm"
              )}
            ></Input>
          );
        } else {
          if (window.innerWidth <= 760) {
            return (
              <div className="date-time-container">
                <div className="date">
                  {dayjs(amount, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD")}
                </div>
                <div className="time">
                  {dayjs(amount, "YYYY-MM-DD HH:mm:ss").format("HH:mm")}
                </div>
              </div>
            );
          } else {
            return (
              <Text>
                {dayjs(amount, "YYYY-MM-DD HH:mm:ss").format(
                  "YYYY-MM-DD HH:mm"
                )}
              </Text>
            );
          }
        }
      },
    },
    {
      title: "تاريخ التقديم",
      dataIndex: "created_at",
      key: "created_at",
      width: window.innerWidth <= 760 ? 120 : 150,
      sorter: (a, b) => (a.created_at || "").localeCompare(b.created_at || ""),
      sortOrder: sortedInfo.columnKey === "created_at" && sortedInfo.order,
      ellipsis: false,
      render: (created_at) => {
        if (window.innerWidth <= 760) {
          return (
            <div className="date-time-container">
              <div className="date">
                {dayjs(created_at, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD")}
              </div>
              <div className="time">
                {dayjs(created_at, "YYYY-MM-DD HH:mm:ss").format("HH:mm")}
              </div>
            </div>
          );
        } else {
          return (
            <Text>
              {dayjs(created_at, "YYYY-MM-DD HH:mm:ss").format(
                "YYYY-MM-DD HH:mm"
              )}
            </Text>
          );
        }
      },
    },
    {
      title: "التفاصيل",
      dataIndex: "description",
      key: "description",
      width: 200,
      sorter: (a, b) =>
        (a.description || "").length - (b.description || "").length,
      sortOrder: sortedInfo.columnKey === "description" && sortedInfo.order,
      ellipsis: false,
      render: (description) => <Text>{description}</Text>,
    },

    {
      title: "مدة المهمة/الإجازة",
      dataIndex: "period",
      key: "period",
      width: 150,
      sorter: (a, b) => (a.period || "").length - (b.period || "").length,
      sortOrder: sortedInfo.columnKey === "period" && sortedInfo.order,
      ellipsis: false,
      render: (period, record) => {
        const daysCount = computeCalendarDays(record.date_from, record.date_to);
        const { totalDays } = calculateDuration(daysCount, period);
        return <Text>{totalDays > 0 ? totalDays : period}</Text>;
      },
    },
    {
      title: "مدير الإدارة",
      hidden: userType != 3,
      dataIndex: "dept_manager",
      key: "dept_manager",
      width: 150,
      filters: [
        { text: "معتمدة", value: "معتمدة" },
        { text: "في الانتظار", value: "في الانتظار" },
        { text: "مرفوضة", value: "مرفوضة" },
      ],
      filteredValue: filteredInfo.dept_manager || null,
      onFilter: (value, record) => (record.dept_manager || "").includes(value),
      sorter: (a, b) =>
        (a.dept_manager || "").length - (b.dept_manager || "").length,
      sortOrder: sortedInfo.columnKey === "dept_manager" && sortedInfo.order,
      ellipsis: false,
      render: (el) =>
        el === "معتمدة" ? (
          <CheckCircleOutlined style={{ fontSize: "25px", color: "#0972B6" }} />
        ) : el === "في الانتظار" ? (
          <MinusCircleOutlined style={{ fontSize: "25px", color: "#FFDD1C" }} />
        ) : (
          <CloseCircleOutlined style={{ fontSize: "25px", color: "#f00" }} />
        ),
    },
    {
      title: props.setting?.filter(
        (item) => item.key === "admin.general_manager"
      )?.[0]?.value,
      dataIndex: "gerenal_sec",
      key: "gerenal_sec",
      className: "gensec",
      width: 150,
      filters: [
        { text: "معتمدة", value: "معتمدة" },
        { text: "في الانتظار", value: "في الانتظار" },
        { text: "مرفوضة", value: "مرفوضة" },
      ],
      filteredValue: filteredInfo.gerenal_sec || null,
      onFilter: (value, record) => (record.gerenal_sec || "").includes(value),
      sorter: (a, b) =>
        (a.gerenal_sec || "").length - (b.gerenal_sec || "").length,
      sortOrder: sortedInfo.columnKey === "gerenal_sec" && sortedInfo.order,
      ellipsis: false,
      render: (el) =>
        el === "معتمدة" ? (
          <CheckCircleOutlined style={{ fontSize: "25px", color: "#0972B6" }} />
        ) : el === "في الانتظار" ? (
          <MinusCircleOutlined style={{ fontSize: "25px", color: "#FFDD1C" }} />
        ) : (
          <CloseCircleOutlined style={{ fontSize: "25px", color: "#f00" }} />
        ),
    },
    {
      title: "شؤون الموظفين",
      dataIndex: "hr_manager",
      key: "hr_manager",
      width: 150,
      filters: [
        { text: "معتمدة", value: "معتمدة" },
        { text: "في الانتظار", value: "في الانتظار" },
        { text: "مرفوضة", value: "مرفوضة" },
      ],
      filteredValue: filteredInfo.hr_manager || null,
      onFilter: (value, record) => (record.hr_manager || "").includes(value),
      sorter: (a, b) =>
        (a.hr_manager || "").length - (b.hr_manager || "").length,
      sortOrder: sortedInfo.columnKey === "hr_manager" && sortedInfo.order,
      ellipsis: false,
      render: (el) =>
        el === "معتمدة" ? (
          <CheckCircleOutlined style={{ fontSize: "25px", color: "#0972B6" }} />
        ) : el === "في الانتظار" ? (
          <MinusCircleOutlined style={{ fontSize: "25px", color: "#FFDD1C" }} />
        ) : (
          <CloseCircleOutlined style={{ fontSize: "25px", color: "#f00" }} />
        ),
    },
    {
      title: "",
      width: 100,
      render: (vid, record) => (
        <Button
          disabled={
            record.dept_manager !== "في الانتظار" ||
            record.gerenal_sec !== "في الانتظار" ||
            record.hr_manager !== "في الانتظار"
          }
          onClick={function () {
            uform.setFieldsValue({
              notes: record.description || "",
              date_range: [
                dayjs(record.date_from, "YYYY-MM-DD HH:mm"),
                dayjs(record.date_to, "YYYY-MM-DD HH:mm"),
              ],
              task_type: record.vac_id,
            });
            setVacId(record.id);
            setVacType(record.vac_id);
            setDatefromValue(record.date_from);
            setDatetoValue(record.date_to);
            setNotes(record.description || "");
            setGivenTasks(null);
            setRestTasks(null);
            getGivenRest(record.vac_id, record.date_from, record.date_to);
            setSelectedLogs(null);
            setIsUModalVisible(true);
          }}
          className={"edit-btn"}
          style={{
            backgroundColor: "#fff",
            borderColor: "#0972B6",
            color: "#0972B6",
          }}
          type="primary"
          shape="round"
          icon={<FormOutlined />}
        ></Button>
      ),
    },
    {
      title: "",
      width: 100,
      render: (vid, record) => (
        <Popconfirm
          key={record.id}
          title={"هل أنت متأكد من حذف الإجازة "}
          open={visible && selectedIndex === record.id}
          onConfirm={function () {
            handlePOk(record);
          }}
          okButtonProps={{ loading: confirmLoading }}
          onCancel={handlePCancel}
        >
          <Button
            disabled={
              record.dept_manager !== "في الانتظار" ||
              record.gerenal_sec !== "في الانتظار" ||
              record.hr_manager !== "في الانتظار"
            }
            onClick={function () {
              showPopconfirm(record.id);
            }}
            className={"delete-btn"}
            style={{
              backgroundColor: "#fff",
              borderColor: "#ff0000",
              color: "#f00",
            }}
            type="primary"
            shape="round"
            icon={<DeleteOutlined />}
          ></Button>
        </Popconfirm>
      ),
    },
  ].filter((item) => !item.hidden);

  const dcolumns = [
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
      width: 120,
      sorter: (a, b) => (a.date || "").length - (b.date || "").length,
      sortOrder: sortedInfo.columnKey === "date" && sortedInfo.order,
      ellipsis: false,
    },
    {
      title: " الحضور",
      dataIndex: "attendance_time",
      key: "attendance_time",
      width: 120,
      sorter: (a, b) =>
        (a.attendance_time || "").length - (b.attendance_time || "").length,
      sortOrder: sortedInfo.columnKey === "attendance_time" && sortedInfo.order,
      ellipsis: false,
      render: (attendance_time) => attendance_time?.split(" ")[1],
    },
    {
      title: " الانصراف",
      dataIndex: "leave_time",
      key: "leave_time",
      width: 120,
      sorter: (a, b) =>
        (a.leave_time || "").length - (b.leave_time || "").length,
      sortOrder: sortedInfo.columnKey === "leave_time" && sortedInfo.order,
      ellipsis: false,
      render: (leave_time) => leave_time?.split(" ")[1],
    },
    {
      title: "ساعات العمل",
      dataIndex: "workHour",
      key: "workHour",
      width: 120,
      sorter: (a, b) => (a.workHour || "").length - (b.workHour || "").length,
      sortOrder: sortedInfo.columnKey === "workHour" && sortedInfo.order,
      ellipsis: false,
    },
  ];

  const handleCancel = () => {
    setIsModalVisible(false);
    setType(null);
    setGivenTasks(null);
    setRestTasks(null);
    setTotalVac("");
    setNotes(null);
    form.resetFields(["date_range", "task_type", "notes"]);
  };

  const showPopconfirm = (id) => {
    setVisible(true);
    setSelectedIndex(id);
  };

  const changeRange = (all, date) => {
    setStart(date[0]);
    setEnd(date[1]);
  };

  const days = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  const onChange = (all, data) => {
    setCurrentMonth(all.format("MMMM"));

    const startDay = props.setting?.filter(
      (item) => item.key == "admin.month_start"
    )?.[0]?.value;
    const endDay = props.setting?.filter(
      (item) => item.key == "admin.month_end"
    )?.[0]?.value;

    setStart(
      dayjs(data + "-" + startDay, "YYYY-MM-DD")
        .subtract(1, "months")
        .format("YYYY-MM-DD")
    );
    setEnd(dayjs(data + "-" + endDay, "YYYY-MM-DD").format("YYYY-MM-DD"));
  };

  const formItemLayout = {
    labelCol: {
      xs: { span: 6 },
      sm: { span: 6 },
    },
    wrapperCol: {
      xs: { span: 18 },
      sm: { span: 18 },
    },
  };

  return (
    <Card bodyStyle={{ padding: "20px 15px" }}>
      <div className="tasksHeader">
        <div className="tasksData">
          <span>
            <Progress
              type="circle"
              percent={Math.round(toNumber(annuPerc, 0))}
              width={window.innerWidth <= 760 ? 55 : 80}
              style={{ marginLeft: "5px", display: "inline-block" }}
            />
          </span>
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              paddingTop: "10px",
              marginRight: "5px",
            }}
          >
            <div style={{ marginBottom: "5px" }}>رصيد السنوية</div>
            <div>
              المتبقي:{" "}
              {toNumber(annuDays, 0) > 0
                ? Math.round(toNumber(annuDays) * 100) / 100
                : 0}{" "}
              يوم
            </div>
          </span>
        </div>

        <div className="tasksOper">
          <div style={{ marginLeft: "5px" }}>
            {window.innerWidth <= 760 ? (
              <span style={{ fontSize: "12px" }}>اختر شهرًا : </span>
            ) : (
              <span>اختر شهرًا : </span>
            )}
            <DatePicker
              needConfirm={false}
              inputReadOnly={window.innerWidth <= 760}
              defaultValue={dayjs()}
              onChange={onChange}
              picker="month"
            />
          </div>
          {window.innerWidth <= 760 ? null : (
            <div
              className="tasksRange"
              style={{ marginBottom: "10px", marginLeft: "5px" }}
            >
              <span>اختر فترة : </span>
              <RangePicker
                needConfirm={true}
                inputReadOnly={window.innerWidth <= 760}
                value={[dayjs(start, "YYYY-MM-DD"), dayjs(end, "YYYY-MM-DD")]}
                onChange={changeRange}
              />
            </div>
          )}
          <div className="tasksBtn">
            <Button
              style={{
                marginBottom: "10px",
                marginLeft: "5px",
                backgroundColor: "#FAA61A",
                border: "none",
              }}
              onClick={showModal}
              type="primary"
            >
              <FormOutlined />
              {window.innerWidth > 760 ? "تقديم إجازة" : null}
            </Button>
            {window.innerWidth <= 760 ? null : (
              <Button
                disabled={load}
                style={{
                  display: "block",
                  marginLeft: "5px",
                  marginBottom: "10px",
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
              style={{
                display: "block",
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
        </div>
      </div>

      {/* إضافة/تعديل إجازة */}
      <Modal
        centered
        title="تقديم إجازة / مهمة"
        confirmLoading={saving}
        open={isModalVisible}
        onOk={function () {
          setSaving(true);
          handleOk();
        }}
        onCancel={function () {
          handleCancel();
        }}
      >
        <Form form={form}>
          <Form.Item
            className="rangee"
            name={"date_range"}
            label="فترة الإجازة / المهمة :"
          >
            <Space>
              <RangePicker
                needConfirm={true}
                inputReadOnly={window.innerWidth <= 760}
                showTime={{
                  defaultValue: [
                    dayjs(
                      props.setting?.filter(
                        (item) => item.key == "duration_start"
                      )?.[0]?.value,
                      "HH:mm"
                    ),
                    dayjs(
                      props.setting?.filter(
                        (item) => item.key == "duration_end"
                      )?.[0]?.value,
                      "HH:mm"
                    ),
                  ],
                }}
                width={50}
                format="YYYY-MM-DD HH:mm"
                onChange={onRangeChange}
              />
            </Space>
            <div style={{ marginTop: "10px", fontWeight: 600 }}>
              مدة الإجازة: <Text type="danger">{totalVac}</Text>
            </div>
          </Form.Item>
          <Table
            loading={logload && startVac && endVac}
            pagination={false}
            style={{ textAlign: "center!important" }}
            columns={dcolumns}
            dataSource={selectedLogs || []}
            onChange={handleChange}
            scroll={{ x: "600px" }}
          />
          <Form.Item
            {...formItemLayout}
            labelWrap={false}
            style={{ marginTop: "10px", marginBottom: "10px" }}
            name={"task_type"}
            label="نوع الإجازة"
          >
            <Select
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
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                gap: 20,
              }}
            >
              <div>
                الممنوحة:{" "}
                <span
                  style={{
                    fontWeight: "600",
                    color: "#f00",
                  }}
                >
                  {givenTasks ?? "-"}
                </span>
              </div>
              <div>
                المتبقية:{" "}
                <span style={{ fontWeight: "600", color: "#f00" }}>
                  {restTasks ?? "-"}
                </span>{" "}
              </div>
            </div>
          </Form.Item>
          <Form.Item name={"notes"} label="تفاصيل ">
            <TextArea rows={3} onChange={notesChange}></TextArea>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        centered
        title="تعديل إجازة / مهمة"
        confirmLoading={usaving}
        open={isuModalVisible}
        onOk={function () {
          setUSaving(true);
          handleuOk();
        }}
        onCancel={function () {
          handleuCancel();
        }}
      >
        <Form form={uform}>
          <Form.Item
            className="rangee"
            name={"date_range"}
            label="فترة الإجازة / المهمة :"
          >
            <Space>
              <RangePicker
                needConfirm={true}
                inputReadOnly={window.innerWidth <= 760}
                format="YYYY-MM-DD HH:mm"
                value={[
                  datefromValue
                    ? dayjs(datefromValue, "YYYY-MM-DD HH:mm")
                    : null,
                  datetoValue ? dayjs(datetoValue, "YYYY-MM-DD HH:mm") : null,
                ]}
                showTime
                disabledDate={disabledDate}
                onChange={function (all, dates) {
                  onRangeChange(all, dates);
                }}
              />
            </Space>
            <div style={{ marginTop: "10px", fontWeight: 600 }}>
              مدة الإجازة: <Text type="danger">{totalVac}</Text>
            </div>
          </Form.Item>
          <Table
            loading={logload && datefromValue && datetoValue}
            pagination={false}
            style={{ textAlign: "center!important" }}
            columns={dcolumns}
            dataSource={selectedLogs || []}
            onChange={handleChange}
            scroll={{ x: "600px" }}
          />
          <Form.Item
            {...formItemLayout}
            style={{ marginBottom: "10px" }}
            name={"task_type"}
            label="نوع الإجازة"
          >
            <Select
              showSearch
              notFoundContent={<Spin style={{ textAlign: "center" }}></Spin>}
              style={{ width: 150 }}
              onSelect={handleUTypeChange}
              value={vacType}
              options={tstypes}
              placeholder="اختر إجازة"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children?.indexOf(input) >= 0 ||
                option.props.label?.indexOf(input) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.props?.children?.localeCompare(optionB.props.children)
              }
            ></Select>
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
                gap: 20,
              }}
            >
              <div>
                الممنوحة:{" "}
                <span
                  style={{
                    fontWeight: "600",
                    color: "#f00",
                  }}
                >
                  {givenTasks ?? "-"}
                </span>
              </div>
              <div>
                المتبقية:{" "}
                <span style={{ fontWeight: "600", color: "#f00" }}>
                  {restTasks ?? "-"}
                </span>{" "}
              </div>
            </div>
            {vacType && (
              <div
                style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}
              >
                نوع الإجازة المحدد:{" "}
                {tstypes.find((t) => t.value === vacType)?.label || vacType}
              </div>
            )}
          </Form.Item>
          <Form.Item name={"notes"} label="تفاصيل ">
            <TextArea rows={3} onChange={notesChange}></TextArea>
          </Form.Item>
        </Form>
      </Modal>

      <Table
        loading={load}
        columns={columns}
        scroll={{ x: "1000px" }}
        dataSource={data || []}
        onChange={handleChange}
        rowKey={(row) =>
          row.id || `${row.date_from}-${row.date_to}-${row.vac_id}`
        }
        locale={{
          emptyText: "لا توجد بيانات لعرضها",
          triggerDesc: "انقر لترتيب تنازلي",
          triggerAsc: "انقر لترتيب تصاعدي",
          cancelSort: "انقر لإلغاء الترتيب",
        }}
      />

      {/* تقرير الطباعة */}
      <div id="task-report" style={{ display: "none" }}>
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
            }}
          >
            <div style={{ width: "20%" }}>
              <img
                loading="eager"
                style={{ width: "250px" }}
                src={
                  Env.HOST_SERVER_STORAGE +
                  props.setting?.filter((item) => item.key == "admin.logo")?.[0]
                    ?.value
                }
                alt="logo"
              />
            </div>
            <div
              style={{
                fontSize: "11px",
                textAlign: "center",
                width: "60%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "end",
                paddingBottom: "10px",
              }}
            >
              <h2
                style={{
                  fontSize: " 14px",
                  fontWeight: 700,
                  marginBottom: " 5px",
                  margin: "0",
                }}
              >
                حافظة الإجازات والمهام لشهر {currentMonth}
              </h2>
              <h2
                style={{ fontSize: " 14px", fontWeight: " 200", margin: "0" }}
              >
                للفترة من {start} إلى {end}
              </h2>
            </div>
            <div style={{ width: "20%" }}></div>
          </header>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              textAlign: "center",
              padding: "6px 0",
              fontSize: "14px",
              borderBottom: "1px solid #ddd",
              borderTop: "1px solid #ddd",
              flexWrap: "nowrap",
              minHeight: "35px",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "2px",
                whiteSpace: "nowrap",
              }}
            >
              الاسم: {props.user.name}
            </div>
            <div
              style={{
                flex: 1,
                padding: "2px",
                whiteSpace: "nowrap",
              }}
            >
              الرقم الوظيفي: {props.user.user_id}
            </div>
            <div
              style={{
                flex: 1,
                padding: "2px",
                whiteSpace: "nowrap",
              }}
            >
              الوظيفة: {props.user.job}
            </div>
            <div
              style={{
                flex: 1,
                padding: "2px",
                whiteSpace: "nowrap",
              }}
            >
              الإدارة:{" "}
              {typeof props.user.category === "object"
                ? props.user.category.name
                : props.user.category}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              textAlign: "center",
              padding: "6px 0",
              fontSize: "14px",
              borderBottom: "1px solid #ddd",
              borderTop: "1px solid #ddd",
              flexWrap: "nowrap",
              minHeight: "35px",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <div style={{ flex: 1, padding: "2px", whiteSpace: "nowrap" }}>
              الدوام المطلوب: {totalDays}
            </div>
            <div style={{ flex: 1, padding: "2px", whiteSpace: "nowrap" }}>
              أيام الغياب: {totalDays - totalAtt}
            </div>
            <div style={{ flex: 1, padding: "2px", whiteSpace: "nowrap" }}>
              التأخرات بالساعة: {parseInt(totalLate / 60)}:{totalLate % 60}
            </div>
            <div style={{ flex: 1, padding: "2px", whiteSpace: "nowrap" }}>
              نسبة الانضباط:{" "}
              {isNaN(star) || !isFinite(star)
                ? "0%"
                : Math.round(star * 100) + "%"}
            </div>
          </div>
          <div>
            <table
              style={{
                fontSize: "12px",
                width: " 100%",
                textAlign: " center",
                marginTop: " 0px",
                borderCollapse: "collapse",
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
                  <th
                    colSpan={4}
                    style={{ fontWeight: "100", border: "0.1px solid #fff" }}
                  >
                    الفترة
                  </th>
                  <th
                    colSpan={2}
                    style={{ fontWeight: "100", border: "0.1px solid #fff" }}
                  >
                    الإجمالي
                  </th>
                  <th
                    rowSpan={2}
                    style={{ fontWeight: "100", border: "0.1px solid #fff" }}
                  >
                    نوع الإجازة/المهمة
                  </th>
                  <th
                    rowSpan={2}
                    style={{ fontWeight: "100", border: "0.1px solid #fff" }}
                  >
                    التفاصيل
                  </th>
                  <th
                    rowSpan={2}
                    style={{
                      fontWeight: "100",
                      width: "90px",
                      border: "0.1px solid #fff",
                    }}
                  >
                    {userType != 3
                      ? props.setting?.filter(
                        (item) => item.key == "admin.general_manager"
                      )?.[0]?.value
                      : "مدير الإدارة"}
                  </th>
                  <th
                    rowSpan={2}
                    style={{
                      fontWeight: "100",
                      width: "90px",
                      border: "0.1px solid #fff",
                    }}
                  >
                    الشؤون
                  </th>
                </tr>
                <tr
                  style={{
                    color: "#fff",
                    backgroundColor: "#0972B6",
                    height: "30px",
                  }}
                >
                  <th
                    style={{ fontWeight: "100", border: "0.1px solid #fff" }}
                  ></th>
                  <th style={{ fontWeight: "100", border: "0.1px solid #fff" }}>
                    اليوم
                  </th>
                  <th style={{ fontWeight: "100", border: "0.1px solid #fff" }}>
                    التاريخ
                  </th>
                  <th style={{ fontWeight: "100", border: "0.1px solid #fff" }}>
                    الوقت
                  </th>
                  <th style={{ fontWeight: "100", border: "0.1px solid #fff" }}>
                    أيام
                  </th>
                  <th style={{ fontWeight: "100", border: "0.1px solid #fff" }}>
                    ساعات
                  </th>
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((item, index) => {
                    return (
                      <React.Fragment key={item.id || index}>
                        <tr style={{ height: " 25px" }}>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            من
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            {item.date_from
                              ? days[new Date(item.date_from).getDay()]
                              : ""}
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            {item.date_from ? item.date_from.split(" ")[0] : ""}
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            {item.date_from && item.date_from.split(" ")[1]
                              ? dayjs(
                                item.date_from.split(" ")[1],
                                "HH:mm:ss"
                              ).format("hh:mm A")
                              : ""}
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                            rowSpan={2}
                          >
                            {(() => {
                              const daysCount = computeCalendarDays(
                                item.date_from,
                                item.date_to
                              );
                              const { totalDays } = calculateDuration(
                                daysCount,
                                item.period
                              );
                              return totalDays > 0 ? totalDays : 0;
                            })()}
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                            rowSpan={2}
                          >
                            {(() => {
                              return formatTimeOnly(item.days, item.period);
                            })()}
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                            rowSpan={2}
                          >
                            {item.name || ""}
                          </td>
                          <td
                            style={{
                              width: "150px",
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                            rowSpan={2}
                          >
                            {item.description || ""}
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                            rowSpan={2}
                          >
                            {userType !== 3
                              ? item.gerenal_sec === "في الانتظار"
                                ? ""
                                : item.gerenal_sec || ""
                              : item.dept_manager === "في الانتظار"
                                ? ""
                                : item.dept_manager || ""}
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                            rowSpan={2}
                          >
                            {item.hr_manager === "في الانتظار"
                              ? ""
                              : item.hr_manager || ""}
                          </td>
                        </tr>
                        <tr style={{ height: " 25px" }}>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            إلى
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            {item.date_to
                              ? days[new Date(item.date_to).getDay()]
                              : ""}
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            {item.date_to ? item.date_to.split(" ")[0] : ""}
                          </td>
                          <td
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#e6e6e6" : "#fff",
                            }}
                          >
                            {item.date_to && item.date_to.split(" ")[1]
                              ? dayjs(
                                item.date_to.split(" ")[1],
                                "HH:mm:ss"
                              ).format("hh:mm A")
                              : ""}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      لا توجد بيانات لعرضها
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* خلاصة الإجازات */}
          <div style={{ padding: "0px 50px", marginTop: "30px" }}>
            <table
              style={{
                fontSize: "12px",
                width: "100%",
                textAlign: "center",
                paddingLeft: "20px",
                borderCollapse: "separate",
                borderSpacing: "0.1px",
                backgroundColor: "#fff",
              }}
            >
              <caption style={{ fontWeight: "900" }}>
                خلاصة الإجازات المعتمدة
              </caption>
              <thead>
                <tr
                  style={{
                    color: "#fff",
                    backgroundColor: "#0972B6",
                    height: "30px",
                  }}
                >
                  <th style={{ fontWeight: "100", border: "0.1px solid #fff" }}>
                    نوع الإجازة
                  </th>
                  {vacationsTypes.map((item) => (
                    <th
                      key={item.id}
                      style={{ fontWeight: "100", border: "0.1px solid #fff" }}
                    >
                      {item.name}
                      <br />
                      <span style={{ fontSize: "10px", opacity: "0.8" }}>
                        د | س | ي
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* إجمالي كل نوع (بغضّ النظر عن الاعتماد) */}
                <tr>
                  <td
                    style={{
                      backgroundColor: " #0972B6",
                      color: "#fff",
                      border: "0.1px solid #fff",
                    }}
                  >
                    الإجمالي حسب النوع
                  </td>
                  {vacationsTypes && vacationsTypes.length > 0 ? (
                    vacationsTypes.map((item) => {
                      // جميع الإجازات/المهام المعتمدة لهذا النوع فقط
                      const allTypeTasks =
                        data?.filter(
                          (task) =>
                            toNumber(task.vac_id) === toNumber(item.id) &&
                            task.hr_manager === "معتمدة"
                        ) || [];

                      // حساب إجمالي المدة (أيام + ساعات + دقائق)
                      let totalDays = 0;
                      let totalHours = 0;
                      let totalMinutes = 0;

                      allTypeTasks.forEach((task) => {
                        const daysCount = computeCalendarDays(
                          task.date_from,
                          task.date_to
                        );
                        const {
                          totalDays: taskDays,
                          totalHours: taskHours,
                          totalMinutes: taskMinutes,
                        } = calculateDuration(daysCount, task.period);
                        totalDays += taskDays;
                        totalHours += taskHours;
                        totalMinutes += taskMinutes;
                      });

                      // تحويل الدقائق الزائدة إلى ساعات
                      totalHours += Math.floor(totalMinutes / 60);
                      totalMinutes = totalMinutes % 60;

                      // تحويل الساعات الزائدة إلى أيام
                      {
                        const dHours = computeDayHours();
                        if (totalHours >= dHours) {
                          totalDays += Math.floor(totalHours / dHours);
                          totalHours = totalHours % dHours;
                        }
                      }

                      // تنسيق DD:HH:MM
                      const formattedDays = String(totalDays).padStart(2, "0");
                      const formattedHours = String(totalHours).padStart(
                        2,
                        "0"
                      );
                      const formattedMinutes = String(totalMinutes).padStart(
                        2,
                        "0"
                      );

                      // إذا كانت جميع القيم صفرية، نعرض فراغًا للحقل
                      if (
                        totalDays === 0 &&
                        totalHours === 0 &&
                        totalMinutes === 0
                      ) {
                        return (
                          <td
                            key={item.id}
                            style={{ border: "0.1px solid #fff" }}
                          ></td>
                        );
                      }

                      return (
                        <td
                          key={item.id}
                          style={{ border: "0.1px solid #fff" }}
                        >
                          {formattedDays}:{formattedHours}:{formattedMinutes}
                        </td>
                      );
                    })
                  ) : (
                    <td colSpan="1" style={{ border: "0.1px solid #fff" }}>
                      00:00:00
                    </td>
                  )}
                </tr>
                <tr>
                  <td
                    style={{
                      backgroundColor: " #0972B6",
                      color: "#fff",
                      border: "0.1px solid #fff",
                    }}
                  >
                    المطلوبة
                  </td>
                  {vacationsTypes && vacationsTypes.length > 0 ? (
                    vacationsTypes.map((item) => {
                      // غير المعتمدة بحسب المدير العام فقط
                      const pendingTasks =
                        data?.filter((task) => {
                          if (toNumber(task.vac_id) !== toNumber(item.id))
                            return false;
                          const gmOk = (task.gerenal_sec || "") === "معتمدة";
                          return !gmOk;
                        }) || [];

                      // حساب إجمالي المدة المطلوبة (أيام + ساعات + دقائق)
                      let totalDays = 0;
                      let totalHours = 0;
                      let totalMinutes = 0;

                      pendingTasks.forEach((task) => {
                        const daysCount = computeCalendarDays(
                          task.date_from,
                          task.date_to
                        );
                        const {
                          totalDays: taskDays,
                          totalHours: taskHours,
                          totalMinutes: taskMinutes,
                        } = calculateDuration(daysCount, task.period);
                        totalDays += taskDays;
                        totalHours += taskHours;
                        totalMinutes += taskMinutes;
                      });

                      // تحويل الدقائق الزائدة إلى ساعات
                      totalHours += Math.floor(totalMinutes / 60);
                      totalMinutes = totalMinutes % 60;

                      // تحويل الساعات الزائدة إلى أيام
                      {
                        const dHours = computeDayHours();
                        if (totalHours >= dHours) {
                          totalDays += Math.floor(totalHours / dHours);
                          totalHours = totalHours % dHours;
                        }
                      }

                      // تنسيق النتيجة بالتنسيق DD:HH:MM
                      const formattedDays = String(totalDays).padStart(2, "0");
                      const formattedHours = String(totalHours).padStart(
                        2,
                        "0"
                      );
                      const formattedMinutes = String(totalMinutes).padStart(
                        2,
                        "0"
                      );

                      // إذا كانت جميع القيم صفرية، نعرض فراغ
                      if (
                        totalDays === 0 &&
                        totalHours === 0 &&
                        totalMinutes === 0
                      ) {
                        return (
                          <td
                            key={item.id}
                            style={{ border: "0.1px solid #fff" }}
                          ></td>
                        );
                      }

                      return (
                        <td
                          key={item.id}
                          style={{ border: "0.1px solid #fff" }}
                        >
                          {formattedDays}:{formattedHours}:{formattedMinutes}
                        </td>
                      );
                    })
                  ) : (
                    <td colSpan="1" style={{ border: "0.1px solid #fff" }}>
                      0
                    </td>
                  )}
                </tr>
                <tr>
                  <td
                    style={{
                      backgroundColor: " #0972B6",
                      color: "#fff",
                      border: "0.1px solid #fff",
                    }}
                  >
                    الممنوحة
                  </td>
                  {vacationsTypes && vacationsTypes.length > 0 ? (
                    vacationsTypes.map((item) => {
                      // المعتمدة بحسب المدير العام فقط
                      const approvedTasks =
                        data?.filter((task) => {
                          if (toNumber(task.vac_id) !== toNumber(item.id))
                            return false;
                          const gmOk = (task.gerenal_sec || "") === "معتمدة";
                          return gmOk;
                        }) || [];

                      // حساب إجمالي المدة المعتمدة (أيام + ساعات + دقائق)
                      let totalDays = 0;
                      let totalHours = 0;
                      let totalMinutes = 0;

                      approvedTasks.forEach((task) => {
                        const daysCount = computeCalendarDays(
                          task.date_from,
                          task.date_to
                        );
                        const {
                          totalDays: taskDays,
                          totalHours: taskHours,
                          totalMinutes: taskMinutes,
                        } = calculateDuration(daysCount, task.period);
                        totalDays += taskDays;
                        totalHours += taskHours;
                        totalMinutes += taskMinutes;
                      });

                      // تحويل الدقائق الزائدة إلى ساعات
                      totalHours += Math.floor(totalMinutes / 60);
                      totalMinutes = totalMinutes % 60;

                      // تحويل الساعات الزائدة إلى أيام
                      {
                        const dHours = computeDayHours();
                        if (totalHours >= dHours) {
                          totalDays += Math.floor(totalHours / dHours);
                          totalHours = totalHours % dHours;
                        }
                      }

                      // تنسيق النتيجة بالتنسيق DD:HH:MM
                      const formattedDays = String(totalDays).padStart(2, "0");
                      const formattedHours = String(totalHours).padStart(
                        2,
                        "0"
                      );
                      const formattedMinutes = String(totalMinutes).padStart(
                        2,
                        "0"
                      );

                      // إذا كانت جميع القيم صفرية، نعرض فراغ
                      if (
                        totalDays === 0 &&
                        totalHours === 0 &&
                        totalMinutes === 0
                      ) {
                        return (
                          <td
                            key={item.id}
                            style={{ border: "0.1px solid #fff" }}
                          ></td>
                        );
                      }

                      return (
                        <td
                          key={item.id}
                          style={{ border: "0.1px solid #fff" }}
                        >
                          {formattedDays}:{formattedHours}:{formattedMinutes}
                        </td>
                      );
                    })
                  ) : (
                    <td colSpan="1" style={{ border: "0.1px solid #fff" }}>
                      0
                    </td>
                  )}
                </tr>
                <tr style={{ backgroundColor: "#e6e6e6" }}>
                  <td
                    style={{
                      backgroundColor: "#0972B6",
                      color: "#fff",
                      border: "0.1px solid #fff",
                    }}
                  >
                    المتبقية
                  </td>
                  {vacationsTypes && vacationsTypes.length > 0 ? (
                    vacationsTypes.map((item) => {
                      let totalDays = 0;
                      let totalHours = 0;
                      let totalMinutes = 0;

                      // للرصيد السنوي (نوع الإجازة رقم 2) نعرض الرصيد المتبقي من الواجهة
                      if (toNumber(item.id) === ANNUAL_VAC_ID) {
                        const remainingDays = Math.max(
                          0,
                          toNumber(annuDays, 0)
                        );
                        // أخذ أول رقمين فقط في حال كان هناك فواصل كثيرة
                        const cleanDays = parseFloat(remainingDays.toFixed(2));
                        totalDays = Math.floor(cleanDays);
                        const decimalPart =
                          (cleanDays - totalDays) * computeDayHours(); // تحويل الكسر إلى ساعات
                        totalHours = Math.floor(decimalPart);
                        totalMinutes = Math.round(
                          (decimalPart - totalHours) * 60
                        );
                      } else {
                        // لباقي أنواع الإجازات نعرض المتبقي من vacationsAmount
                        const rec = vacationsAmount?.find(
                          (it) => toNumber(it.vid) === toNumber(item.id)
                        );
                        if (
                          rec &&
                          rec.rest !== undefined &&
                          rec.rest !== null
                        ) {
                          const min = toNumber(rec.rest, 0);
                          totalHours = Math.floor(min / 60);
                          totalMinutes = min % 60;
                        }
                      }

                      // تحويل الدقائق الزائدة إلى ساعات
                      totalHours += Math.floor(totalMinutes / 60);
                      totalMinutes = totalMinutes % 60;

                      // تحويل الساعات الزائدة إلى أيام
                      {
                        const dHours = computeDayHours();
                        if (totalHours >= dHours) {
                          totalDays += Math.floor(totalHours / dHours);
                          totalHours = totalHours % dHours;
                        }
                      }

                      // تنسيق النتيجة بالتنسيق DD:HH:MM
                      const formattedDays = String(totalDays).padStart(2, "0");
                      const formattedHours = String(totalHours).padStart(
                        2,
                        "0"
                      );
                      const formattedMinutes = String(totalMinutes).padStart(
                        2,
                        "0"
                      );

                      // إذا كانت جميع القيم صفرية، نعرض فراغ
                      if (
                        totalDays === 0 &&
                        totalHours === 0 &&
                        totalMinutes === 0
                      ) {
                        return (
                          <td
                            key={item.id}
                            style={{ border: "0.1px solid #fff" }}
                          ></td>
                        );
                      }

                      return (
                        <td
                          key={item.id}
                          style={{ border: "0.1px solid #fff" }}
                        >
                          {formattedDays}:{formattedHours}:{formattedMinutes}
                        </td>
                      );
                    })
                  ) : (
                    <td colSpan="1" style={{ border: "0.1px solid #fff" }}>
                      00:00:00
                    </td>
                  )}
                </tr>
                <tr style={{ backgroundColor: "#ffe6e6" }}>
                  <td
                    style={{
                      backgroundColor: "#0972B6",
                      color: "#fff",
                      border: "0.1px solid #fff",
                    }}
                  >
                    إجمالي المطلوبة
                  </td>
                  <td
                    colSpan={vacationsTypes ? vacationsTypes.length : 1}
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      border: "0.1px solid #fff",
                    }}
                  >
                    {(() => {
                      // حساب إجمالي المدة المطلوبة (أيام + ساعات + دقائق) من جميع الأنواع
                      let totalDays = 0;
                      let totalHours = 0;
                      let totalMinutes = 0;

                      // جمع جميع الإجازات غير المعتمدة بحسب المدير العام فقط
                      const allPendingTasks =
                        data?.filter((task) => {
                          const gmOk = (task.gerenal_sec || "") === "معتمدة";
                          return !gmOk;
                        }) || [];

                      allPendingTasks.forEach((task) => {
                        const daysCount = computeCalendarDays(
                          task.date_from,
                          task.date_to
                        );
                        const {
                          totalDays: taskDays,
                          totalHours: taskHours,
                          totalMinutes: taskMinutes,
                        } = calculateDuration(daysCount, task.period);
                        totalDays += taskDays;
                        totalHours += taskHours;
                        totalMinutes += taskMinutes;
                      });

                      // تحويل الدقائق الزائدة إلى ساعات
                      totalHours += Math.floor(totalMinutes / 60);
                      totalMinutes = totalMinutes % 60;

                      // تحويل الساعات الزائدة إلى أيام
                      {
                        const dHours = computeDayHours();
                        if (totalHours >= dHours) {
                          totalDays += Math.floor(totalHours / dHours);
                          totalHours = totalHours % dHours;
                        }
                      }

                      // تنسيق النتيجة بالتنسيق DD:HH:MM
                      const formattedDays = String(totalDays).padStart(2, "0");
                      const formattedHours = String(totalHours).padStart(
                        2,
                        "0"
                      );
                      const formattedMinutes = String(totalMinutes).padStart(
                        2,
                        "0"
                      );

                      // إذا كانت جميع القيم صفرية، نعرض فراغ
                      if (
                        totalDays === 0 &&
                        totalHours === 0 &&
                        totalMinutes === 0
                      ) {
                        return "";
                      }

                      return `${formattedDays}:${formattedHours}:${formattedMinutes}`;
                    })()}
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#f0f8ff" }}>
                  <td
                    style={{
                      backgroundColor: "#0972B6",
                      color: "#fff",
                      border: "0.1px solid #fff",
                    }}
                  >
                    إجمالي الممنوحة
                  </td>
                  <td
                    colSpan={vacationsTypes ? vacationsTypes.length : 1}
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      border: "0.1px solid #fff",
                    }}
                  >
                    {(() => {
                      // حساب إجمالي المدة الممنوحة (أيام + ساعات + دقائق) من جميع الأنواع
                      let totalDays = 0;
                      let totalHours = 0;
                      let totalMinutes = 0;

                      // جمع جميع الإجازات المعتمدة بحسب المدير العام فقط
                      const allApprovedTasks =
                        data?.filter((task) => {
                          const gmOk = (task.gerenal_sec || "") === "معتمدة";
                          return gmOk;
                        }) || [];

                      allApprovedTasks.forEach((task) => {
                        const daysCount = computeCalendarDays(
                          task.date_from,
                          task.date_to
                        );
                        const {
                          totalDays: taskDays,
                          totalHours: taskHours,
                          totalMinutes: taskMinutes,
                        } = calculateDuration(daysCount, task.period);
                        totalDays += taskDays;
                        totalHours += taskHours;
                        totalMinutes += taskMinutes;
                      });

                      // تحويل الدقائق الزائدة إلى ساعات
                      totalHours += Math.floor(totalMinutes / 60);
                      totalMinutes = totalMinutes % 60;

                      // تحويل الساعات الزائدة إلى أيام
                      {
                        const dHours = computeDayHours();
                        if (totalHours >= dHours) {
                          totalDays += Math.floor(totalHours / dHours);
                          totalHours = totalHours % dHours;
                        }
                      }

                      // تنسيق النتيجة بالتنسيق DD:HH:MM
                      const formattedDays = String(totalDays).padStart(2, "0");
                      const formattedHours = String(totalHours).padStart(
                        2,
                        "0"
                      );
                      const formattedMinutes = String(totalMinutes).padStart(
                        2,
                        "0"
                      );

                      // إذا كانت جميع القيم صفرية، نعرض فراغ
                      if (
                        totalDays === 0 &&
                        totalHours === 0 &&
                        totalMinutes === 0
                      ) {
                        return "";
                      }

                      return `${formattedDays}:${formattedHours}:${formattedMinutes}`;
                    })()}
                  </td>
                </tr>
                <tr style={{ backgroundColor: "#e6ffe6" }}>
                  <td
                    style={{
                      backgroundColor: "#0972B6",
                      color: "#fff",
                      border: "0.1px solid #fff",
                    }}
                  >
                    إجمالي المتبقية
                  </td>
                  <td
                    colSpan={vacationsTypes ? vacationsTypes.length : 1}
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      border: "0.1px solid #fff",
                    }}
                  >
                    {(() => {
                      // حساب إجمالي المتبقي من جميع الأنواع
                      let totalDays = 0;
                      let totalHours = 0;
                      let totalMinutes = 0;

                      // جمع المتبقي من جميع الأنواع
                      if (vacationsTypes && vacationsTypes.length > 0) {
                        vacationsTypes.forEach((item) => {
                          // للرصيد السنوي (نوع الإجازة رقم 2) نعرض الرصيد المتبقي من الواجهة
                          if (toNumber(item.id) === ANNUAL_VAC_ID) {
                            const remainingDays = Math.max(
                              0,
                              toNumber(annuDays, 0)
                            );
                            // أخذ أول رقمين فقط في حال كان هناك فواصل كثيرة
                            const cleanDays = parseFloat(
                              remainingDays.toFixed(2)
                            );
                            totalDays += Math.floor(cleanDays);
                            const decimalPart =
                              (cleanDays - Math.floor(cleanDays)) *
                              computeDayHours(); // تحويل الكسر إلى ساعات
                            totalHours += Math.floor(decimalPart);
                            totalMinutes += Math.round(
                              (decimalPart - Math.floor(decimalPart)) * 60
                            );
                          } else {
                            // لباقي أنواع الإجازات نعرض المتبقي من vacationsAmount
                            const rec = vacationsAmount?.find(
                              (it) => toNumber(it.vid) === toNumber(item.id)
                            );
                            if (
                              rec &&
                              rec.rest !== undefined &&
                              rec.rest !== null
                            ) {
                              const min = toNumber(rec.rest, 0);
                              const hh = Math.floor(min / 60);
                              const mm = min % 60;
                              totalHours += hh;
                              totalMinutes += mm;
                            }
                          }
                        });
                      }

                      // تحويل الدقائق الزائدة إلى ساعات
                      totalHours += Math.floor(totalMinutes / 60);
                      totalMinutes = totalMinutes % 60;

                      // تحويل الساعات الزائدة إلى أيام
                      {
                        const dHours = computeDayHours();
                        if (totalHours >= dHours) {
                          totalDays += Math.floor(totalHours / dHours);
                          totalHours = totalHours % dHours;
                        }
                      }

                      // تنسيق النتيجة بالتنسيق DD:HH:MM
                      const formattedDays = String(totalDays).padStart(2, "0");
                      const formattedHours = String(totalHours).padStart(
                        2,
                        "0"
                      );
                      const formattedMinutes = String(totalMinutes).padStart(
                        2,
                        "0"
                      );

                      // إذا كانت جميع القيم صفرية، نعرض فراغ
                      if (
                        totalDays === 0 &&
                        totalHours === 0 &&
                        totalMinutes === 0
                      ) {
                        return "";
                      }

                      return `${formattedDays}:${formattedHours}:${formattedMinutes}`;
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* تذييل */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "20px",
              textAlign: "center",
              padding: "6px 0",
              fontSize: "14px",
              borderBottom: "1px solid #ddd",
              borderTop: "1px solid #ddd",
              flexWrap: "nowrap",
              minHeight: "35px",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <div
              style={{
                flex: 1,
                padding: "2px",
                whiteSpace: "nowrap",
                fontWeight: "900",
              }}
            >
              الموظف
            </div>
            <div
              style={{
                flex: 1,
                padding: "2px",
                whiteSpace: "nowrap",
                fontWeight: "900",
              }}
            >
              المسؤول المباشر
            </div>
            <div
              style={{
                flex: 1,
                padding: "2px",
                whiteSpace: "nowrap",
                fontWeight: "900",
              }}
            >
              مدير الإدارة
            </div>
            <div
              style={{
                flex: 1,
                padding: "2px",
                whiteSpace: "nowrap",
                fontWeight: "900",
              }}
            >
              المختص
            </div>
            <div
              style={{
                flex: 1,
                padding: "2px",
                whiteSpace: "nowrap",
                fontWeight: "900",
              }}
            >
              مدير الشؤون
            </div>
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
    </Card>
  );
}
