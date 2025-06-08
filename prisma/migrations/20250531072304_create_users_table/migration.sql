-- CreateTable
CREATE TABLE `users` (
    `username` CHAR(100) NOT NULL,
    `password` CHAR(100) NOT NULL,
    `name` CHAR(100) NOT NULL,
    `token` CHAR(100) NULL,

    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE innoDB;
