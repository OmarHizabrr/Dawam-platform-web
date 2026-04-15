select dawamdb.attendancelogs.user_id AS user_id,
getArabicDay(dayname(dawamdb.attendancelogs.date)) AS DayName,
dawamdb.attendancelogs.date AS date,
min(dawamdb.attendancelogs.attendance_time) AS attendance_time,
max(dawamdb.attendancelogs.leave_time) AS leave_time,
getNetDawam() AS netDawam,
sec_to_time(round(time_to_sec(getDuration(dawamdb.attendancelogs.date,dawamdb.attendancelogs.user_id)) - sum(time_to_sec(timediff(calceTime(dawamdb.attendancelogs.leave_time,dawamdb.attendancelogs.date,dawamdb.attendancelogs.user_id),
calcTime(dawamdb.attendancelogs.attendance_time,dawamdb.attendancelogs.date,dawamdb.attendancelogs.user_id)))),0)) AS lateTime,
getTBouns(dawamdb.attendancelogs.leave_time,dawamdb.attendancelogs.date,dawamdb.attendancelogs.user_id) AS bonusTime,
round(sum(time_to_sec(timediff(calceTime(dawamdb.attendancelogs.leave_time,dawamdb.attendancelogs.date,dawamdb.attendancelogs.user_id),
calcTime(dawamdb.attendancelogs.attendance_time,dawamdb.attendancelogs.date,dawamdb.attendancelogs.user_id)))) / 60 * getMinutePrice(dawamdb.attendancelogs.user_id,dawamdb.attendancelogs.date),0) AS dialySalary 
from dawamdb.attendancelogs group by dawamdb.attendancelogs.user_id,dawamdb.attendancelogs.date
//---------------------------------------------------------------------------------------
BEGIN
IF (SELECT COUNT(*) FROM attendancelogs WHERE
attendancelogs.date=DATE(new.events_datetime) AND attendancelogs.user_id=new.user_id AND attendancelogs.leave_time IS NULL) > 0 THEN
UPDATE attendancelogs 
SET leave_time=DATE_FORMAT(new.events_datetime,'%H:%i:%s') 
WHERE attendancelogs.date=DATE(new.events_datetime) AND attendancelogs.user_id=new.user_id AND attendancelogs.leave_time IS NULL;
ELSE
INSERT INTO attendancelogs(user_id,date, attendance_time,leave_time) 
    VALUES (new.user_id, DATE(new.events_datetime), DATE_FORMAT(new.events_datetime,'%H:%i:%s'),NULL);
END IF;
END

select `dawamdb`.`attendancelogs`.`user_id` AS `user_id`,
    `getArabicDay`(dayname(`dawamdb`.`attendancelogs`.`date`)) AS `DayName`,`dawamdb`.`attendancelogs`.`date` AS `date`,time_format(min(`dawamdb`.`attendancelogs`.`attendance_time`),'%r') AS `attendance_time`,time_format(max(`dawamdb`.`attendancelogs`.`leave_time`),'%r') AS `leave_time`,round(sec_to_time(sum(time_to_sec(`dawamdb`.`attendancelogs`.`netPeriod`))),0) AS `netDawam`,sec_to_time(round(time_to_sec(`getDuration`(`dawamdb`.`attendancelogs`.`date`,`dawamdb`.`attendancelogs`.`user_id`)) - sum(time_to_sec(timediff(`calceTime`(`dawamdb`.`attendancelogs`.`leave_time`,`dawamdb`.`attendancelogs`.`date`,`dawamdb`.`attendancelogs`.`user_id`),`calcTime`(`dawamdb`.`attendancelogs`.`attendance_time`,`dawamdb`.`attendancelogs`.`date`,`dawamdb`.`attendancelogs`.`user_id`)))),0)) AS `lateTime`,`getTBouns`(`dawamdb`.`attendancelogs`.`leave_time`,`dawamdb`.`attendancelogs`.`date`,`dawamdb`.`attendancelogs`.`user_id`) AS `bonusTime`,ifnull(round(sum(time_to_sec(timediff(`calceTime`(`dawamdb`.`attendancelogs`.`leave_time`,`dawamdb`.`attendancelogs`.`date`,`dawamdb`.`attendancelogs`.`user_id`),`calcTime`(`dawamdb`.`attendancelogs`.`attendance_time`,`dawamdb`.`attendancelogs`.`date`,`dawamdb`.`attendancelogs`.`user_id`)))) / 60 * `getMinutePrice`(`dawamdb`.`attendancelogs`.`user_id`,`dawamdb`.`attendancelogs`.`date`),0),0) AS `dialySalary`,floor(round(time_to_sec(`getDuration`(`dawamdb`.`attendancelogs`.`date`,`dawamdb`.`attendancelogs`.`user_id`)) - sum(time_to_sec(timediff(`calceTime`(`dawamdb`.`attendancelogs`.`leave_time`,`dawamdb`.`attendancelogs`.`date`,`dawamdb`.`attendancelogs`.`user_id`),`calcTime`(`dawamdb`.`attendancelogs`.`attendance_time`,`dawamdb`.`attendancelogs`.`date`,`dawamdb`.`attendancelogs`.`user_id`)))),0) / 60) * `getMinutePrice`(`dawamdb`.`attendancelogs`.`user_id`,`dawamdb`.`attendancelogs`.`date`) AS `discount` from `dawamdb`.`attendancelogs` group by `dawamdb`.`attendancelogs`.`user_id`,`dawamdb`.`attendancelogs`.`date`
