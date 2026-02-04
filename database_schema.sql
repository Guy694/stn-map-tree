-- Create database if not exists
CREATE DATABASE IF NOT EXISTS stn_tree CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE stn_tree;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trees table for tree records
CREATE TABLE IF NOT EXISTS trees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tree_name VARCHAR(100) NOT NULL COMMENT 'ชื่อต้นไม้',
  quantity INT NOT NULL DEFAULT 1 COMMENT 'จำนวน',
  lat DECIMAL(10, 8) NOT NULL COMMENT 'ละติจูด',
  lng DECIMAL(11, 8) NOT NULL COMMENT 'ลองจิจูด',
  village_name VARCHAR(255) DEFAULT NULL COMMENT 'ชื่อหมู่บ้าน',
  tambon_name VARCHAR(255) DEFAULT NULL COMMENT 'ชื่อตำบล',
  district_name VARCHAR(255) DEFAULT NULL COMMENT 'ชื่ออำเภอ',
  location_detail TEXT DEFAULT NULL COMMENT 'รายละเอียดสถานที่',
  note TEXT DEFAULT NULL COMMENT 'หมายเหตุ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_location (lat, lng),
  INDEX idx_administrative (village_name, tambon_name, district_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Districts polygon table (from existing SQL file)
CREATE TABLE IF NOT EXISTS districts_polygon (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dis_name VARCHAR(255) NOT NULL COMMENT 'ชื่ออำเภอ',
  pro_name VARCHAR(255) NOT NULL COMMENT 'ชื่อจังหวัด',
  dis_code VARCHAR(10) NOT NULL COMMENT 'รหัสอำเภอ',
  pro_code VARCHAR(10) NOT NULL COMMENT 'รหัสจังหวัด',
  geometry GEOMETRY NOT NULL COMMENT 'ข้อมูล Geometry (MultiPolygon)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_district (dis_code, pro_code),
  SPATIAL KEY idx_geometry (geometry),
  KEY idx_dis_name (dis_name),
  KEY idx_pro_name (pro_name),
  KEY idx_dis_code (dis_code),
  KEY idx_pro_code (pro_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sub-districts (Tambons) polygon table (from existing SQL file)
CREATE TABLE IF NOT EXISTS tambons_polygon (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tam_name VARCHAR(255) NOT NULL COMMENT 'ชื่อตำบล',
  dis_name VARCHAR(255) NOT NULL COMMENT 'ชื่ออำเภอ',
  pro_name VARCHAR(255) NOT NULL COMMENT 'ชื่อจังหวัด',
  tum_code VARCHAR(10) DEFAULT NULL COMMENT 'รหัสตำบล',
  dis_code VARCHAR(10) DEFAULT NULL COMMENT 'รหัสอำเภอ',
  pro_code VARCHAR(10) DEFAULT NULL COMMENT 'รหัสจังหวัด',
  geometry GEOMETRY NOT NULL COMMENT 'ข้อมูล Geometry (MultiPolygon)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  SPATIAL KEY idx_geometry (geometry),
  KEY idx_tam_name (tam_name),
  KEY idx_dis_name (dis_name),
  KEY idx_pro_name (pro_name),
  KEY idx_codes (tum_code, dis_code, pro_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Villages polygon table (from existing SQL file)
CREATE TABLE IF NOT EXISTS villages_polygon (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vil_name VARCHAR(255) NOT NULL COMMENT 'ชื่อหมู่บ้าน',
  tam_name VARCHAR(255) NOT NULL COMMENT 'ชื่อตำบล',
  dis_name VARCHAR(255) NOT NULL COMMENT 'ชื่ออำเภอ',
  pro_name VARCHAR(255) NOT NULL COMMENT 'ชื่อจังหวัด',
  vil_code VARCHAR(10) DEFAULT NULL COMMENT 'รหัสหมู่บ้าน',
  tum_code VARCHAR(10) DEFAULT NULL COMMENT 'รหัสตำบล',
  dis_code VARCHAR(10) DEFAULT NULL COMMENT 'รหัสอำเภอ',
  pro_code VARCHAR(10) DEFAULT NULL COMMENT 'รหัสจังหวัด',
  geometry GEOMETRY NOT NULL COMMENT 'ข้อมูล Geometry (MultiPolygon)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  SPATIAL KEY idx_geometry (geometry),
  KEY idx_vil_name (vil_name),
  KEY idx_tam_name (tam_name),
  KEY idx_dis_name (dis_name),
  KEY idx_pro_name (pro_name),
  KEY idx_codes (vil_code, tum_code, dis_code, pro_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT IGNORE INTO users (username, password_hash, full_name, role) 
VALUES ('admin', '$2a$10$8K1p/a0dL3LPzj8Z9V8OwO0.JdRY4cHqOEZnONq5qLW5rJ9KpLc6i', 'ผู้ดูแลระบบ', 'admin');
