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

export const createContact = async () => {
  await prismaClient.contact.create({
    data: {
      username: "test",
      first_name: "first",
      last_name: "last",
      email: "mail@mail.id",
      phone: "08123456789"
    },
    select: {
      id: true
    }
  });
}

export const createManyContacts = async () => {
  for (let i = 0; i < 15; i++) {
    await prismaClient.contact.create({
      data: {
        username: "test",
        first_name: `first ${i}`,
        last_name: `last ${i}`,
        email: `mail${i}@mail.id`,
        phone: `0812345678${i}`
      }
    });
  }
}

export const getContact = async () => {
  return prismaClient.contact.findFirst({
    where: {
      username: "test"
    }
  });
}