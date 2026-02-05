-- Migration: Add tree_images table for multiple image support
-- Run this migration to add support for multiple images per tree record

USE stn_tree;

-- Create tree_images table
CREATE TABLE IF NOT EXISTS tree_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tree_id INT NOT NULL,
  image_path VARCHAR(500) NOT NULL COMMENT 'Relative path to image from /public',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE,
  INDEX idx_tree_id (tree_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
