
use student_saas;

--  institute_id Nullable

ALTER TABLE users 
MODIFY institute_id INT NULL;

-- Modify ENUM add super_admin

ALTER TABLE users
MODIFY role ENUM('super_admin','admin','faculty','student') NOT NULL;

-- Modify subscriptions add amount_paid

ALTER TABLE subscriptions
ADD COLUMN amount_paid DECIMAL(10,2);

-- Modify plans add razorpay_plan_id

ALTER TABLE plans 
ADD COLUMN razorpay_plan_id VARCHAR(255);

-- Modify subscriptions add status

ALTER TABLE subscriptions 
ADD COLUMN status ENUM('active','cancelled','expired','suspended') DEFAULT 'active';

-- Modify subscriptions add invoice_path

ALTER TABLE subscriptions
ADD COLUMN invoice_path VARCHAR(255);

-- Modify students add updated_at

ALTER TABLE students
ADD COLUMN updated_at DATETIME NULL;

-- Modify faculty add created_at, updated_at

ALTER TABLE faculty
ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Modify faculty MODIFY created_at, updated_at

ALTER TABLE subscriptions
MODIFY created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
MODIFY updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Modify attendances add remarks

ALTER TABLE attendances 
ADD COLUMN remarks TEXT NULL;





