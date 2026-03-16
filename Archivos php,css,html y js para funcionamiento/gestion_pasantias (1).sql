-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 10, 2025 at 06:12 PM
-- Server version: 10.1.38-MariaDB
-- PHP Version: 7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gestion_pasantias`
--

-- --------------------------------------------------------

--
-- Table structure for table `empresas`
--

CREATE TABLE `empresas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `importancia` enum('Importante','Medio importante','No tan importante') NOT NULL,
  `ubicacion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `pasante_comentarios`
--

CREATE TABLE `pasante_comentarios` (
  `id` int(11) NOT NULL,
  `pasante_id` int(11) NOT NULL,
  `supervisor_email` varchar(100) NOT NULL,
  `comentario` varchar(255) NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `pasante_supervisor`
--

CREATE TABLE `pasante_supervisor` (
  `id` int(11) NOT NULL,
  `pasante_id` int(11) NOT NULL,
  `supervisor_email` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `testimonios`
--

CREATE TABLE `testimonios` (
  `id` int(11) NOT NULL,
  `autor` varchar(100) NOT NULL,
  `texto` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `testimonios`
--

INSERT INTO `testimonios` (`id`, `autor`, `texto`, `fecha`) VALUES
(1, 'juan', 'este texto es de prueba ', '2025-06-17 01:38:52');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('pasante','moderador','admin','supervisor') NOT NULL,
  `nota` int(11) DEFAULT NULL,
  `horas_totales` int(11) DEFAULT NULL,
  `horas_cumplidas` int(11) DEFAULT '0',
  `asignado_empresa` varchar(100) DEFAULT NULL,
  `ubicacion_empresa` varchar(100) DEFAULT NULL,
  `comentarios` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nombre`, `email`, `password`, `role`, `nota`, `horas_totales`, `horas_cumplidas`, `asignado_empresa`, `ubicacion_empresa`, `comentarios`) VALUES
(7, 'Admin Demo', 'admin@empresa.com', '$2y$10$3jKjT0YIOmuSVQ14U/GdQOI5j6NFtTPgUrXfxh6SZo0RnGYQtg61G', 'admin', NULL, NULL, 0, NULL, NULL, NULL),
(8, 'juan', 'cortezurreajuanalberto@gmail.com', '$2y$10$A4rebLw.9aRH0BkTk3C4AO1np/wY5aVqpGelJ2b5Eyiz4m7bX39f.', 'moderador', NULL, NULL, 0, NULL, NULL, NULL),
(9, 'hola', 'cortaesta2@gmail.com', '$2y$10$bC1cc31uA/ATS3MX7X/paeGjBFCuEu6JCVwncicPTRQ54oFTI/ikS', 'moderador', NULL, NULL, 0, NULL, NULL, NULL),
(10, 'Kevin', 'kevin@gmail.com', '$2y$10$nY5a9S3aYtFhJGDfhvuCY.blwj3g6Q.1YI46LU3Yai8Dl3VmX04Du', 'pasante', 18, 460, 0, NULL, '', ''),
(11, 'hola', 'hi@gmail.com', '$2y$10$E3BEN6lFq/KuELZfAuE.C.Cue7/ZZAKpUk7BM/mEuV2nue7SiiUm.', 'moderador', NULL, NULL, 0, NULL, NULL, NULL),
(12, 'Administrador', 'admin@pasanticonnect.com', '$2y$10$56QToIZ58jy7JBy8tgnJeu3UVa1uSdZRgiOqiX8O0VJylt/2nFJoa', 'admin', NULL, NULL, 0, NULL, NULL, NULL),
(55, 'Admin Demo', 'admin1@empresa.com', '$2y$10$56QToIZ58jy7JBy8tgnJeu3UVa1uSdZRgiOqiX8O0VJylt/2nFJoa', 'supervisor', NULL, NULL, 0, NULL, NULL, NULL),
(56, 'JUan alberto', 'cortezurreaj@gmail.com', '$2y$10$HzuKbXOx4m5flNbHkXPG1ex5ErZV6zDc6GfzN6Cygthlkb0JfDBuq', 'pasante', NULL, NULL, 0, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `empresas`
--
ALTER TABLE `empresas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `pasante_comentarios`
--
ALTER TABLE `pasante_comentarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pasante_id` (`pasante_id`);

--
-- Indexes for table `pasante_supervisor`
--
ALTER TABLE `pasante_supervisor`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pasante_id` (`pasante_id`);

--
-- Indexes for table `testimonios`
--
ALTER TABLE `testimonios`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `empresas`
--
ALTER TABLE `empresas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pasante_comentarios`
--
ALTER TABLE `pasante_comentarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pasante_supervisor`
--
ALTER TABLE `pasante_supervisor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `testimonios`
--
ALTER TABLE `testimonios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pasante_comentarios`
--
ALTER TABLE `pasante_comentarios`
  ADD CONSTRAINT `pasante_comentarios_ibfk_1` FOREIGN KEY (`pasante_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pasante_supervisor`
--
ALTER TABLE `pasante_supervisor`
  ADD CONSTRAINT `pasante_supervisor_ibfk_1` FOREIGN KEY (`pasante_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
