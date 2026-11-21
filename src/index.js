import { Bot, webhookCallback } from "grammy"

export interface Env {
  BOT_TOKEN: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const bot = new Bot(env.BOT_TOKEN)
    
    // Command /start
    bot.command("start", (ctx) => {
      ctx.reply("Halo! Bot sudah berjalan 🚀")
    })
    
    // Command /help
    bot.command("help", (ctx) => {
      ctx.reply("Ini bantuan bot")
    })
    
    // Handle pesan teks
    bot.on("message:text", (ctx) => {
      ctx.reply(`Anda mengirim: ${ctx.message.text}`)
    })
    
    // Handle webhook dari Telegram (ini yang menggantikan express)
    if (request.method === "POST") {
      const handler = webhookCallback(bot, "cloudflare-mod")
      return handler(request)
    }
    
    // Response untuk GET request (cek bot alive)
    return new Response("Bot is running!")
  }
}