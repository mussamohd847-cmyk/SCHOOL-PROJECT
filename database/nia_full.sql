-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: nia_system
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_years`
--

DROP TABLE IF EXISTS `academic_years`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `academic_years` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_years`
--

LOCK TABLES `academic_years` WRITE;
/*!40000 ALTER TABLE `academic_years` DISABLE KEYS */;
INSERT INTO `academic_years` VALUES (1,'2026/2027',1,'2026-08-21 11:36:19');
/*!40000 ALTER TABLE `academic_years` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activity_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(120) NOT NULL,
  `action` varchar(150) NOT NULL,
  `module` varchar(60) NOT NULL,
  `record_id` varchar(60) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_log_user` (`user_id`),
  KEY `idx_log_created` (`created_at`),
  CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_log`
--

LOCK TABLES `activity_log` WRITE;
/*!40000 ALTER TABLE `activity_log` DISABLE KEYS */;
INSERT INTO `activity_log` VALUES (1,1,'System Administrator','Logged in','Auth','1','admin signed in','2026-08-21 14:34:47');
INSERT INTO `activity_log` VALUES (2,1,'System Administrator','Registered student','Students','s_mt31yn31qaq9r','Mussa Mohd','2026-08-21 14:36:32');
INSERT INTO `activity_log` VALUES (3,1,'System Administrator','Deleted student','Students','1','Amina Vuai','2026-08-21 14:37:14');
/*!40000 ALTER TABLE `activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('Present','Absent','Late','Excused') NOT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attendance_day` (`student_id`,`attendance_date`),
  KEY `fk_att_class` (`class_id`),
  KEY `idx_att_date` (`attendance_date`),
  CONSTRAINT `fk_att_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `section` enum('school','madrasa') NOT NULL DEFAULT 'school',
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_class_name_section` (`name`,`section`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'Grade 1','school',3);
INSERT INTO `classes` VALUES (2,'Grade 2','school',4);
INSERT INTO `classes` VALUES (3,'Grade 5','school',7);
INSERT INTO `classes` VALUES (4,'Madrasa Level 1','madrasa',1);
INSERT INTO `classes` VALUES (5,'Madrasa Level 2','madrasa',2);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exams`
--

DROP TABLE IF EXISTS `exams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `term_id` int(11) NOT NULL,
  `year_id` int(11) NOT NULL,
  `section` enum('school','madrasa') NOT NULL DEFAULT 'school',
  PRIMARY KEY (`id`),
  KEY `fk_exams_term` (`term_id`),
  KEY `fk_exams_year` (`year_id`),
  CONSTRAINT `fk_exams_term` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exams_year` FOREIGN KEY (`year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exams`
--

LOCK TABLES `exams` WRITE;
/*!40000 ALTER TABLE `exams` DISABLE KEYS */;
INSERT INTO `exams` VALUES (1,'Mid-Term Assessment',1,1,'school');
INSERT INTO `exams` VALUES (2,'Term 1 Final',1,1,'school');
INSERT INTO `exams` VALUES (3,'Madrasa Term 1 Exam',1,1,'madrasa');
/*!40000 ALTER TABLE `exams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fee_structure`
--

DROP TABLE IF EXISTS `fee_structure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fee_structure` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `fee_type` varchar(60) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_fee_year` (`year_id`),
  KEY `fk_fee_term` (`term_id`),
  KEY `fk_fee_class` (`class_id`),
  CONSTRAINT `fk_fee_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fee_term` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fee_year` FOREIGN KEY (`year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_fee_amount` CHECK (`amount` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fee_structure`
--

LOCK TABLES `fee_structure` WRITE;
/*!40000 ALTER TABLE `fee_structure` DISABLE KEYS */;
INSERT INTO `fee_structure` VALUES (1,1,1,3,'Tuition',150000.00,'2026-09-15');
INSERT INTO `fee_structure` VALUES (2,1,1,3,'Examination',15000.00,'2026-09-15');
INSERT INTO `fee_structure` VALUES (3,1,1,3,'Transport',30000.00,'2026-09-15');
/*!40000 ALTER TABLE `fee_structure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grading_scale`
--

DROP TABLE IF EXISTS `grading_scale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grading_scale` (
  `grade` char(1) NOT NULL,
  `min_score` decimal(5,2) NOT NULL,
  `max_score` decimal(5,2) NOT NULL,
  `label` varchar(30) NOT NULL,
  `swahili_label` varchar(30) NOT NULL,
  PRIMARY KEY (`grade`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grading_scale`
--

LOCK TABLES `grading_scale` WRITE;
/*!40000 ALTER TABLE `grading_scale` DISABLE KEYS */;
INSERT INTO `grading_scale` VALUES ('A',80.00,100.00,'Excellent','Bora');
INSERT INTO `grading_scale` VALUES ('B',65.00,79.00,'Very Good','Vizuri Sana');
INSERT INTO `grading_scale` VALUES ('C',50.00,64.00,'Good','Vizuri');
INSERT INTO `grading_scale` VALUES ('D',35.00,49.00,'Fair','Wastani');
INSERT INTO `grading_scale` VALUES ('F',0.00,34.00,'Fail','Hafifu');
/*!40000 ALTER TABLE `grading_scale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `method` enum('Cash','Bank','Mobile Money') NOT NULL,
  `reference_no` varchar(60) DEFAULT NULL,
  `receipt_no` varchar(20) NOT NULL,
  `term_id` int(11) NOT NULL,
  `year_id` int(11) NOT NULL,
  `recorded_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipt_no` (`receipt_no`),
  KEY `fk_pay_year` (`year_id`),
  KEY `fk_pay_user` (`recorded_by`),
  KEY `idx_pay_student` (`student_id`),
  KEY `idx_pay_term` (`term_id`,`year_id`),
  CONSTRAINT `fk_pay_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pay_term` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pay_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pay_year` FOREIGN KEY (`year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_pay_amount` CHECK (`amount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_remarks`
--

DROP TABLE IF EXISTS `report_remarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `report_remarks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `teacher_comment` varchar(255) DEFAULT NULL,
  `head_teacher_comment` varchar(255) DEFAULT NULL,
  `madrasa_comment` varchar(255) DEFAULT NULL,
  `final_remarks` varchar(255) DEFAULT NULL,
  `conduct` varchar(30) DEFAULT NULL,
  `cleanliness` varchar(30) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_remarks` (`student_id`,`term_id`),
  KEY `fk_remarks_term` (`term_id`),
  CONSTRAINT `fk_remarks_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_remarks_term` FOREIGN KEY (`term_id`) REFERENCES `terms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_remarks`
--

LOCK TABLES `report_remarks` WRITE;
/*!40000 ALTER TABLE `report_remarks` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_remarks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `results`
--

DROP TABLE IF EXISTS `results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `stream_id` int(11) DEFAULT NULL,
  `hw` decimal(5,2) DEFAULT NULL,
  `ct` decimal(5,2) DEFAULT NULL,
  `cw` decimal(5,2) DEFAULT NULL,
  `fe` decimal(5,2) NOT NULL,
  `total` decimal(5,2) NOT NULL,
  `grade` char(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_result` (`student_id`,`subject_id`,`exam_id`),
  KEY `fk_results_subject` (`subject_id`),
  KEY `fk_results_class` (`class_id`),
  KEY `fk_results_stream` (`stream_id`),
  KEY `fk_results_grade` (`grade`),
  KEY `idx_results_student` (`student_id`),
  KEY `idx_results_exam` (`exam_id`),
  CONSTRAINT `fk_results_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_results_exam` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_results_grade` FOREIGN KEY (`grade`) REFERENCES `grading_scale` (`grade`),
  CONSTRAINT `fk_results_stream` FOREIGN KEY (`stream_id`) REFERENCES `streams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_results_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_results_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_results_marks` CHECK ((`hw` is null or `hw` between 0 and 100) and (`ct` is null or `ct` between 0 and 100) and (`cw` is null or `cw` between 0 and 100) and `fe` between 0 and 100 and `total` between 0 and 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `results`
--

LOCK TABLES `results` WRITE;
/*!40000 ALTER TABLE `results` DISABLE KEYS */;
/*!40000 ALTER TABLE `results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` tinyint(4) NOT NULL DEFAULT 1,
  `school_name` varchar(150) NOT NULL,
  `short_name` varchar(30) NOT NULL,
  `address` varchar(200) DEFAULT NULL,
  `phone` varchar(60) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'TZS',
  `current_year_id` int(11) DEFAULT NULL,
  `current_term_id` int(11) DEFAULT NULL,
  `receipt_footer` varchar(255) DEFAULT NULL,
  `hw_weight` tinyint(4) NOT NULL DEFAULT 10,
  `ct_weight` tinyint(4) NOT NULL DEFAULT 20,
  `cw_weight` tinyint(4) NOT NULL DEFAULT 10,
  `fe_weight` tinyint(4) NOT NULL DEFAULT 60,
  `madrasa_fe_weight` tinyint(4) NOT NULL DEFAULT 100,
  PRIMARY KEY (`id`),
  KEY `fk_settings_year` (`current_year_id`),
  KEY `fk_settings_term` (`current_term_id`),
  CONSTRAINT `fk_settings_term` FOREIGN KEY (`current_term_id`) REFERENCES `terms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_settings_year` FOREIGN KEY (`current_year_id`) REFERENCES `academic_years` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_settings_single_row` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'NIA — Nimble Integrated Academy','NIA','Zanzibar, Tanzania','+255 000 000 000','info@nia.ac.tz','TZS',1,1,'Thank you for your payment.',10,20,10,60,100);
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `streams`
--

DROP TABLE IF EXISTS `streams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `streams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `name` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stream_per_class` (`class_id`,`name`),
  CONSTRAINT `fk_streams_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `streams`
--

LOCK TABLES `streams` WRITE;
/*!40000 ALTER TABLE `streams` DISABLE KEYS */;
INSERT INTO `streams` VALUES (1,1,'A');
INSERT INTO `streams` VALUES (2,1,'B');
INSERT INTO `streams` VALUES (3,3,'A');
INSERT INTO `streams` VALUES (4,3,'B');
/*!40000 ALTER TABLE `streams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admission_no` varchar(20) NOT NULL,
  `first_name` varchar(80) NOT NULL,
  `last_name` varchar(80) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `dob` date NOT NULL,
  `pob` varchar(100) DEFAULT NULL,
  `guardian_name` varchar(120) DEFAULT NULL,
  `guardian_phone` varchar(30) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `emergency_contact` varchar(30) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `admission_date` date NOT NULL,
  `status` enum('active','graduated','transferred','suspended','inactive') NOT NULL DEFAULT 'active',
  `in_school` tinyint(1) NOT NULL DEFAULT 1,
  `school_class_id` int(11) DEFAULT NULL,
  `school_stream_id` int(11) DEFAULT NULL,
  `in_madrasa` tinyint(1) NOT NULL DEFAULT 0,
  `madrasa_class_id` int(11) DEFAULT NULL,
  `madrasa_stream_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `admission_no` (`admission_no`),
  KEY `fk_students_school_stream` (`school_stream_id`),
  KEY `fk_students_madrasa_stream` (`madrasa_stream_id`),
  KEY `idx_students_name` (`last_name`,`first_name`),
  KEY `idx_students_school_class` (`school_class_id`),
  KEY `idx_students_madrasa_class` (`madrasa_class_id`),
  CONSTRAINT `fk_students_madrasa_class` FOREIGN KEY (`madrasa_class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_madrasa_stream` FOREIGN KEY (`madrasa_stream_id`) REFERENCES `streams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_school_class` FOREIGN KEY (`school_class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_school_stream` FOREIGN KEY (`school_stream_id`) REFERENCES `streams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (2,'NIA-STD-0002','Yusuf','Khamis','Male','2016-08-02','Zanzibar','Bi. Khamis','0777222333','Chake Chake','0777222334',NULL,'2022-01-15','active',1,3,3,0,NULL,NULL,'2026-08-21 11:36:19','2026-08-21 11:36:19');
INSERT INTO `students` VALUES (3,'NIA-STD-0003','Fatuma','Said','Female','2017-01-20','Pemba','Bw. Said','0777444555','Wete','0777444556',NULL,'2023-01-10','active',1,3,4,1,4,NULL,'2026-08-21 11:36:19','2026-08-21 11:36:19');
INSERT INTO `students` VALUES (4,'NIA-STD-0004','Mussa','Mohd','Male','2025-09-28','mkoani','juma','0614447486','Mtoni kidatu','07777777',NULL,'2026-08-21','active',1,1,1,1,4,NULL,'2026-08-21 14:36:32','2026-08-21 14:36:32');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `code` varchar(10) NOT NULL,
  `section` enum('school','madrasa') NOT NULL DEFAULT 'school',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_subject_code_section` (`code`,`section`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'Mathematics','MATH','school');
INSERT INTO `subjects` VALUES (2,'English','ENG','school');
INSERT INTO `subjects` VALUES (3,'Kiswahili','KIS','school');
INSERT INTO `subjects` VALUES (4,'Science','SCI','school');
INSERT INTO `subjects` VALUES (5,'Social Studies','SST','school');
INSERT INTO `subjects` VALUES (6,'Quran Recitation','QUR','madrasa');
INSERT INTO `subjects` VALUES (7,'Fiqh','FIQ','madrasa');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_classes`
--

DROP TABLE IF EXISTS `teacher_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_classes` (
  `teacher_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  PRIMARY KEY (`teacher_id`,`class_id`),
  KEY `fk_tc_class` (`class_id`),
  CONSTRAINT `fk_tc_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tc_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_classes`
--

LOCK TABLES `teacher_classes` WRITE;
/*!40000 ALTER TABLE `teacher_classes` DISABLE KEYS */;
INSERT INTO `teacher_classes` VALUES (1,3);
INSERT INTO `teacher_classes` VALUES (2,4);
/*!40000 ALTER TABLE `teacher_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_subjects`
--

DROP TABLE IF EXISTS `teacher_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher_subjects` (
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  PRIMARY KEY (`teacher_id`,`subject_id`),
  KEY `fk_ts_subject` (`subject_id`),
  CONSTRAINT `fk_ts_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ts_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_subjects`
--

LOCK TABLES `teacher_subjects` WRITE;
/*!40000 ALTER TABLE `teacher_subjects` DISABLE KEYS */;
INSERT INTO `teacher_subjects` VALUES (1,1);
INSERT INTO `teacher_subjects` VALUES (1,4);
INSERT INTO `teacher_subjects` VALUES (2,6);
INSERT INTO `teacher_subjects` VALUES (2,7);
/*!40000 ALTER TABLE `teacher_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_no` varchar(20) NOT NULL,
  `name` varchar(120) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(120) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `employment_date` date DEFAULT NULL,
  `assignment` enum('school','madrasa','both') NOT NULL DEFAULT 'school',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `teacher_no` (`teacher_no`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES (1,'NIA-TCH-0001','Mr. Ali Hassan','Male','0777000001','ali@nia.ac.tz','Stone Town','2022-01-10','school','active','2026-08-21 11:36:19');
INSERT INTO `teachers` VALUES (2,'NIA-TCH-0002','Ustadha Zainab','Female','0777000002','zainab@nia.ac.tz','Mwanakwerekwe','2023-03-01','madrasa','active','2026-08-21 11:36:19');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `terms`
--

DROP TABLE IF EXISTS `terms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `terms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year_id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_term_per_year` (`year_id`,`name`),
  CONSTRAINT `fk_terms_year` FOREIGN KEY (`year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `terms`
--

LOCK TABLES `terms` WRITE;
/*!40000 ALTER TABLE `terms` DISABLE KEYS */;
INSERT INTO `terms` VALUES (1,1,'Term 1',1);
INSERT INTO `terms` VALUES (2,1,'Term 2',0);
INSERT INTO `terms` VALUES (3,1,'Term 3',0);
/*!40000 ALTER TABLE `terms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `timetable`
--

DROP TABLE IF EXISTS `timetable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `timetable` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `stream_id` int(11) DEFAULT NULL,
  `day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `room` varchar(60) DEFAULT NULL,
  `section` enum('school','madrasa') NOT NULL DEFAULT 'school',
  PRIMARY KEY (`id`),
  KEY `fk_tt_subject` (`subject_id`),
  KEY `fk_tt_stream` (`stream_id`),
  KEY `idx_tt_teacher_day` (`teacher_id`,`day`),
  KEY `idx_tt_class_day` (`class_id`,`day`),
  CONSTRAINT `fk_tt_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tt_stream` FOREIGN KEY (`stream_id`) REFERENCES `streams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tt_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tt_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_tt_time` CHECK (`end_time` > `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `timetable`
--

LOCK TABLES `timetable` WRITE;
/*!40000 ALTER TABLE `timetable` DISABLE KEYS */;
/*!40000 ALTER TABLE `timetable` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_timetable_conflict_insert
BEFORE INSERT ON timetable
FOR EACH ROW
BEGIN
  DECLARE conflict_count INT;

  SELECT COUNT(*) INTO conflict_count FROM timetable
   WHERE day = NEW.day AND teacher_id = NEW.teacher_id
     AND start_time < NEW.end_time AND end_time > NEW.start_time;
  IF conflict_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Timetable conflict: this teacher is already booked for an overlapping time on this day.';
  END IF;

  SELECT COUNT(*) INTO conflict_count FROM timetable
   WHERE day = NEW.day AND class_id = NEW.class_id
     AND stream_id <=> NEW.stream_id
     AND start_time < NEW.end_time AND end_time > NEW.start_time;
  IF conflict_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Timetable conflict: this class/stream already has a lesson at an overlapping time on this day.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER trg_timetable_conflict_update
BEFORE UPDATE ON timetable
FOR EACH ROW
BEGIN
  DECLARE conflict_count INT;

  SELECT COUNT(*) INTO conflict_count FROM timetable
   WHERE id <> OLD.id AND day = NEW.day AND teacher_id = NEW.teacher_id
     AND start_time < NEW.end_time AND end_time > NEW.start_time;
  IF conflict_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Timetable conflict: this teacher is already booked for an overlapping time on this day.';
  END IF;

  SELECT COUNT(*) INTO conflict_count FROM timetable
   WHERE id <> OLD.id AND day = NEW.day AND class_id = NEW.class_id
     AND stream_id <=> NEW.stream_id
     AND start_time < NEW.end_time AND end_time > NEW.start_time;
  IF conflict_count > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Timetable conflict: this class/stream already has a lesson at an overlapping time on this day.';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `user_children`
--

DROP TABLE IF EXISTS `user_children`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_children` (
  `user_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  PRIMARY KEY (`user_id`,`student_id`),
  KEY `fk_uc_student` (`student_id`),
  CONSTRAINT `fk_uc_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_uc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_children`
--

LOCK TABLES `user_children` WRITE;
/*!40000 ALTER TABLE `user_children` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_children` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(60) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','accountant','teacher','parent','pupil') NOT NULL,
  `name` varchar(120) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `uq_user_per_student` (`student_id`),
  KEY `fk_users_teacher` (`teacher_id`),
  CONSTRAINT `fk_users_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_users_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$CujCfXjyJmF/rmiFKnBuSeaKxzOEUBUTkKUmFqmfJRs4wUFRTfeI.','admin','System Administrator',NULL,NULL,'active',0,'2026-08-21 14:34:47','2026-08-21 11:36:19');
INSERT INTO `users` VALUES (2,'accountant','$2b$10$/ePb3y0yuaFIHLLVEJlOg.xYE1GF7RTguAxA/dxga5m4.VSgrcWPy','accountant','Fatma Juma',NULL,NULL,'active',0,NULL,'2026-08-21 11:36:19');
INSERT INTO `users` VALUES (3,'teacher','$2b$10$0T2UxgXUg3CaS8MTke5gTOZZuGlzwq9meG15fE96m4PUiekBTvde.','teacher','Mr. Ali Hassan',1,NULL,'active',0,NULL,'2026-08-21 11:36:19');
INSERT INTO `users` VALUES (4,'parent','$2b$10$/eHXSb.USSHcB32snl0wMOJYekyAUNyMVmPpaFPl1ZqJsJYtoDs.S','parent','Mzee Vuai',NULL,NULL,'active',0,NULL,'2026-08-21 11:36:19');
INSERT INTO `users` VALUES (6,'NIA-STD-0002','$2b$10$aFc90vhiGqJXUN9HDCiTvOfbCFlQTO.qfVDvHc7/vpl5pXIY.sx3a','pupil','Yusuf Khamis',NULL,2,'active',1,NULL,'2026-08-21 11:36:19');
INSERT INTO `users` VALUES (7,'NIA-STD-0004','$2a$12$m9Srmo8sYTkzd1KWEPetzO5JAzTcUmL0VQbOeEppUKk2TypMnDJVW','pupil','Mussa Mohd',NULL,4,'active',1,NULL,'2026-08-21 14:36:33');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_attendance_percentage`
--

DROP TABLE IF EXISTS `v_attendance_percentage`;
/*!50001 DROP VIEW IF EXISTS `v_attendance_percentage`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_attendance_percentage` AS SELECT
 1 AS `student_id`,
  1 AS `days_recorded`,
  1 AS `days_present`,
  1 AS `attendance_pct` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_class_position`
--

DROP TABLE IF EXISTS `v_class_position`;
/*!50001 DROP VIEW IF EXISTS `v_class_position`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_class_position` AS SELECT
 1 AS `student_id`,
  1 AS `school_class_id`,
  1 AS `term_id`,
  1 AS `average_total`,
  1 AS `position`,
  1 AS `out_of` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_madrasa_position`
--

DROP TABLE IF EXISTS `v_madrasa_position`;
/*!50001 DROP VIEW IF EXISTS `v_madrasa_position`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_madrasa_position` AS SELECT
 1 AS `student_id`,
  1 AS `madrasa_class_id`,
  1 AS `term_id`,
  1 AS `average_total`,
  1 AS `position`,
  1 AS `out_of` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_madrasa_term_average`
--

DROP TABLE IF EXISTS `v_madrasa_term_average`;
/*!50001 DROP VIEW IF EXISTS `v_madrasa_term_average`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_madrasa_term_average` AS SELECT
 1 AS `student_id`,
  1 AS `term_id`,
  1 AS `average_total` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_school_term_average`
--

DROP TABLE IF EXISTS `v_school_term_average`;
/*!50001 DROP VIEW IF EXISTS `v_school_term_average`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_school_term_average` AS SELECT
 1 AS `student_id`,
  1 AS `term_id`,
  1 AS `average_total` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_student_current_balance`
--

DROP TABLE IF EXISTS `v_student_current_balance`;
/*!50001 DROP VIEW IF EXISTS `v_student_current_balance`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_student_current_balance` AS SELECT
 1 AS `student_id`,
  1 AS `admission_no`,
  1 AS `student_name`,
  1 AS `current_year_id`,
  1 AS `current_term_id`,
  1 AS `required_fees`,
  1 AS `amount_paid`,
  1 AS `balance` */;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_attendance_percentage`
--

/*!50001 DROP VIEW IF EXISTS `v_attendance_percentage`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_attendance_percentage` AS select `attendance`.`student_id` AS `student_id`,count(0) AS `days_recorded`,sum(`attendance`.`status` in ('Present','Late')) AS `days_present`,round(100 * sum(`attendance`.`status` in ('Present','Late')) / count(0),1) AS `attendance_pct` from `attendance` group by `attendance`.`student_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_class_position`
--

