import { Bot, webhookCallback } from "grammy"

export interface Env {
  BOT_TOKEN: string
  CHAT_ID: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      if (!env.BOT_TOKEN) {
        return new Response("❌ BOT_TOKEN belum di-set! Cek Settings → Variables.", { status: 500 })
      }

      const bot = new Bot(env.BOT_TOKEN)

      bot.command("start", (ctx) => ctx.reply("Halo! Bot sudah berjalan 🚀"))
      bot.command("help", (ctx) => ctx.reply("Ini bantuan bot"))
      bot.on("message:text", (ctx) => ctx.reply(`Anda mengirim: ${ctx.message.text}`))

      if (request.method === "POST") {
        const handler = webhookCallback(bot, "cloudflare-mod")
        return await handler(request)
      }

      return new Response("✅ Bot is running! (Webhook aktif, jangan buka via browser untuk tes bot)")
    } catch (err: any) {
      console.error("WORKER ERROR:", err?.message || err)
      return new Response(`Internal Error: ${err?.message}`, { status: 500 })
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // ✅ Perbaikan: langsung await, tidak perlu ctx.waitUntil()
    console.log(`🕒 Cron job dipicu pada: ${new Date(event.scheduledTime).toISOString()}`)

    const bot = new Bot(env.BOT_TOKEN)

    const wibTime = new Date(event.scheduledTime).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour12: false,
    })

    await bot.api.sendMessage(
      env.CHAT_ID,
      `⏰ <b>Cron Job Berjalan!</b>\nWaktu: ${wibTime} WIB`,
      { parse_mode: "HTML" }
    )
  },
}