const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const pino = require("pino")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update

        if (qr) {
            console.log("\n📲 افتح الرابط ده في المتصفح:\n")
            console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qr}\n`)
        }

        if (connection === "connecting") {
            console.log("🔄 Connecting...")
        }

        if (connection === "open") {
            console.log("✅ SeifBot Connected Successfully!")
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        }
    })
}

startBot()
