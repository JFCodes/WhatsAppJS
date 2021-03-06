export default {
    BOT: {
        HEADLESS: false,
        DEVTOOLS: false,
        WIDTH: 1200,
        HEIGHT: 800,
    },
    WAHTSAPP: {
        ROOTURL: 'https://web.whatsapp.com/',
        PERSIST_SESSION: true,
        TICKS: {
            LOGIN_CHECK: 500,
            INPUTS_LISTENER: 1000
        },
        TIME_PAD: {
            AFTER_SESSION_RECOVER: 15000, // Yer, its that bad
            STANDARD: 1000,
            DOM_UPDATE: 150,
        },
        TARGET_CHAT: 'Myself'
    }
}
