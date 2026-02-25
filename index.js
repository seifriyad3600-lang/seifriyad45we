const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const pino = require("pino")
const qrcode = require("qrcode-terminal")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr) {
            console.log("\n📱 Scan this QR:\n")
            qrcode.generate(qr, { small: true })
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        } else if (connection === "open") {
            console.log("✅ SeifBot Connected Successfully!")
        }
    })

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text
        if (!text) return

        const from = msg.key.remoteJid
        const body = text.toLowerCase()

        // MENU
        if (body === "menu") {
            await sock.sendMessage(from, {
                text: `👑 SeifBot

📜 الأوامر:
menu
ping
ai <سؤالك>`
            })
        }

        // PING
        if (body === "ping") {
            await sock.sendMessage(from, { text: "🏓 Pong!" })
        }

        // AI بسيط
        if (body.startsWith("ai ")) {
            const question = body.slice(3)
            let reply = "🤖 مش فاهم السؤال بس بحاول أتعلم 😅"

            if (question.includes("اسمك")) reply = "أنا SeifBot 👑"
            else if (question.includes("عامل ايه")) reply = "تمام يا سيف 🔥"
            else if (question.includes("مين")) reply = "أنا بوت ذكي بسيط 😎"

            await sock.sendMessage(from, { text: reply })
        }
    })
}

startBot()
