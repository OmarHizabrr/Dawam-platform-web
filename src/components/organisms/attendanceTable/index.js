/* eslint-disable react-hooks/rules-of-hooks */
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CopyOutlined,
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
  Progress,
  Select,
  Spin,
  Table,
  Typography,
  notification,
} from "antd";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
// import axios from "axios";
import { useCookies } from "react-cookie";
import excel from "xlsx";
import { Env, PrintFonts } from "./../../../styles";
import { calculateDuration } from "../../../utilites/durationCalculator";
import "./style.css";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const { Text } = Typography;
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
export default function attendanceTable(props) {
  console.log("attendanceTable props.setting:", props.setting);
  const [cookies, setCookie, removeCookie] = useCookies(["userId"]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [refreshKey, setRefreshKey] = useState(0); // مفتاح لتحديث البيانات
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isVModalVisible, setIsVModalVisible] = useState(false);
  const [isVacDetailModalVisible, setIsVacDetailModalVisible] = useState(false);
  const [currentVacDetail, setCurrentVacDetail] = useState(null);
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
  const [excludedDates, setExcludedDates] = useState([]); // الأيام المستثناة من الإعدادات
  const [dailySalary, setDailySalary] = useState(0); // الراتب اليومي لحساب خصم الغياب
  const [editingRecord, setEditingRecord] = useState(null);

  const totalDiscounts = useMemo(() => {
    return (data || []).reduce((sum, record) => {
      return sum + (Number(record?.discount) || 0);
    }, 0);
  }, [data]);

  // حساب أيام الإجازات الأسبوعية من الإعدادات باستخدام useMemo لتجنب الحلقات اللانهائية
  const weekendDays = useMemo(() => {
    const weekendDaysSetting = props.setting.filter(
      (item) => item.key === "admin.weekend_days"
    )[0]?.value;

    if (weekendDaysSetting) {
      try {
        const parsedDays = JSON.parse(weekendDaysSetting);
        return Array.isArray(parsedDays) ? parsedDays : [];
      } catch (error) {
        console.log("خطأ في تحليل أيام الإجازات:", error);
        return [];
      }
    }
    return [];
  }, [props.setting]);

  var allWorkHours = 0;
  var allLateTimes = 0;
  var allVacHours = 0;
  var allBonusTimes = 0;
  var allDiscounts = 0.0;

  let curr = props.setting.filter((item) => item.key == "admin.currency")[0]
    ?.value;

  // دالة لتوليد جميع الأيام في النطاق الزمني
  const generateAllDays = (startDate, endDate) => {
    const days = [];
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    let current = start;

    // أسماء الأيام بالعربية (0 = الأحد، 6 = السبت)
    const dayNames = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];

    while (current.isBefore(end) || current.isSame(end, "day")) {
      const dateStr = current.format("YYYY-MM-DD");
      const dayOfWeek = current.day(); // 0 = الأحد، 6 = السبت
      const arDayName = dayNames[dayOfWeek];

      days.push({
        date: dateStr,
        dayName: arDayName,
        attendance_time: null,
        leave_time: null,
        workHours: "00:00:00",
        vacHours: "00:00:00",
        lateTime: "00:00:00",
        discount: 0,
        types: null,
        bonusTime: "00:00:00",
        notes: "",
        have_vac: "0",
        extra_attendance: [],
      });

      current = current.add(1, "day");
    }

    return days;
  };

  // دالة لتنسيق الوقت
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    return dayjs(dateTimeString, "YYYY-MM-DD HH:mm:ss")
      .locale("en") // يضمن عرض AM/PM
      .format("hh:mm:ss A");
  };

  // دالة لدمج بيانات الحضور مع جميع الأيام
  const mergeAttendanceData = useCallback(
    (
      attendanceData,
      allDays,
      excludedDatesList = [],
      dailySalaryValue = 0,
      weekendDaysList = [],
      baseSalary = 0,
      vacationsList = []
    ) => {
      // حساب الراتب اليومي الاحتياطي (الراتب / 30) إذا لم يتوفر من API
      const fallbackDailySalary = baseSalary > 0 ? baseSalary / 30 : 0;
      const effectiveDailySalary =
        dailySalaryValue > 0 ? dailySalaryValue : fallbackDailySalary;

      // إنشاء خريطة لبيانات الحضور باستخدام التاريخ كمفتاح
      const attendanceMap = new Map();
      attendanceData.forEach((item) => {
        const existing = attendanceMap.get(item.date);
        // نفضل السجل المعتمد إذا كان لدينا دبلومات لنفس التاريخ (بسبب الـ join في الباك إند)
        if (!existing || Number(item.accepted) > Number(existing.accepted)) {
          attendanceMap.set(item.date, item);
        }
      });

      // دمج البيانات
      const mergedData = allDays.map((day) => {
        const attendance = attendanceMap.get(day.date);
        const currentDay = dayjs(day.date);

        // البحث عن إجازة لهذا اليوم من القائمة الكلية
        const matchingVacation = Array.isArray(vacationsList)
          ? vacationsList.find((v) => {
            if (!v.date_from || !v.date_to) return false;
            const vacStart = dayjs(v.date_from).startOf("day");
            const vacEnd = dayjs(v.date_to).endOf("day");
            return (
              currentDay.isSameOrAfter(vacStart) &&
              currentDay.isSameOrBefore(vacEnd)
            );
          })
          : null;

        // التحقق من حالة الاعتماد: نفضل البيانات من السجل نفسه (المحسوبة في الباك إند)
        // ونستخدم القائمة الكلية كدعم إضافي
        const isHRApproved =
          (attendance && Number(attendance.accepted) === 1) ||
          (matchingVacation && Number(matchingVacation.accepted) === 1);

        if (attendance) {
          // التحقق من إذا كان اليوم مستثنى
          const isExcluded =
            attendance.is_excluded === 1 ||
            attendance.is_excluded === "1" ||
            excludedDatesList.includes(day.date);

          let finalDiscount = Number(attendance.discount) || 0;

          // إذا كان اليوم مستثنى، يجب أن يكون discount = 0 دائماً
          if (isExcluded) {
            finalDiscount = 0;
          } else if (isHRApproved) {
            // إذا كان معتمداً من الموارد البشرية (إجازة مقبولة)، يتم تصفير الخصم (إن وجد)
            finalDiscount = 0;
          }
          // بخلاف ذلك، سنحتفظ بالقيمة الآتية من السيرفر (والتي قد تكون 0، أو قيمة الخصم الفعلية)
          // ولا نحتاج لإعادة كتابتها بقيمة (effectiveDailySalary) لأن الباك اند هو المسؤول الآن.

          return {
            ...day,
            ...attendance,
            discount: finalDiscount,
            is_excluded: isExcluded ? 1 : 0,
            vac_id: attendance?.vac_id || matchingVacation?.id,
            accepted: attendance?.accepted !== undefined ? attendance.accepted : matchingVacation?.accepted,
            vac_type_name: attendance?.vac_type_name || matchingVacation?.vac_type_name,
          };
        }

        // إذا لم تكن هناك بيانات حضور من API (يوم غياب كامل لم يظهر في السجلات)
        const isExcluded = excludedDatesList.includes(day.date);

        let discount = 0;
        if (isExcluded) {
          discount = 0;
        } else if (isHRApproved) {
          discount = 0;
        } else {
          // جلب الخصم المحسوب من الباك اند من مصفوفة Days إذا كانت متوفرة في الرابط البديل
          const backendDay = attendanceData.find(d => d.date === day.date);
          discount = backendDay && backendDay.discount !== undefined ? Number(backendDay.discount) : effectiveDailySalary;
        }

        return {
          ...day,
          discount: discount,
          is_excluded: isExcluded ? 1 : 0,
          vac_id: matchingVacation?.id,
          accepted: matchingVacation?.accepted,
          vac_status: matchingVacation?.accepted, // التأكد من تمرير الحالة للأيقونة حتى عند الغياب
          have_vac: matchingVacation ? "1" : "0", // ضمان ظهور الأيقونة عند وجود إجازة في يوم غياب
          vac_type_name: matchingVacation?.vac_type_name,
        };
      });

      // ترتيب البيانات حسب التاريخ
      return mergedData.sort((a, b) => {
        return dayjs(b.date).unix() - dayjs(a.date).unix();
      });
    },
    []
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // حماية من التواريخ غير الصالحة قبل أي طلب
    if (!start || !end || start === "Invalid Date" || end === "Invalid Date") {
      return;
    }

    // جلب الأيام المستثناة من الإعدادات (type=1 في جدول dates + أيام الإجازات الأسبوعية)
    // نحاول استخدام API موجود أو نستخدم منطق بديل
    FirebaseServices.getExcludedDates(props.user.user_id, start, end)
      .then((data) => {
        let excluded = [];
        if (Array.isArray(data)) {
          excluded = data.map((item) => {
            if (typeof item === "string") return item;
            return item.date || item;
          });
        }
        setExcludedDates(excluded);
      })
      .catch(function (error) {
        console.log("Error fetching excluded-dates", error);
        setExcludedDates([]);
      });

    FirebaseServices.getAttendanceLogs(props.user.user_id, start, end)
      .then((data) => {
        originalAttendanceDataRef.current = data || [];

        // توليد جميع الأيام في النطاق الزمني
        const allDays = generateAllDays(start, end);
        // دمج بيانات الحضور مع جميع الأيام (مع حساب الخصم للأيام بدون حضور)
        // نستخدم excludedDates الحالية (قد تكون فارغة في البداية، لكن سيتم تحديثها لاحقاً)
        const mergedData = mergeAttendanceData(
          originalAttendanceDataRef.current,
          allDays,
          excludedDates,
          dailySalary,
          weekendDays,
          salary || props.user.salary || 0,
          vacations
        );
        setData(mergedData);
      })
      .catch(function (error) {
        console.log(error);
        // في حالة الخطأ، نعرض على الأقل جميع الأيام
        const allDays = generateAllDays(start, end);
        setData(allDays);
        setPData(allDays);
      });

    FirebaseServices.getDawamInfo(props.user.user_id, start, end)
      .then((data) => {
        setTotalDays(data.count?.[0]?.count || 0);
        settotalAtt(data.data?.[0]?.attendanceDays || 0);
        setTotalLate(data.data?.[0]?.lateTime || 0);
        setTotalLatePrice(data.data?.[0]?.lateTimePrice || 0);
        const salaryValue = data.data?.[0]?.salary || 0;
        const totalDaysValue = data.count?.[0]?.count || 0;
        setSalary(salaryValue);
        const dsalaryFromAPI = data.data?.[0]?.dsalary || 0;
        setDsalary(dsalaryFromAPI);
        setDailySalary(dsalaryFromAPI);
        setVacations(data.vacs);
        setVacationsTypes(data.vacstypes);
        setVacationsAmount(data.tasksAmount);
        setTotalVacs(data.totalvacs);
        setTotalDebt(data.debt?.[0]?.["amount"] || 0);
        setTotalLoan(data.long_debt?.[0]?.["amount"] || 0);
        console.log(data.data?.[0]?.lateTimePrice);

        const listsData = Array.isArray(data.lists)
          ? data.lists[0]
          : data.lists;

        const lateTimePrice = parseFloat(listsData?.lateTimePrice || 0);
        const totalCount = parseInt(data.count?.[0]?.count || 0);
        const attendanceDays = parseInt(listsData?.["attendanceDays"] || 0);
        const salary = parseFloat(listsData?.salary || 0);

        let starValue = 0;

        // التأكد من أن الراتب ليس صفراً قبل الحساب
        if (salary > 0 && totalCount > 0) {
          const absentDays = totalCount - attendanceDays;
          // Use exact daily salary from API to match wages report logic
          // Fallback to salary / totalCount if API value is missing
          const dsalaryRate = dsalaryFromAPI > 0 ? dsalaryFromAPI : (salary / totalCount);
          const absentDaysCost = absentDays * dsalaryRate;
          const totalDeductions = lateTimePrice + absentDaysCost;
          starValue = 1 - totalDeductions / salary;

          // التأكد من أن النتيجة بين 0 و 1
          starValue = Math.max(0, Math.min(1, starValue));
        } else if (salary > 0) {
          // إذا كان الراتب موجود ولكن لا توجد أيام عمل، النسبة 0
          starValue = 0;
        }

        // التأكد من أن القيمة ليست NaN
        if (isNaN(starValue) || !isFinite(starValue)) {
          starValue = 0;
        }

        setStar(starValue);
        setLoad(false);
      })
      .catch(function (error) {
        console.log("API Error:", error);
        // إضافة قيم افتراضية في حالة الخطأ
        setTotalDebt(0);
        setTotalLoan(0);
        setStar(0);
        setLoad(false);
      });
    setLoad(true);

    FirebaseServices.getTasksTypes()
      .then((data) => {
        setTstypes(
          data.map((t) => ({ ...t, value: Number(t.value) }))
        );
        //setLoadt(false);
      })
      .catch(function (error) {
        console.log(error);
      });
  }, [
    start,
    end,
    props.user.user_id,
    mergeAttendanceData,
    refreshKey,
  ]);

  // useEffect منفصل لتحديث البيانات عند تحديث excludedDates أو dailySalary
  // نستخدم useRef لتخزين البيانات الأصلية من API
  const originalAttendanceDataRef = useRef([]);

  useEffect(() => {
    if (originalAttendanceDataRef.current.length > 0) {
      // إعادة دمج البيانات مع excludedDates المحدثة
      const allDays = generateAllDays(start, end);
      const mergedData = mergeAttendanceData(
        originalAttendanceDataRef.current,
        allDays,
        excludedDates,
        dailySalary,
        weekendDays,
        salary,
        vacations
      );
      setData(mergedData);
    }
  }, [
    excludedDates,
    dailySalary,
    start,
    end,
    weekendDays,
    salary,
    vacations,
    mergeAttendanceData,
  ]);

  // جميع الأيام تظهر (حتى المستثناة) لتقديم المهام والإجازات
  // لكن الخصم = 0 للأيام المستثناة

  useEffect(() => {
    setPData(data);
  }, [data]);

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

  // useEffect لتحديث النموذج عند فتح النافذة أو تغيير السجل المعدل
  useEffect(() => {
    console.log("Modal useEffect Triggered - isVModalVisible:", isVModalVisible, "editingRecord:", editingRecord);

    if (isVModalVisible && editingRecord) {
      if (editingRecord.vac_id) {
        console.log("Mode: EDIT existing vacation", editingRecord.vac_id);
        const fromValue = editingRecord.vac_date_from;
        const toValue = editingRecord.vac_date_to;
        const typeId = Number(editingRecord.vacationtype_id || editingRecord.type);
        const fromDate = parseDateValue(fromValue);
        const toDate = parseDateValue(toValue);

        console.log("Setting values for edit:", { fromValue, toValue, typeId });

        setDatefromValue(fromValue);
        setDatetoValue(toValue);
        setType(typeId);
        setNotes(editingRecord.vac_note || "");

        const timeoutId = setTimeout(() => {
          console.log("Resetting form fields (Edit mode)");
          form.setFieldsValue({
            date_range: [fromDate, toDate],
            task_type: typeId,
            notes: editingRecord.vac_note || "",
          });
          if (fromDate && toDate) checkPeriod(null, [fromDate, toDate]);
          getGivenRest(typeId, fromValue);
        }, 100);

        return () => clearTimeout(timeoutId);
      } else {
        console.log("Mode: NEW vacation request");
        const durationStart = props.setting.find(i => i.key == "duration_start")?.value || "07:00:00";
        const durationEnd = props.setting.find(i => i.key == "duration_end")?.value || "14:00:00";

        const recordDate = editingRecord.date || editingRecord.vac_date || dayjs().format("YYYY-MM-DD");
        const fromValue = recordDate + " " + durationStart;
        const toValue = recordDate + " " + durationEnd;

        console.log("Computed initial times for new request:", { recordDate, fromValue, toValue });

        setDatefromValue(fromValue);
        setDatetoValue(toValue);

        const fromDate = parseDateValue(fromValue);
        const toDate = parseDateValue(toValue);

        console.log("Parsed new leave dates:", { fromDate: fromDate?.toString(), toDate: toDate?.toString() });

        form.setFieldsValue({
          date_range: [fromDate, toDate],
        });

        if (fromDate && toDate) checkPeriod(null, [fromDate, toDate]);
      }
    } else if (!isVModalVisible) {
      console.log("Modal Visibility is FALSE, resetting states");
      setEditingRecord(null);
    }
  }, [isVModalVisible, editingRecord]);

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

    //var report=document.body;
    var mywindow = window.open("");
    mywindow.document.write(
      "<html><head><title></title> <style>" +
      PrintFonts.getPrintFontsCSS() +
      "body{font-size:12px;margin:0} " +
      "</style><style type='text/css' media='print'>@page { size: A4 landscape; print-color-adjust: exact !important;  -webkit-print-color-adjust: exact !important;}</style>"
    );
    mywindow.document.write('</head><body dir="rtl" style="font-size:12px;" >');
    mywindow.document.write(report.innerHTML);
    mywindow.document.write("</body></html>");
    mywindow.print(); // change window to mywindow
    // mywindow.close();

    /*        var printContents = document.getElementById("att-report").innerHTML;
        var originalContents = document.body.innerHTML;
    
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;*/
  };
  const showModal = (record) => {
    setDetailedDay(record.date);
    FirebaseServices.getRecordDetails(props.user.user_id, record.date)
      .then((data) => {
        setSelected(data);
      })
      .catch(function (error) {
        console.log(error);
      });

    setIsModalVisible(true);
  };
  const showVacationModal = (record) => {
    console.log("showVacationModal called with record:", record);
    if (Number(record.accepted) === 1) {
      notification.warning({
        message: "تنبيه",
        description: "تم اعتماد هذه الإجازة من قبل الشؤون ولا يمكنك تعديلها. يرجى مراجعة الشؤون لتعديل إجازتك.",
        placement: "bottomRight",
      });
      return;
    }
    setEditingRecord(record);
    setIsVModalVisible(true);
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
  const handleVOk = () => {
    var values = {
      user_id: props.user.user_id,
      startDate: datefromValue,
      endDate: datetoValue,
      type: type,
      note: notes,
    };

    const endpoint = editingRecord?.vac_id ? `update-task` : `add-task`;
    const payload = editingRecord?.vac_id ? { ...values, id: editingRecord.vac_id } : values;

    FirebaseServices.saveVacationTask(payload, editingRecord?.vac_id != null)
      .then(function (response) {
        openNotification("bottomLeft", <Text>{editingRecord?.vac_id ? "تم تحديث الإجازة بنجاح" : "تم إرسال الإجازة بنجاح"}</Text>);
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
        // التحديث التلقائي للبيانات بعد الحفظ
        setRefreshKey((prev) => prev + 1);
        props.onUpdate && props.onUpdate();
      })
      .catch(function (error) {
        console.log(error);
        if (error.response.status == 409) {
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
      title: "التأخرات",
      dataIndex: "lateTime",
      key: "lateTime",
      sorter: (a, b) => a.lateTime.length - b.lateTime.length,
      sortOrder: sortedInfo.columnKey === "lateTime" && sortedInfo.order,
      ellipsis: true,
      render: (lateTime, record, _) => <Text>{lateTime}</Text>,
    },
    {
      title: "خصميات",
      dataIndex: "discount",
      key: "discount",
      sorter: (a, b) => a.discount - b.discount,
      sortOrder: sortedInfo.columnKey === "discount" && sortedInfo.order,
      ellipsis: false,
      render: (discount) => {
        return <Text>{Math.round(discount) + " " + curr}</Text>;
      },
    },
    {
      title: "الإجازات",
      width: "80px",
      dataIndex: "have_vac",
      key: "have_vac",
      ellipsis: true,
      render: (have_vac, record, _) => {
        let statusText = "في انتظار الاعتماد";
        let color = "#8c8c8c"; // الافتراضي رمادي (في انتظار الاعتماد)
        if (record.vac_status == 4) {
          color = "#991b1b"; // أحمر داكن (مرفوضة من الشؤون)
          statusText = "مرفوضة من الشؤون";
        } else if (record.vac_status == 3) {
          color = "#f87171"; // أحمر فاتح (مرفوضة من مدير الإدارة)
          statusText = "مرفوضة من مدير الإدارة";
        } else if (record.vac_status == 2) {
          color = "#0972B6"; // أزرق (معتمدة من الشؤون)
          statusText = "معتمدة من الشؤون";
        } else if (record.vac_status == 1) {
          color = "#52c41a"; // أخضر (معتمدة من مدير الإدارة)
          statusText = "معتمدة من مدير الإدارة";
        }

        return (
          <>
            {(record.have_vac == "1" || record.vac_status != null) && (
              <div
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setCurrentVacDetail({
                    ...record,
                    statusText: statusText,
                    color: color,
                  });
                  setIsVacDetailModalVisible(true);
                }}
              >
                <CopyOutlined
                  size={100}
                  style={{
                    marginLeft: "10px",
                    color: color,
                    fontSize: record.vac_status > 0 ? "18px" : "16px",
                  }}
                />
              </div>
            )}
          </>
        );
      },
    },
    {
      title: "التفاصيل",
      key: "action",
      render: (vid, record, index) => {
        return (
          <Button
            onClick={function () {
              showModal(record);
            }}
            type="primary"
            shape="round"
            icon={<SwapOutlined />}
          ></Button>
        );
      },
    },
    {
      title: "تقديم",
      key: "action",
      render: (vid, record, index) => {
        return (
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
        );
      },
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
      title: "التأخرات",
      dataIndex: "lateTime",
      key: "lateTime",
      sorter: (a, b) => a.lateTime.length - b.lateTime.length,
      sortOrder: sortedInfo.columnKey === "lateTime" && sortedInfo.order,
      ellipsis: true,
      render: (lateTime) => lateTime?.toHHMMSS(),
    },
    {
      title: "الدوام الإضافي",
      dataIndex: "bonusTime",
      key: "bonusTime",
      sorter: (a, b) => a.bonusTime.length - b.bonusTime.length,
      sortOrder: sortedInfo.columnKey === "bonusTime" && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: "نوع الدوام",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.length - b.name.length,
      sortOrder: sortedInfo.columnKey === "name" && sortedInfo.order,
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
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleVCancel = () => {
    setIsVModalVisible(false);
    setDatefromValue(null);
    setDatetoValue(null);
    setTotalVac("");
    setType(null);
    setNotes("");
    form.resetFields();
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
  const parseDateValue = (dateValue) => {
    if (!dateValue) {
      return null;
    }
    // جرب تنسيقات مختلفة
    let date = dayjs(dateValue, "YYYY-MM-DD HH:mm:ss", true);
    if (!date.isValid()) {
      date = dayjs(dateValue, "YYYY-MM-DD HH:mm", true);
    }
    if (!date.isValid()) {
      date = dayjs(dateValue, "YYYY-MM-DD", true);
    }
    if (!date.isValid()) {
      date = dayjs(dateValue);
    }

    if (!date.isValid()) {
      console.error("parseDateValue: Failed to parse value:", dateValue);
    }
    return date.isValid() ? date : null;
  };

  const onRangeChange = (all, dates) => {
    checkPeriod(all, dates);
    if (dates && dates[0]) {
      setDatefromValue(dates[0].format("YYYY-MM-DD HH:mm"));
    } else {
      setDatefromValue(null);
    }
    if (dates && dates[1]) {
      setDatetoValue(dates[1].format("YYYY-MM-DD HH:mm"));
    } else {
      setDatetoValue(null);
    }
  };

  const onRangeOk = (dates) => {
    // تحديث القيم عند التأكيد بشكل صريح
    if (dates && dates[0] && dates[1]) {
      setDatefromValue(dates[0].format("YYYY-MM-DD HH:mm"));
      setDatetoValue(dates[1].format("YYYY-MM-DD HH:mm"));
      checkPeriod(null, dates);
    }
  };
  return (
    <Layout className="attendance">
      <Modal
        key={isVModalVisible ? (editingRecord?.vac_id || editingRecord?.date || 'new') : 'none'}
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
                parseDateValue(datefromValue),
                parseDateValue(datetoValue),
              ]}
              showTime={{
                format: "HH:mm",
              }}
              format="YYYY-MM-DD HH:mm"
              onChange={function (all, dates) {
                onRangeChange(all, dates);
              }}
              onOk={function (dates) {
                onRangeOk(dates);
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
              value={type}
              onChange={handleTypeChange}
              options={tstypes}
              placeholder="نوع الإجازة"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? "").localeCompare(optionB?.label ?? "")
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
        title="تفاصيل الإجازة / المهمة"
        visible={isVacDetailModalVisible}
        onCancel={() => setIsVacDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setIsVacDetailModalVisible(false)}
          >
            إغلاق
          </Button>,
        ]}
      >
        {currentVacDetail && (
          <div style={{ fontSize: "16px", lineHeight: "1.8" }}>
            <div style={{ marginBottom: "12px" }}>
              <strong>نوع الإجازة:</strong>{" "}
              <Text style={{ marginRight: "8px" }}>
                {currentVacDetail.vac_type_name ||
                  currentVacDetail.types ||
                  "غير محدد"}
              </Text>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong>الحالة:</strong>{" "}
              <Text
                style={{
                  color: currentVacDetail.color,
                  fontWeight: "bold",
                  marginRight: "8px",
                }}
              >
                {currentVacDetail.statusText}
              </Text>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong>المدة:</strong>{" "}
              <Text
                style={{ marginRight: "8px", fontWeight: "600", color: "#389e0d" }}
              >
                {(() => {
                  const dailyWorkingHours = props.user?.dailyWorkingHours || 7;
                  const duration = calculateDuration(
                    currentVacDetail.vac_date_from,
                    currentVacDetail.vac_date_to,
                    dailyWorkingHours
                  );
                  if (typeof duration === "string") return duration;
                  if (duration.type === "time-only") return duration.time;
                  return (
                    <span>
                      {duration.days} {duration.hours ? `(${duration.hours})` : ""}
                    </span>
                  );
                })()}
              </Text>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong>الفترة:</strong>{" "}
              <Text dir="ltr" style={{ marginRight: "8px" }}>
                {currentVacDetail.vac_date_from
                  ?.split(":")
                  .slice(0, 2)
                  .join(":")}{" "}
                {" -> "}{" "}
                {currentVacDetail.vac_date_to?.split(":").slice(0, 2).join(":")}
              </Text>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong> الملاحظات:</strong>
              <div
                style={{
                  padding: "12px",
                  background: "#f8f9fa",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  marginTop: "8px",
                  whiteSpace: "pre-wrap",
                  fontSize: "14px",
                  color: "#495057",
                  minHeight: "60px",
                }}
              >
                {currentVacDetail.vac_note ||
                  currentVacDetail.notes ||
                  "لا توجد ملاحظات"}
              </div>
            </div>
          </div>
        )}
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
      <Card bordered>
        <div className="attHeader">
          <div className="attPer">
            <span>
              <Progress
                type="circle"
                percent={Math.round((totalAtt / totalDays) * 100)}
                width={window.innerWidth <= 760 ? 60 : 70}
                style={{ marginLeft: "5px", display: "inline-block" }}
              />
            </span>
            {window.innerWidth <= 760 ? (
              <>{totalAtt + " من " + totalDays} يومًا </>
            ) : (
              <span
                style={{
                  display: "flex",
                  flexDirection: "column",
                  paddingTop: "10px",
                  marginRight: "5px",
                }}
              >
                <div style={{ marginBottom: "5px" }}>
                  الدوام المطلوب : <span>{totalDays}</span> يوم{" "}
                </div>
                <div>
                  الدوام الفعلي : <span>{totalAtt}</span> يوم{" "}
                </div>
              </span>
            )}
          </div>
          <div className="disPer">
            <span>
              <Progress
                type="circle"
                percent={salary > 0 ? Math.round((totalDiscounts / salary) * 100) : 0}
                width={window.innerWidth <= 760 ? 60 : 70}
                style={{ marginLeft: "5px", display: "inline-block" }}
              />
            </span>
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                paddingTop: "10px",
                marginRight: "5px",
                fontSize: "14px",
              }}
            >
              <div style={{ marginBottom: "5px" }}>
                التأخرات :{" "}
                {window.innerWidth <= 760 ? (
                  <>{parseInt(totalLate / 60) + ":" + (totalLate % 60)}</>
                ) : (
                  <span>
                    {parseInt(totalLate / 60)} ساعة و {totalLate % 60} دقيقة{" "}
                  </span>
                )}
              </div>
              <div>
                {window.innerWidth <= 760 ? "الخصم" : "إجمالي الخصم"} :{" "}
                <span>{Math.round(totalDiscounts)}</span> {curr}
              </div>
            </span>
          </div>
          <div className="attOper" style={{ marginBottom: "20px" }}>
            {window.innerWidth <= 760 ? (
              <></>
            ) : (
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
            )}
            <div className="attOperRange">
              <span>اختر فترة : </span>
              <RangePicker
                needConfirm={true}
                inputReadOnly={window.innerWidth <= 760}
                value={[dayjs(start, "YYYY-MM-DD"), dayjs(end, "YYYY-MM-DD")]}
                style={{ width: "230px" }}
                onChange={changeRange}
              />
            </div>
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
            // إذا كان اليوم مستثنى، لا نطبق اللون البرتقالي
            const isExcluded =
              record.is_excluded === 1 ||
              record.is_excluded === "1" ||
              weekendDays.includes(record.dayName) ||
              excludedDates.includes(record.date);

            // اللون البرتقالي يظهر فقط للأيام غير المستثناة التي لا يوجد فيها حضور ولم يتم اعتماد إجازة لها
            if (
              !isExcluded &&
              (record.attendance_time == null || record.leave_time == null) &&
              !(record.vac_status >= 1)
            ) {
              bc = "#FCEF96";
            }

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
                style={{ fontSize: " 18px", marginBottom: " 5px", margin: "0" }}
              >
                السجل التفصيلي للموظف
              </h1>
              <h2
                style={{ fontSize: " 14px", fontWeight: " 200", margin: "0" }}
              >
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
                      الدوام المطلوب : <span>{totalDays}</span> يوم{" "}
                    </div>
                    <div>
                      أيام الغياب : <span>{totalDays - totalAtt}</span> يوم{" "}
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
                      التأخرات : <span>{totalLate}</span> دقيقة{" "}
                    </div>
                    <div>
                      إجمالي الخصم : <span>{Math.round(totalDiscounts)}</span> {curr}
                    </div>
                    <div>
                      نسبة الانضباط:{" "}
                      {isNaN(star) || !isFinite(star)
                        ? "0%"
                        : Math.round(star * 100) + "%"}
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
                  <th style={{ fontWeight: "100" }}>التاريح</th>
                  <th style={{ fontWeight: "100" }}>الحضور</th>
                  <th style={{ fontWeight: "100" }}>الانصراف</th>
                  <th style={{ fontWeight: "100" }}>ساعات العمل</th>
                  <th style={{ fontWeight: "100" }}>التأخرات</th>
                  <th style={{ fontWeight: "100" }}>الإجازات</th>
                  <th style={{ fontWeight: "100" }}>نوع الإجازة</th>
                  <th style={{ fontWeight: "100" }}>الوقت الفائض</th>
                  <th style={{ fontWeight: "100" }}>مبلغ الخصم</th>
                  <th style={{ fontWeight: "100", width: " 300px" }}>
                    ملاحظات
                  </th>
                </tr>
              </thead>
              <tbody>
                {pdata.flatMap((item, idx) => {
                  allWorkHours += convertTimeToSeconds(item.workHours);
                  allLateTimes += convertTimeToSeconds(item.lateTime);
                  allVacHours += convertTimeToSeconds(item.vacHours);
                  allBonusTimes += convertTimeToSeconds(item.bonusTime);
                  allDiscounts += item.discount * 1;

                  // التحقق من إذا كان اليوم مستثنى
                  const isExcluded =
                    item.is_excluded === 1 ||
                    item.is_excluded === "1" ||
                    weekendDays.includes(item.dayName) ||
                    excludedDates.includes(item.date);

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
                          // إذا كان اليوم مستثنى، نستخدم الألوان العادية (أبيض/رمادي)
                          isExcluded
                            ? idx % 2 !== 0
                              ? "#e6e6e6"
                              : "#fff"
                            : item.attendance_time ||
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
                      <td>{item.lateTime}</td>
                      <td>{item.vacHours}</td>
                      <td>{item.types ? item.types : ""}</td>
                      <td>{item.bonusTime}</td>
                      <td>
                        {new Intl.NumberFormat("en-EN").format(
                          Math.round(item.discount)
                        ) +
                          " " +
                          curr}
                      </td>
                      <td style={{ width: "300px" }}>{item.notes}</td>
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
                    // style={{
                    //   height: "25px",
                    //   backgroundColor:
                    //     (idx + i + 1) % 2 !== 0 ? "#e8f5e9" : "#fffde7",
                    // }}
                    >
                      {/* <td>{item.dayName}</td> */}
                      {/* <td>{item.date}</td> */}
                      <td>{"-"}</td>
                      <td>{"-"}</td>
                      <td>{formatTime(extra.in)}</td>
                      <td>{formatTime(extra.out)}</td>
                      <td>{"-"}</td>
                      <td>{"-"}</td>
                      <td>{"-"}</td>
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
                  <td>{allLateTimes.toString().toHHMMSS()}</td>
                  <td>{allVacHours.toString().toHHMMSS()}</td>
                  <td>{"-"}</td>
                  <td>{allBonusTimes.toString().toHHMMSS()}</td>
                  <td>
                    {new Intl.NumberFormat("en-EN").format(
                      Math.round(allDiscounts)
                    ) +
                      " " +
                      curr}
                  </td>
                  <td>{"-"}</td>
                </tr>
              </tbody>

              {/* <tbody>
             
             {pdata.map(item=>{

               allWorkHours+=convertTimeToSeconds(item.workHours);
               allLateTimes+=convertTimeToSeconds(item.lateTime);
               allVacHours+=convertTimeToSeconds(item.vacHours);
               allBonusTimes+=convertTimeToSeconds(item.bonusTime);
               allDiscounts+=item.discount*1;

               return(
              <tr style={{height: " 25px",backgroundColor:item.attendance_time || item.discount==0 || item.types ?data.indexOf(item) %2!=0?'#e6e6e6':'#fff':'rgb(233 184 184)'}}>
                <td>{item.dayName}</td>
                <td>{item.date}</td>
                <td>{item.attendance_time}</td>
                <td>{item.leave_time}</td>
                <td>{item.workHours}</td>
                <td>{item.lateTime}</td>
                <td>{item.vacHours}</td>
                <td>{item.types?item.types:''}</td>
                <td>{item.bonusTime}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(item.discount))+" "+curr}</td>
                <td style={{width: "300px"}}>{item.notes}</td>
              </tr>);
             })}
             <tr style={{color:"#fff",backgroundColor: "#0972B6",height: "30px"}}>
                <td colSpan={4}>الإجمالي</td>
                <td>{allWorkHours.toString().toHHMMSS()}</td>
                <td>{allLateTimes.toString().toHHMMSS()}</td>
                <td>{allVacHours.toString().toHHMMSS()}</td>
                <td>{"-"}</td>
                <td>{allBonusTimes.toString().toHHMMSS()}</td>
                <td>{new Intl.NumberFormat('en-EN').format(Math.round(allDiscounts))+" "+curr}</td>
                <td>{"-"}</td>
                </tr>
            </tbody> */}
            </table>
          </div>
          <div
            style={{ display: "flex", flexDirection: "row", marginTop: "20px" }}
          >
            <table
              style={{
                fontSize: "12px",
                width: "50%",
                textAlign: "center",
                paddingLeft: "20px",
              }}
            >
              <caption style={{ fontWeight: "900" }}>خلاصة الإجازات</caption>
              <thead>
                <tr
                  style={{
                    color: "#fff",
                    backgroundColor: "#0972B6",
                    height: "30px",
                  }}
                >
                  <th style={{ fontWeight: "100" }}>نوع الإجازة</th>
                  {vacationsTypes.map((item, idx) => (
                    <th key={idx} style={{ fontWeight: "100" }}>
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ backgroundColor: " #0972B6", color: "#fff" }}>
                    الممنوحة
                  </td>
                  {vacationsTypes.map((item, idx) => (
                    <td key={idx} rowSpan={item.days ? 1 : 2}>
                      {vacations.find((it) => it.id == item.id)
                        ? vacations.find((it) => it.id == item.id).cumHours
                        : 0}
                    </td>
                  ))}
                </tr>
                <tr style={{ backgroundColor: "#e6e6e6" }}>
                  <td style={{ backgroundColor: "#0972B6", color: "#fff" }}>
                    المتبقية
                  </td>
                  {vacationsTypes.map((item, idx) => {
                    var min = vacationsAmount.find((it) => it.vid == item.id)
                      ? vacationsAmount.find((it) => it.vid == item.id).rest
                      : 0;
                    return (
                      <td key={idx} style={{ display: item.days > 0 ? "" : "none" }}>
                        {parseInt(min / 60) + ":" + (min % 60)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
            <table
              style={{
                fontSize: "12px",
                width: "50%",
                textAlign: "center",
                paddingRight: "20px",
              }}
            >
              <caption style={{ fontWeight: "900" }}>خلاصة الخصميات</caption>
              <thead>
                <tr
                  style={{
                    color: "#fff",
                    backgroundColor: "#0972B6",
                    height: "30px",
                  }}
                >
                  <th style={{ fontWeight: "100" }}>نوع الخصم</th>
                  <th style={{ fontWeight: "100" }}>الاستحقاق</th>
                  <th style={{ fontWeight: "100" }}>غياب</th>
                  <th style={{ fontWeight: "100" }}>تأخرات</th>
                  <th style={{ fontWeight: "100" }}>سلفة</th>
                  <th style={{ fontWeight: "100" }}>أقساط</th>
                  <th style={{ fontWeight: "100" }}>الإجمالي</th>
                  <th style={{ fontWeight: "100" }}>صافي الاستحقاق</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ height: "20px" }}>
                  <td style={{ backgroundColor: "#0972B6", color: "#fff" }}>
                    المبلغ
                  </td>
                  <td>
                    {new Intl.NumberFormat("en-EN").format(
                      props.user.status == 16
                        ? props.user.salary
                        : props.user.salary * pdata.length
                    ) +
                      " " +
                      curr}
                  </td>
                  <td>
                    {new Intl.NumberFormat("en-EN").format(
                      Math.round(
                        props.user.status == 16
                          ? dsalary * (totalDays - totalAtt)
                          : (pdata.length - totalAtt) * props.user.salary
                      )
                    ) +
                      " " +
                      curr}
                  </td>
                  <td>
                    {new Intl.NumberFormat("en-EN").format(totalLatePrice) +
                      " " +
                      curr}
                  </td>
                  <td>
                    {new Intl.NumberFormat("en-EN").format(totalDebt) +
                      " " +
                      curr}
                  </td>
                  <td>
                    {new Intl.NumberFormat("en-EN").format(totalLoan) +
                      " " +
                      curr}
                  </td>
                  <td>
                    {new Intl.NumberFormat("en-EN").format(
                      Math.round(
                        props.user.status == 16
                          ? dsalary * (totalDays - totalAtt)
                          : (pdata.length - totalAtt) * props.user.salary
                      ) +
                      parseFloat(totalLatePrice) +
                      parseFloat(totalDebt) +
                      parseFloat(totalLoan)
                    ) +
                      " " +
                      curr}
                  </td>
                  <td>
                    {new Intl.NumberFormat("en-EN").format(
                      (props.user.status == 16
                        ? props.user.salary
                        : props.user.salary * pdata.length) -
                      (Math.round(
                        props.user.status == 16
                          ? dsalary * (totalDays - totalAtt)
                          : (pdata.length - totalAtt) * props.user.salary
                      ) +
                        parseFloat(totalLatePrice) +
                        parseFloat(totalDebt) +
                        parseFloat(totalLoan))
                    ) +
                      " " +
                      curr}
                  </td>
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
    </Layout >
  );
}
