CREATE DATABASE IF NOT EXISTS soporte_tecnico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE soporte_tecnico;
CREATE TABLE IF NOT EXISTS tickets (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 code VARCHAR(30) NOT NULL UNIQUE,
 requester VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL,
 subject VARCHAR(150) NOT NULL,
 category VARCHAR(60) NOT NULL,
 priority ENUM('Baja','Media','Alta','Crítica') NOT NULL DEFAULT 'Media',
 description TEXT NOT NULL,
 status ENUM('Pendiente','En proceso','Resuelta') NOT NULL DEFAULT 'Pendiente',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX idx_status(status), INDEX idx_created_at(created_at)
) ENGINE=InnoDB;
