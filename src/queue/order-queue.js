import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { prismaClient } from "../application/database.js";

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

// 1. Antrean Utama (Main Queue)
export const orderQueue = new Queue("OrderProcessingQueue", {
  connection: redisConnection,
});

// 2. Antrean Dead Letter (DLQ) untuk menampung job yang gagal total setelah retry
export const deadLetterQueue = new Queue("OrderDeadLetterQueue", {
  connection: redisConnection,
});

// 3. Worker untuk memproses Tugas Asinkronus
const orderWorker = new Worker(
  "OrderProcessingQueue",
  async (job) => {
    const { orderId, customerEmail, totalPrice, userId } = job.data;

    // Skenario A: Kirim Email Invoice
    console.log(
      `[Async Service] Mengirim email invoice ke ${customerEmail} untuk Order #${orderId}`,
    );
    // (Simulasi kirim email sukses)

    // Skenario B: Simpan Activity Log ke Database via Prisma
    console.log(
      `[Async Service] Menyimpan activity log untuk User ID: ${userId}`,
    );
    await prismaClient.activityLog.create({
      data: {
        user_id: userId,
        action: "CREATE_ORDER",
        details: `User berhasil melakukan order #${orderId} sebesar Rp${totalPrice}`,
        created_at: new Date(),
      },
    });

    // Skenario C: Kirim Notifikasi Async tambahan (misal internal push notification)
    console.log(
      `[Async Service] Notifikasi async berhasil dikirim untuk Order #${orderId}`,
    );
  },
  { connection: redisConnection },
);

// --- HANDLING REQ: RETRY & DEAD LETTER HANDLING ---

orderWorker.on("failed", async (job, err) => {
  // Cek apakah job sudah mencapai batas maksimal retry (misal 3 kali)
  if (job.attemptsMade >= job.opts.attempts) {
    console.error(
      `[DLQ Triggered] Job ${job.id} gagal total setelah ${job.attemptsMade} kali percobaan. Memindahkan ke Dead Letter Queue...`,
    );

    // Masukkan data rusak/gagal ke antrean Dead Letter untuk diperiksa admin nanti
    await deadLetterQueue.add("failedOrderReport", {
      originalJobId: job.id,
      errorReason: err.message,
      failedData: job.data,
      failedAt: new Date(),
    });
  } else {
    console.warn(
      `[Retry Mechanism] Job ${job.id} gagal (Percobaan ke-${job.attemptsMade}). Akan dicoba lagi otomatis.`,
    );
  }
});
