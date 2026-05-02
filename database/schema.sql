CREATE DATABASE IF NOT EXISTS `dev-project`;
USE `dev-project`;

-- Limpeza para reset (Desenvolvimento)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS photo_likes;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS confirmations;
DROP TABLE IF EXISTS companions;
DROP TABLE IF EXISTS qrcodes;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS schedule_items;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS admins;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE admins (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(150)  NOT NULL,
  email       VARCHAR(191)  NOT NULL UNIQUE,
  senha_hash  VARCHAR(255)  NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id                            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id                      INT UNSIGNED  NOT NULL,
  nome                          VARCHAR(200)  NOT NULL,
  descricao                     TEXT,
  data_hora                     DATETIME      NOT NULL,
  capacidade_total              INT UNSIGNED  NOT NULL,
  foto_capa                     VARCHAR(500),
  max_dependentes_por_convidado INT UNSIGNED  NOT NULL DEFAULT 0,
  created_at                    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

CREATE TABLE schedule_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id    INT UNSIGNED  NOT NULL,
  titulo      VARCHAR(200)  NOT NULL,
  descricao   TEXT,
  data_hora   DATETIME      NOT NULL,
  foto_url    VARCHAR(500),
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedule_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE guests (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id       INT UNSIGNED  NOT NULL,
  nome_completo  VARCHAR(200)  NOT NULL,
  telefone       VARCHAR(25)   NOT NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_guests_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE companions (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  guest_id       INT UNSIGNED  NOT NULL,
  nome_completo  VARCHAR(200)  NOT NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_companions_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

CREATE TABLE confirmations (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  guest_id   INT UNSIGNED  NOT NULL UNIQUE,
  status     ENUM('PENDENTE','CONFIRMADO','CANCELADO') NOT NULL DEFAULT 'PENDENTE',
  created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_confirmation_guest FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

CREATE TABLE qrcodes (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id     INT UNSIGNED  NOT NULL UNIQUE,
  token        CHAR(36)      NOT NULL UNIQUE,
  url_publica  VARCHAR(500)  NOT NULL,
  qrcode_path  VARCHAR(500),
  expires_at   DATETIME      NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_qrcode_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE photos (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id         INT UNSIGNED  NOT NULL,
  schedule_item_id INT UNSIGNED,
  enviado_por      VARCHAR(150)  NOT NULL,
  foto_url         VARCHAR(500)  NOT NULL,
  likes_count      INT UNSIGNED  NOT NULL DEFAULT 0,
  thumbnail_url    VARCHAR(500),
  uploaded_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_photos_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_photos_schedule FOREIGN KEY (schedule_item_id) REFERENCES schedule_items(id) ON DELETE CASCADE
);

CREATE TABLE photo_likes (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  photo_id     INT UNSIGNED  NOT NULL,
  visitor_id   VARCHAR(255)  NOT NULL,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_photolikes_photo FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE
);
