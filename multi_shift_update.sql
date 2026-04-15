DELIMITER $$

-- 1. getDuration: حساب الساعات المطلوبة في اليوم لجميع فترات الموظف
DROP FUNCTION IF EXISTS `getDuration`$$
CREATE FUNCTION `getDuration`(p_date DATE, p_user_id INT) RETURNS time
BEGIN
    DECLARE total_sec INT DEFAULT 0;
    
    SELECT IFNULL(SUM(TIME_TO_SEC(TIMEDIFF(endTime, startTime))), 0) INTO total_sec
    FROM durations d
    JOIN users u ON u.durationtype_id = d.durationtype_id
    WHERE u.user_id = p_user_id 
      AND p_date BETWEEN d.startDate AND d.endDate
      AND (d.weekends IS NULL OR d.weekends NOT LIKE CONCAT('%"', (SELECT ar_day FROM daynames WHERE daynames.en_day = DAYNAME(p_date) LIMIT 1), '"%'));

    RETURN SEC_TO_TIME(total_sec);
END$$

-- 2. getDurationStart: جلب وقت بدء أول فترة للموظف في اليوم المُحدد
DROP FUNCTION IF EXISTS `getDurationStart`$$
CREATE FUNCTION `getDurationStart`(p_date DATE, p_user_id INT) RETURNS time
BEGIN
    DECLARE start_t TIME;
    
    SELECT MIN(startTime) INTO start_t
    FROM durations d
    JOIN users u ON u.durationtype_id = d.durationtype_id
    WHERE u.user_id = p_user_id 
      AND p_date BETWEEN d.startDate AND d.endDate
      AND (d.weekends IS NULL OR d.weekends NOT LIKE CONCAT('%"', (SELECT ar_day FROM daynames WHERE daynames.en_day = DAYNAME(p_date) LIMIT 1), '"%'));

    RETURN start_t;
END$$

-- 3. getDurationEnd: جلب وقت نهاية آخر فترة للموظف في اليوم المٌحدد
DROP FUNCTION IF EXISTS `getDurationEnd`$$
CREATE FUNCTION `getDurationEnd`(p_date DATE, p_user_id INT) RETURNS time
BEGIN
    DECLARE end_t TIME;
    
    SELECT MAX(endTime) INTO end_t
    FROM durations d
    JOIN users u ON u.durationtype_id = d.durationtype_id
    WHERE u.user_id = p_user_id 
      AND p_date BETWEEN d.startDate AND d.endDate
      AND (d.weekends IS NULL OR d.weekends NOT LIKE CONCAT('%"', (SELECT ar_day FROM daynames WHERE daynames.en_day = DAYNAME(p_date) LIMIT 1), '"%'));

    RETURN end_t;
END$$

-- 4. getMinutePrice: حساب سعر الدقيقة (يعتمد ديناميكياً على مجموع الفترات بدلاً من فترة واحدة)
DROP FUNCTION IF EXISTS `getMinutePrice`$$
CREATE FUNCTION `getMinutePrice`(p_user_id INT, p_date DATE) RETURNS decimal(10,4)
BEGIN
    DECLARE daily_salary DECIMAL(10,2) DEFAULT 0;
    DECLARE required_minutes INT DEFAULT 0;
    DECLARE minute_price DECIMAL(10,4) DEFAULT 0;

    -- الراتب اليومي
    SET daily_salary = getDialySalary(p_user_id);
    
    -- عدد الدقائق المطلوبة في اليوم بناءً على فترات الدوام
    SET required_minutes = TIME_TO_SEC(getDuration(p_date, p_user_id)) / 60;
    
    IF required_minutes > 0 THEN
        SET minute_price = daily_salary / required_minutes;
    ELSE
        SET minute_price = 0;
    END IF;

    RETURN minute_price;
END$$

DELIMITER ;

-- 5. تحديث View كشف الحضور والانصراف لحساب الخصميات وتجميع الفترات
CREATE OR REPLACE VIEW `calattendancerecords` AS 
SELECT 
  `a`.`user_id` AS `user_id`, 
  `a`.`date` AS `date`, 
  (SELECT ar_day FROM daynames WHERE en_day = dayname(`a`.`date`) LIMIT 1) AS `dayName`, 
  MIN(`a`.`attendance_time`) AS `attendance_time`, 
  MAX(`a`.`leave_time`) AS `leave_time`, 
  SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(IFNULL(`a`.`leave_time`,`a`.`attendance_time`),`a`.`attendance_time`)))) AS `workHours`, 
  (SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(`calattendancelogs`.`workHour`))) FROM `calattendancelogs` WHERE `calattendancelogs`.`user_id` = `a`.`user_id` AND `calattendancelogs`.`date` = `a`.`date` AND `calattendancelogs`.`type` > 0) AS `vacHours`, 
  CASE WHEN SUM(TIME_TO_SEC(TIMEDIFF(IFNULL(`a`.`leave_time`,`a`.`attendance_time`),`a`.`attendance_time`))) < TIME_TO_SEC(`getDuration`(`a`.`date`,`a`.`user_id`)) THEN SEC_TO_TIME(TIME_TO_SEC(`getDuration`(`a`.`date`,`a`.`user_id`)) - SUM(TIME_TO_SEC(TIMEDIFF(IFNULL(`a`.`leave_time`,`a`.`attendance_time`),`a`.`attendance_time`)))) ELSE '00:00:00' END AS `lateTime`, 
  FLOOR(CASE WHEN SUM(TIME_TO_SEC(TIMEDIFF(IFNULL(`a`.`leave_time`,`a`.`attendance_time`),`a`.`attendance_time`))) < TIME_TO_SEC(`getDuration`(`a`.`date`,`a`.`user_id`)) THEN TIME_TO_SEC(`getDuration`(`a`.`date`,`a`.`user_id`)) - SUM(TIME_TO_SEC(TIMEDIFF(IFNULL(`a`.`leave_time`,`a`.`attendance_time`),`a`.`attendance_time`))) ELSE 0 END / 60) * `getMinutePrice`(`a`.`user_id`,`a`.`date`) AS `discount`, 
  (SELECT `vacations`.`vacationtype_id` FROM `vacations` WHERE `vacations`.`user_id` = `a`.`user_id` AND `a`.`date` BETWEEN CAST(`vacations`.`date_from` AS DATE) AND CAST(`vacations`.`date_to` AS DATE) LIMIT 1) AS `types`, 
  CASE WHEN SUM(TIME_TO_SEC(TIMEDIFF(IFNULL(`a`.`leave_time`,`a`.`attendance_time`),`a`.`attendance_time`))) > TIME_TO_SEC(`getDuration`(`a`.`date`,`a`.`user_id`)) THEN SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(IFNULL(`a`.`leave_time`,`a`.`attendance_time`),`a`.`attendance_time`))) - TIME_TO_SEC(`getDuration`(`a`.`date`,`a`.`user_id`))) ELSE '00:00:00' END AS `bonusTime`, 
  '' AS `notes` 
FROM `attendancelogs` `a` 
GROUP BY `a`.`user_id`, `a`.`date`;
