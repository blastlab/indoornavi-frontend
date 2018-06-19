SET
  @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS,
  UNIQUE_CHECKS = 0;
SET
  @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS,
  FOREIGN_KEY_CHECKS = 0;
SET
  @OLD_SQL_MODE = @@SQL_MODE,
  SQL_MODE = 'TRADITIONAL,ALLOW_INVALID_DATES';

-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8;
USE `mydb`;
-- -----------------------------------------------------
-- Table `mydb`.`trainings_contents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`trainings_contents` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
-- -----------------------------------------------------
-- Table `mydb`.`trainings_tutorials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`trainings_tutorials` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `trainings_contents_id` INT NOT NULL,
  `name` VARCHAR(255) NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `source` VARCHAR(255) NULL,
  PRIMARY KEY (`id`, `trainings_contents_id`),
  INDEX `fk_trainings_tutorials_trainings_contents_idx` (`trainings_contents_id` ASC),
  CONSTRAINT `fk_trainings_tutorials_trainings_contents` FOREIGN KEY (`trainings_contents_id`) REFERENCES `mydb`.`trainings_contents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
-- -----------------------------------------------------
-- Table `mydb`.`trainings_chapters`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`trainings_chapters` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `description` VARCHAR(255) NULL,
  `source` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `trainings_tutorials_id` INT NOT NULL,
  PRIMARY KEY (`id`, `trainings_tutorials_id`),
  INDEX `fk_trainings_chapters_trainings_tutorials1_idx` (`trainings_tutorials_id` ASC),
  CONSTRAINT `fk_trainings_chapters_trainings_tutorials1` FOREIGN KEY (`trainings_tutorials_id`) REFERENCES `mydb`.`trainings_tutorials` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
-- -----------------------------------------------------
-- Table `mydb`.`trainings_users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`trainings_users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `firstname` VARCHAR(255) NULL,
  `surname` VARCHAR(255) NULL,
  `address` VARCHAR(255) NULL,
  `city` VARCHAR(255) NULL,
  `pesel` INT(11) NOT NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
-- -----------------------------------------------------
-- Table `mydb`.`rooms`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`rooms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `address` VARCHAR(255) NULL,
  `description` VARCHAR(255) NULL,
  `floor` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `test` VARCHAR(45) NULL,
  PRIMARY KEY (`id`)
);
-- -----------------------------------------------------
-- Table `mydb`.`trainings_events`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`trainings_events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `seats_amount` INT(4) NULL,
  `status` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `start_at` TIMESTAMP NULL,
  `finish_at` TIMESTAMP NULL,
  `rooms_id` INT NOT NULL,
  PRIMARY KEY (`id`, `rooms_id`),
  INDEX `fk_trainings_events_rooms1_idx` (`rooms_id` ASC),
  CONSTRAINT `fk_trainings_events_rooms1` FOREIGN KEY (`rooms_id`) REFERENCES `mydb`.`rooms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
-- -----------------------------------------------------
-- Table `mydb`.`trainings_events_contents`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`trainings_events_contents` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `trainings_events_id` INT NOT NULL,
  `trainings_contents_id` INT NOT NULL,
  PRIMARY KEY (
    `id`, `trainings_events_id`, `trainings_contents_id`
  ),
  INDEX `fk_trainings_events_has_trainings_contents_trainings_conten_idx` (`trainings_contents_id` ASC),
  INDEX `fk_trainings_events_has_trainings_contents_trainings_events_idx` (`trainings_events_id` ASC),
  CONSTRAINT `fk_trainings_events_has_trainings_contents_trainings_events1` FOREIGN KEY (`trainings_events_id`) REFERENCES `mydb`.`trainings_events` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_trainings_events_has_trainings_contents_trainings_contents1` FOREIGN KEY (`trainings_contents_id`) REFERENCES `mydb`.`trainings_contents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
-- -----------------------------------------------------
-- Table `mydb`.`trainings_events_users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`trainings_events_users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `trainings_events_id` INT NOT NULL,
  `trainings_users_id` INT NOT NULL,
  PRIMARY KEY (
    `id`, `trainings_events_id`, `trainings_users_id`
  ),
  INDEX `fk_trainings_events_has_trainings_users_trainings_users1_idx` (`trainings_users_id` ASC),
  INDEX `fk_trainings_events_has_trainings_users_trainings_events1_idx` (`trainings_events_id` ASC),
  CONSTRAINT `fk_trainings_events_has_trainings_users_trainings_events1` FOREIGN KEY (`trainings_events_id`) REFERENCES `mydb`.`trainings_events` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_trainings_events_has_trainings_users_trainings_users1` FOREIGN KEY (`trainings_users_id`) REFERENCES `mydb`.`trainings_users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
);
SET
  SQL_MODE = @OLD_SQL_MODE;
SET
  FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
SET
  UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;