/*!50001 DROP VIEW IF EXISTS `v_class_position`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_class_position` AS select `s`.`id` AS `student_id`,`s`.`school_class_id` AS `school_class_id`,`va`.`term_id` AS `term_id`,round(`va`.`average_total`,1) AS `average_total`,rank() over ( partition by `s`.`school_class_id`,`va`.`term_id` order by `va`.`average_total` desc) AS `position`,count(0) over ( partition by `s`.`school_class_id`,`va`.`term_id`) AS `out_of` from (`students` `s` join `v_school_term_average` `va` on(`va`.`student_id` = `s`.`id`)) where `s`.`status` = 'active' */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_madrasa_position`
--

/*!50001 DROP VIEW IF EXISTS `v_madrasa_position`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_madrasa_position` AS select `s`.`id` AS `student_id`,`s`.`madrasa_class_id` AS `madrasa_class_id`,`va`.`term_id` AS `term_id`,round(`va`.`average_total`,1) AS `average_total`,rank() over ( partition by `s`.`madrasa_class_id`,`va`.`term_id` order by `va`.`average_total` desc) AS `position`,count(0) over ( partition by `s`.`madrasa_class_id`,`va`.`term_id`) AS `out_of` from (`students` `s` join `v_madrasa_term_average` `va` on(`va`.`student_id` = `s`.`id`)) where `s`.`status` = 'active' and `s`.`in_madrasa` = 1 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_madrasa_term_average`
--

/*!50001 DROP VIEW IF EXISTS `v_madrasa_term_average`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_madrasa_term_average` AS select `r`.`student_id` AS `student_id`,`e`.`term_id` AS `term_id`,avg(`r`.`total`) AS `average_total` from (`results` `r` join `exams` `e` on(`e`.`id` = `r`.`exam_id` and `e`.`section` = 'madrasa')) group by `r`.`student_id`,`e`.`term_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_school_term_average`
--

