-- =====================================================
-- ملف إعداد قاعدة البيانات لنظام ترحيل الإجازات
-- =====================================================
-- تاريخ الإنشاء: 2024
-- الوصف: هذا الملف يحتوي على جميع استعلامات SQL المطلوبة
-- =====================================================

-- =====================================================
-- الخطوة 1: إنشاء جدول leave_transfers
-- =====================================================

CREATE TABLE IF NOT EXISTS `leave_transfers` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL COMMENT 'معرف الموظف',
  `vacationstype_id` bigint(20) UNSIGNED NOT NULL COMMENT 'معرف نوع الإجازة',
  `amount` int(11) NOT NULL COMMENT 'المقدار بالدقائق',
  `from_year` year(4) NOT NULL COMMENT 'السنة المصدر',
  `to_year` year(4) NOT NULL COMMENT 'السنة الهدف',
  `transfer_date` datetime NOT NULL COMMENT 'تاريخ الترحيل',
  `created_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'المستخدم الذي أنشأ الترحيل',
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'ملاحظات',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `leave_transfers_user_id_index` (`user_id`),
  KEY `leave_transfers_vacationstype_id_index` (`vacationstype_id`),
  KEY `leave_transfers_transfer_date_index` (`transfer_date`),
  KEY `leave_transfers_user_id_from_year_to_year_index` (`user_id`,`from_year`,`to_year`),
  CONSTRAINT `leave_transfers_user_id_foreign` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`user_id`) 
    ON DELETE CASCADE,
  CONSTRAINT `leave_transfers_vacationstype_id_foreign` 
    FOREIGN KEY (`vacationstype_id`) 
    REFERENCES `vacationstypes` (`id`) 
    ON DELETE CASCADE,
  CONSTRAINT `leave_transfers_created_by_foreign` 
    FOREIGN KEY (`created_by`) 
    REFERENCES `users` (`user_id`) 
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='جدول ترحيلات الإجازات';

-- =====================================================
-- الخطوة 2: إضافة الحقول المطلوبة إلى vacations_users
-- =====================================================

-- التحقق من وجود حقل period_type وإضافته إذا لم يكن موجوداً
SET @dbname = DATABASE();
SET @tablename = "vacations_users";
SET @columnname = "period_type";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column period_type already exists.'",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " ENUM('monthly', 'yearly') DEFAULT 'monthly' COMMENT 'نوع الفترة: شهرية أو سنوية' AFTER `amount`")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- التحقق من وجود حقل transfer_from_year وإضافته إذا لم يكن موجوداً
SET @columnname = "transfer_from_year";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column transfer_from_year already exists.'",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " YEAR NULL COMMENT 'السنة المصدر في حالة الترحيل' AFTER `period_type`")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- =====================================================
-- الخطوة 3: تحديث البيانات الموجودة
-- =====================================================

-- تحديث period_type للبيانات القديمة (افتراضياً monthly)
UPDATE `vacations_users` 
SET `period_type` = 'monthly' 
WHERE `period_type` IS NULL;

-- =====================================================
-- الخطوة 4: إضافة Indexes لتحسين الأداء
-- =====================================================

-- إضافة فهرس على period_type في vacations_users
CREATE INDEX IF NOT EXISTS `vacations_users_period_type_index` 
ON `vacations_users` (`period_type`);

-- إضافة فهرس على transfer_from_year في vacations_users
CREATE INDEX IF NOT EXISTS `vacations_users_transfer_from_year_index` 
ON `vacations_users` (`transfer_from_year`);

-- =====================================================
-- الخطوة 5: التحقق من الحقول المطلوبة في vacations_users
-- =====================================================

-- التحقق من وجود حقل type (إذا لم يكن موجوداً، يمكن إضافته)
-- ملاحظة: قم بإلغاء التعليق إذا كان الحقل غير موجود
/*
SET @columnname = "type";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 'Column type already exists.'",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " INT UNSIGNED NULL COMMENT 'نوع الرصيد (34 = مرحل من العام الماضي)' AFTER `vacationstype_id`")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
*/

-- =====================================================
-- الخطوة 6: استعلامات التحقق
-- =====================================================

-- التحقق من إنشاء جدول leave_transfers
SELECT 'Checking leave_transfers table...' AS status;
SHOW TABLES LIKE 'leave_transfers';

-- عرض هيكل جدول leave_transfers
SELECT 'Structure of leave_transfers table:' AS info;
DESCRIBE leave_transfers;

-- التحقق من الحقول المضافة في vacations_users
SELECT 'Checking new columns in vacations_users...' AS status;
SHOW COLUMNS FROM vacations_users LIKE 'period_type';
SHOW COLUMNS FROM vacations_users LIKE 'transfer_from_year';

-- التحقق من Foreign Keys
SELECT 'Checking Foreign Keys...' AS status;
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'leave_transfers'
    AND TABLE_SCHEMA = DATABASE()
    AND REFERENCED_TABLE_NAME IS NOT NULL;

-- التحقق من Indexes
SELECT 'Checking Indexes...' AS status;
SHOW INDEXES FROM leave_transfers;

-- =====================================================
-- الخطوة 7: بيانات تجريبية (اختياري - للاختبار فقط)
-- =====================================================

-- ملاحظة: قم بإلغاء التعليق إذا أردت إدراج بيانات تجريبية للاختبار
/*
-- مثال على إدراج سجل ترحيل تجريبي
-- تحذير: تأكد من وجود user_id و vacationstype_id صحيحة قبل التنفيذ
INSERT INTO `leave_transfers` 
(`user_id`, `vacationstype_id`, `amount`, `from_year`, `to_year`, `transfer_date`, `created_by`, `notes`, `created_at`, `updated_at`)
VALUES 
(1, 2, 1440, 2023, 2024, NOW(), 1, 'ترحيل تجريبي للاختبار', NOW(), NOW());
*/

-- =====================================================
-- نهاية الملف
-- =====================================================

SELECT 'Database setup completed successfully!' AS status;

