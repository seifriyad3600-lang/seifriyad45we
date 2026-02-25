const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const pino = require("pino")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
        const { connection } = update

        if (connection === "connecting") {
            console.log("🔄 Connecting to WhatsApp...")
        }

        if (connection === "open") {
            console.log("✅ SeifBot Connected Successfully!")
        }
    })

    if (!state.creds.registered) {
        const phoneNumber = "201144534147" // حط رقمك هنا

        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber)
            console.log("\n📲 Pairing Code:\n")
            console.log(code)
        }, 4000)
    }
}

startBot()