/*!50001 DROP VIEW IF EXISTS `v_school_term_average`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_school_term_average` AS select `r`.`student_id` AS `student_id`,`e`.`term_id` AS `term_id`,avg(`r`.`total`) AS `average_total` from (`results` `r` join `exams` `e` on(`e`.`id` = `r`.`exam_id` and `e`.`section` = 'school')) group by `r`.`student_id`,`e`.`term_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_student_current_balance`
--

/*!50001 DROP VIEW IF EXISTS `v_student_current_balance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_student_current_balance` AS select `s`.`id` AS `student_id`,`s`.`admission_no` AS `admission_no`,concat(`s`.`first_name`,' ',`s`.`last_name`) AS `student_name`,`st`.`current_year_id` AS `current_year_id`,`st`.`current_term_id` AS `current_term_id`,coalesce(`fee`.`required`,0) AS `required_fees`,coalesce(`pay`.`paid`,0) AS `amount_paid`,greatest(coalesce(`fee`.`required`,0) - coalesce(`pay`.`paid`,0),0) AS `balance` from (((`students` `s` join `settings` `st`) left join (select `fee_structure`.`class_id` AS `class_id`,`fee_structure`.`year_id` AS `year_id`,`fee_structure`.`term_id` AS `term_id`,sum(`fee_structure`.`amount`) AS `required` from `fee_structure` group by `fee_structure`.`class_id`,`fee_structure`.`year_id`,`fee_structure`.`term_id`) `fee` on(`fee`.`class_id` = `s`.`school_class_id` and `fee`.`year_id` = `st`.`current_year_id` and `fee`.`term_id` = `st`.`current_term_id`)) left join (select `payments`.`student_id` AS `student_id`,`payments`.`year_id` AS `year_id`,`payments`.`term_id` AS `term_id`,sum(`payments`.`amount`) AS `paid` from `payments` group by `payments`.`student_id`,`payments`.`year_id`,`payments`.`term_id`) `pay` on(`pay`.`student_id` = `s`.`id` and `pay`.`year_id` = `st`.`current_year_id` and `pay`.`term_id` = `st`.`current_term_id`)) where `s`.`status` = 'active' */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-22 14:56:10
