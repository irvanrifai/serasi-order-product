import { prismaClient } from "../src/application/database.js";
import bcrypt from "bcrypt";

async function main() {
  const hashedPassword = await bcrypt.hash("password", 10);

  // 1. Seed Data Admin
  const admin = await prismaClient.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@admin.com",
      name: "Admin SERA",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 2. Seed Data Merchant
  const merchant = await prismaClient.user.upsert({
    where: { email: "merchant@merchant.com" },
    update: {},
    create: {
      username: "merchant",
      email: "merchant@merchant.com",
      name: "Giga Merchant Store",
      password: hashedPassword,
      role: "MERCHANT",
    },
  });
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
