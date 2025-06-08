import { prismaClient } from "../src/application/database.js";
import bcrypt from "bcrypt"

export const removeUser = async () => {
  await prismaClient.user.deleteMany({
    where: {
      username: "test"
    }
  });
}

export const createUser = async () => {
  await prismaClient.user.create({
    data: {
      username: "test",
      password: await bcrypt.hash("testing", 10),
      name: "Test",
      token: "test"
    }
  });
}

export const getUser = async () => {
  return prismaClient.user.findUnique({
    where: {
      username: "test"
    }
  });
}

export const removeAllContacts = async () => {
  await prismaClient.contact.deleteMany({
    where: {
      username: "test"
    }
  });
}