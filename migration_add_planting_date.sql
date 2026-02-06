-- Add planting_date column to trees table

ALTER TABLE trees 
ADD COLUMN planting_date DATE DEFAULT NULL COMMENT 'วันที่ปลูก' 
AFTER location_detail;
