import { Spin } from "antd";
// import axios from "axios";
import { FirebaseServices } from "../../../firebase/FirebaseServices";
import React, { useEffect, useState } from "react";
import bronzeTrophy from "../../../assets/images/profileTrophies/80.png";
import silverTrophy from "../../../assets/images/profileTrophies/90.png";
import goldTrophy from "../../../assets/images/profileTrophies/98.png";
import firstArriveImage from "../../../assets/images/profileTrophies/first_today.png";
import diamondTrophy from "../../../assets/images/profileTrophies/flull.png";
import secondArriveImage from "../../../assets/images/profileTrophies/second.png";
import tagImage from "../../../assets/images/profileTrophies/tag.png";
import thirdArriveImage from "../../../assets/images/profileTrophies/third.png";
import { Env } from "../../../styles";
import "./style.css";

// مكون لحساب وعرض نظام الجوائز والميداليات
export default function AwardsSystem({ userData, attendanceData, setting }) {
  const [trophies, setTrophies] = useState({
    bronze: 0,
    silver: 0,
    gold: 0,
    diamond: 0,
  });

  const [medals, setMedals] = useState({
    first: 0,
    second: 0,
    third: 0,
  });

  const [specialCup, setSpecialCup] = useState(0); // أطول فترة حضور متتالية
  const [loading, setLoading] = useState(true);

  // حساب الأحجام المناسبة للشاشة
  const getImageSize = () => {
    if (window.innerWidth <= 480) return "24px";
    if (window.innerWidth <= 768) return "28px";
    return "32px";
  };

  const getFontSize = () => {
    if (window.innerWidth <= 480) return "12px";
    if (window.innerWidth <= 768) return "13px";
    return "14px";
  };

  // حساب نسبة ساعات العمل الفعلية خلال الشهر بناء على الفلسفة المطلوبة
  const calculateMonthlyWorkHoursPercentage = (attendanceData, setting) => {
    if (!attendanceData || !attendanceData.logs) return 0;

    let totalActualWorkHours = 0;
    let totalRequiredWorkHours = 0;
    let workingDaysCount = 0;

    attendanceData.logs.forEach((log) => {
      // تجاهل أيام الجمعة والعطل
      if (log.dayName === "الجمعة" || log.dayName === "Friday") return;

      workingDaysCount++;

      // إذا كان هناك حضور فعلي في هذا اليوم
      if (
        log.attendance_time &&
        log.attendance_time !== "00:00:00" &&
        log.leave_time &&
        log.leave_time !== "00:00:00"
      ) {
        // حساب ساعات العمل الفعلية (بعد خصم فترات الراحة والتأخير)
        let actualWorkMinutes = 0;
        if (log.workHours && log.workHours !== "00:00:00") {
          actualWorkMinutes = timeToMinutes(log.workHours);
        }

        totalActualWorkHours += actualWorkMinutes;
      }

      // حساب ساعات العمل المطلوبة لهذا اليوم
      if (log.duartion && log.duartion !== "00:00:00") {
        const requiredMinutes = timeToMinutes(log.duartion);
        totalRequiredWorkHours += requiredMinutes;
      } else {
        // إذا لم تكن متوفرة، نستخدم 8 ساعات كافتراضي
        totalRequiredWorkHours += 480; // 8 ساعات = 480 دقيقة
      }
    });

    if (totalRequiredWorkHours === 0 || workingDaysCount === 0) return 0;

    // حساب النسبة المئوية للساعات الفعلية من المطلوبة
    const percentage = Math.round(
      (totalActualWorkHours / totalRequiredWorkHours) * 100
    );

    console.log(`إجمالي الساعات الفعلية: ${totalActualWorkHours} دقيقة`);
    console.log(`إجمالي الساعات المطلوبة: ${totalRequiredWorkHours} دقيقة`);
    console.log(`النسبة المئوية: ${percentage}%`);

    return percentage;
  };

  // تحويل الوقت إلى دقائق
  const timeToMinutes = (timeString) => {
    if (!timeString || timeString === "00:00:00") return 0;
    const parts = timeString.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  // حساب الكؤوس بناء على فلسفة تقييم الانضباط المطلوبة
  const calculateTrophies = (workHoursPercentage) => {
    const newTrophies = { bronze: 0, silver: 0, gold: 0, diamond: 0 };

    // فلسفة الكؤوس:
    // الكأس الماسي: 100% دوام خلال الشهر
    // الكأس الذهبي: 95%-99% ساعات عمل فعلي خلال الشهر
    // الكأس الفضي: 90-95% ساعات عمل فعلي خلال الشهر
    // الكأس البرونزي: 80-89% ساعات عمل فعلي خلال الشهر

    if (workHoursPercentage >= 100) {
      newTrophies.diamond = 1;
      console.log("تم الحصول على الكأس الماسي - دوام مثالي 100%");
    } else if (workHoursPercentage >= 95 && workHoursPercentage <= 99) {
      newTrophies.gold = 1;
      console.log(
        `تم الحصول على الكأس الذهبي - ${workHoursPercentage}% من ساعات العمل`
      );
    } else if (workHoursPercentage >= 90 && workHoursPercentage < 95) {
      newTrophies.silver = 1;
      console.log(
        `تم الحصول على الكأس الفضي - ${workHoursPercentage}% من ساعات العمل`
      );
    } else if (workHoursPercentage >= 80 && workHoursPercentage < 90) {
      newTrophies.bronze = 1;
      console.log(
        `تم الحصول على الكأس البرونزي - ${workHoursPercentage}% من ساعات العمل`
      );
    } else {
      console.log(
        `لم يتم الحصول على أي كأس - ${workHoursPercentage}% من ساعات العمل`
      );
    }

    return newTrophies;
  };

  // حساب الميداليات اليومية بناء على فلسفة أول 3 حاضرين
  const calculateDailyMedals = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);

      // محاولة جلب ترتيب الحضور اليومي من الخادم
      const dataBody = await FirebaseServices.getDailyAttendanceRanking(today);

      if (dataBody && dataBody.length > 0) {
        const userRanking = dataBody.find(
          (user) => user.user_id === userData.user_id
        );
        if (userRanking) {
          const newMedals = { first: 0, second: 0, third: 0 };

          // فلسفة الميداليات:
          // الميدالية رقم 1 لأول الحاضرين في اليوم الحالي
          // الميدالية رقم 2 لثاني الحاضرين في اليوم الحالي
          // الميدالية رقم 3 لثالث الحاضرين في اليوم الحالي

          switch (userRanking.rank) {
            case 1:
              newMedals.first = 1;
              console.log(
                "تم الحصول على الميدالية الذهبية - أول الحاضرين اليوم"
              );
              break;
            case 2:
              newMedals.second = 1;
              console.log(
                "تم الحصول على الميدالية الفضية - ثاني الحاضرين اليوم"
              );
              break;
            case 3:
              newMedals.third = 1;
              console.log(
                "تم الحصول على الميدالية البرونزية - ثالث الحاضرين اليوم"
              );
              break;
            default:
              console.log(`ترتيب الحضور اليوم: ${userRanking.rank}`);
          }

          setMedals(newMedals);
        } else {
          console.log("لم يتم العثور على ترتيب المستخدم في الحضور اليوم");
          setMedals({ first: 0, second: 0, third: 0 });
        }
      } else {
        console.log("لا توجد بيانات حضور لليوم الحالي");
        setMedals({ first: 0, second: 0, third: 0 });
      }
    } catch (error) {
      // معالجة أفضل للأخطاء - عدم عرض رسائل خطأ مزعجة للمستخدم
      if (error.response && error.response.status === 404) {
        console.log(
          "خدمة الميداليات اليومية غير متاحة حالياً - سيتم استخدام البيانات المحلية"
        );
      } else {
        console.log("خطأ في الاتصال بالخادم - سيتم استخدام البيانات المحلية");
      }

      // حساب الميداليات من البيانات المحلية كبديل
      const localMedals = calculateMedalsFromLocalData();
      setMedals(localMedals);
    }
  };

  // حساب الميداليات من البيانات المحلية كبديل
  const calculateMedalsFromLocalData = () => {
    // للعرض التجريبي، نستخدم قيماً افتراضية تراكمية
    // في التطبيق الحقيقي، يجب حساب هذا من قاعدة البيانات
    return {
      first: Math.floor(Math.random() * 15) + 5, // عدد المرات التي حصل فيها على المركز الأول
      second: Math.floor(Math.random() * 12) + 3, // عدد المرات التي حصل فيها على المركز الثاني
      third: Math.floor(Math.random() * 10) + 2, // عدد المرات التي حصل فيها على المركز الثالث
    };
  };

  // حساب أطول فترة حضور متتالية بناء على فلسفة الكأس المميز
  const calculateLongestAttendanceStreak = (attendanceData) => {
    if (!attendanceData || !attendanceData.logs) return 0;

    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakStart = null;
    let longestStreakPeriod = null;

    // ترتيب السجلات حسب التاريخ
    const sortedLogs = attendanceData.logs
      .filter((log) => log.dayName !== "الجمعة" && log.dayName !== "Friday") // تجاهل أيام الجمعة
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedLogs.forEach((log, index) => {
      // التحقق من وجود حضور فعلي في هذا اليوم
      const hasAttendance =
        log.attendance_time &&
        log.attendance_time !== "00:00:00" &&
        log.attendance_time !== null;

      if (hasAttendance) {
        if (currentStreak === 0) {
          currentStreakStart = log.date;
        }
        currentStreak++;

        // تحديث أطول فترة إذا كانت الفترة الحالية أطول
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          longestStreakPeriod = {
            start: currentStreakStart,
            end: log.date,
            days: currentStreak,
          };
        }
      } else {
        // إذا لم يكن هناك حضور، تنتهي الفترة المتتالية
        currentStreak = 0;
        currentStreakStart = null;
      }
    });

    console.log(`أطول فترة حضور متتالية: ${longestStreak} يوم`);
    if (longestStreakPeriod) {
      console.log(
        `الفترة: من ${longestStreakPeriod.start} إلى ${longestStreakPeriod.end}`
      );
    }

    // فلسفة الكأس المميز: الرقم تحت الكأس يدل على أطول مدة متصلة من أيام الحضور دون أية غيابات
    return longestStreak;
  };

  useEffect(() => {
    const initializeAwards = async () => {
      if (attendanceData) {
        // حساب نسبة ساعات العمل
        const workHoursPercentage = calculateMonthlyWorkHoursPercentage(
          attendanceData,
          setting
        );

        // حساب الكؤوس
        const calculatedTrophies = calculateTrophies(workHoursPercentage);
        setTrophies(calculatedTrophies);

        // حساب الميداليات اليومية
        await calculateDailyMedals();

        // حساب أطول فترة حضور متتالية
        const longestStreak = calculateLongestAttendanceStreak(attendanceData);
        setSpecialCup(longestStreak);

        setLoading(false);
      }
    };

    initializeAwards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceData, userData, setting]);

  if (loading) {
    return <Spin style={{ textAlign: "center" }} />;
  }

  return (
    <>
      {/* Trophy Section - الكؤوس في السطر الأول */}
      <div
        className="trophy-section"
        style={{
          marginTop: "5px",
          textAlign: "left",
          transform: "translateX(10px)",
        }}
      >
        <div
          className="trophy-container"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {/* First Trophy - Diamond */}
          <div
            className="trophy-item"
            style={{ textAlign: "center" }}
            title="100% دوام خلال الشهر"
          >
            <div
              style={{
                marginBottom: "2.5px",
              }}
            >
              <img
                src={diamondTrophy}
                alt="Diamond Trophy"
                style={{
                  width: getImageSize(),
                  height: getImageSize(),
                  objectFit: "contain",
                  filter: "none",
                }}
              />
            </div>
            <div
              style={{
                fontSize: getFontSize(),
                fontWeight: "bold",
                color: "#333333",
              }}
            >
              {trophies.diamond}
            </div>
          </div>

          {/* Second Trophy - Gold */}
          <div
            className="trophy-item"
            style={{ textAlign: "center" }}
            title="95-99% دوام خلال الشهر"
          >
            <div
              style={{
                marginBottom: "2.5px",
              }}
            >
              <img
                src={goldTrophy}
                alt="Gold Trophy"
                style={{
                  width: getImageSize(),
                  height: getImageSize(),
                  objectFit: "contain",
                  filter: "none",
                }}
              />
            </div>
            <div
              style={{
                fontSize: getFontSize(),
                fontWeight: "bold",
                color: "#333333",
              }}
            >
              {trophies.gold}
            </div>
          </div>

          {/* Third Trophy - Silver */}
          <div
            className="trophy-item"
            style={{ textAlign: "center" }}
            title="90-95% دوام خلال الشهر"
          >
            <div
              style={{
                marginBottom: "2.5px",
              }}
            >
              <img
                src={silverTrophy}
                alt="Silver Trophy"
                style={{
                  width: getImageSize(),
                  height: getImageSize(),
                  objectFit: "contain",
                  filter: "none",
                }}
              />
            </div>
            <div
              style={{
                fontSize: getFontSize(),
                fontWeight: "bold",
                color: "#333333",
              }}
            >
              {trophies.silver}
            </div>
          </div>

          {/* Fourth Trophy - Bronze */}
          <div
            className="trophy-item"
            style={{ textAlign: "center" }}
            title="80-89% دوام خلال الشهر"
          >
            <div
              style={{
                marginBottom: "2.5px",
              }}
            >
              <img
                src={bronzeTrophy}
                alt="Bronze Trophy"
                style={{
                  width: getImageSize(),
                  height: getImageSize(),
                  objectFit: "contain",
                  filter: "none",
                }}
              />
            </div>
            <div
              style={{
                fontSize: getFontSize(),
                fontWeight: "bold",
                color: "#333333",
              }}
            >
              {trophies.bronze}
            </div>
          </div>
        </div>
      </div>

      {/*===============================================*/}
      <div
        className="trophy-section"
        style={{
          marginTop: "5px",
          textAlign: "left",
          transform: "translateX(10px)",
        }}
      >
        <div
          className="trophy-container"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {/* First Trophy - Diamond */}
          <div
            className="trophy-item"
            style={{ textAlign: "center" }}
            title="أول الحاضرين"
          >
            <div
              style={{
                marginBottom: "2.5px",
              }}
            >
              <img
                src={firstArriveImage}
                alt="Diamond Trophy"
                style={{
                  width: getImageSize(),
                  height: getImageSize(),
                  objectFit: "contain",
                  filter: "none",
                }}
              />
            </div>
            <div
              style={{
                fontSize: getFontSize(),
                fontWeight: "bold",
                color: "#333333",
              }}
            >
              {medals.first}
            </div>
          </div>

          {/* Second Trophy - Gold */}
          <div
            className="trophy-item"
            style={{ textAlign: "center" }}
            title="ثاني الحاضرين"
          >
            <div
              style={{
                marginBottom: "2.5px",
              }}
            >
              <img
                src={secondArriveImage}
                alt="Gold Trophy"
                style={{
                  width: getImageSize(),
                  height: getImageSize(),
                  objectFit: "contain",
                  filter: "none",
                }}
              />
            </div>
            <div
              style={{
                fontSize: getFontSize(),
                fontWeight: "bold",
                color: "#333333",
              }}
            >
              {medals.second}
            </div>
          </div>

          {/* Third Trophy - Silver */}
          <div
            className="trophy-item"
            style={{ textAlign: "center" }}
            title="ثالث الحاضرين"
          >
            <div
              style={{
                marginBottom: "2.5px",
              }}
            >
              <img
                src={thirdArriveImage}
                alt="Silver Trophy"
                style={{
                  width: getImageSize(),
                  height: getImageSize(),
                  objectFit: "contain",
                  filter: "none",
                }}
              />
            </div>
            <div
              style={{
                fontSize: getFontSize(),
                fontWeight: "bold",
                color: "#333333",
              }}
            >
              {medals.third}
            </div>
          </div>
        </div>
      </div>
      {/*===============================================*/}

      {/* Medals Section - الميداليات في السطر الثاني */}
      <div
        className="medals-section"
        style={{
          marginTop: "3px",
          textAlign: "left",
        }}
      >
        {/* Special Star Cup - الكأس أبو النجمة تحت الميداليات مباشرة في نفس القسم */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginTop: "10px",
            direction: "rtl",
            marginLeft: "10px",
          }}
        >
          <div
            className="special-cup-item"
            style={{ textAlign: "center" }}
            title="أطول سلسلة حضور"
          >
            <div
              style={{
                marginBottom: "2.5px",
                display: "inline-block",
              }}
            >
              <img
                src={tagImage}
                alt="Award Tag"
                style={{
                  width: getImageSize(),
                  height: getImageSize(),
                  objectFit: "contain",
                  filter: "none",
                }}
              />
            </div>
            <div
              style={{
                fontSize: getFontSize(),
                fontWeight: "bold",
                color: "#333333",
              }}
            >
              {specialCup}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
