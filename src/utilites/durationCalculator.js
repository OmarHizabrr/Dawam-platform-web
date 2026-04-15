// دالة لحساب المدة الزمنية بين تاريخين بناءً على ساعات الدوام الفعلية
export const calculateDuration = (dateFrom, dateTo, dailyWorkingHours = 7) => {
  if (!dateFrom || !dateTo) return "غير محدد";

  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return "غير صحيح";
  }

  // حساب الأيام التقويمية (شاملة) - مهم للإجازات
  const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const calendarDaysDiff = Math.floor((endDateOnly - startDateOnly) / (1000 * 60 * 60 * 24));
  // إضافة 1 لأننا نريد الأيام شاملة (inclusive)
  const calendarDays = calendarDaysDiff + 1;

  // حساب الفرق الزمني للوقت
  const diffTime = Math.abs(endDate - startDate);
  const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  // استخدام الأيام التقويمية إذا كانت الإجازة تمتد على أكثر من يوم
  const effectiveDays = calendarDays > 1 ? calendarDays : diffDays;

  // تنسيق الأيام بالطريقة المطلوبة
  let daysText = "";
  if (effectiveDays === 1) {
    daysText = "يوم";
  } else if (effectiveDays === 2) {
    daysText = "يومان";
  } else if (effectiveDays >= 3 && effectiveDays <= 10) {
    daysText = `${effectiveDays} أيام`;
  } else if (effectiveDays > 10) {
    daysText = `${effectiveDays} يوماً`;
  }

  // حساب الساعات الإجمالية بناءً على أيام العمل الفعلية
  const workingHoursTotal = effectiveDays * dailyWorkingHours;

  // تنسيق الساعات الإجمالية
  let totalHoursText = "";
  if (workingHoursTotal === 1) {
    totalHoursText = "ساعة واحدة";
  } else if (workingHoursTotal === 2) {
    totalHoursText = "ساعتان";
  } else if (workingHoursTotal >= 3 && workingHoursTotal <= 10) {
    totalHoursText = `${workingHoursTotal} ساعات`;
  } else if (workingHoursTotal > 10) {
    totalHoursText = `${workingHoursTotal} ساعة`;
  }

  // تنسيق الوقت بصيغة HH:MM
  const hoursFormatted = String(diffHours).padStart(2, "0");
  const minutesFormatted = String(diffMinutes).padStart(2, "0");
  const timeText = `${hoursFormatted}:${minutesFormatted}`;

  // التحقق من كون الإجازة من بداية الدوام إلى نهايته
  const isFullDayLeave =
    (diffHours === 0 && diffMinutes === 0) ||
    (effectiveDays === 1 && totalHours === dailyWorkingHours);

  if (effectiveDays > 1) {
    if (isFullDayLeave && workingHoursTotal > 0) {
      // إجازة من بداية الدوام إلى نهايته
      return {
        type: "full-days",
        days: daysText,
        hours: totalHoursText,
        hasDays: true,
      };
    } else {
      // إجازة جزئية
      return {
        type: "partial-days",
        days: daysText,
        time: timeText,
        hasDays: true,
      };
    }
  } else {
    // أقل من يوم - التحقق إذا كانت تساوي يوم عمل كامل
    if (totalHours === dailyWorkingHours && diffMinutes === 0) {
      // يوم عمل كامل (مثل 7 ساعات = يوم)
      return {
        type: "full-day",
        days: "يوم",
        hours: totalHoursText,
        hasDays: true,
      };
    } else {
      // جزء من اليوم
      return {
        type: "time-only",
        time: timeText,
        hasDays: false,
      };
    }
  }
};
