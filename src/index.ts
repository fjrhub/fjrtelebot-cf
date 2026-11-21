import { Bot, webhookCallback } from "grammy"

export interface Env {
  BOT_TOKEN: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Guard: kalau token belum ada, kasih pesan jelas (bukan 1101)
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
      console.error("WORKER ERROR:", err?.message || err) // muncul di Logs
      return new Response(`Internal Error: ${err?.message}`, { status: 500 })
    }
  }
}