module.exports = [
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/pages-api-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/socket.io [external] (socket.io, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("socket.io");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/src/pages/api/socket.ts [api] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$socket$2e$io__$5b$external$5d$__$28$socket$2e$io$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/socket.io [external] (socket.io, esm_import)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$socket$2e$io__$5b$external$5d$__$28$socket$2e$io$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$socket$2e$io__$5b$external$5d$__$28$socket$2e$io$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
const config = {
    api: {
        bodyParser: false
    }
};
let users = []; // Array untuk menyimpan daftar pengguna
const socketHandler = async (req, res)=>{
    // Pastikan server socket hanya dibuat sekali
    if (!res.socket.server.io) {
        console.log("New Socket.io server...");
        // Mengadaptasi Next.js server ke http server
        const httpServer = res.socket.server;
        // Membuat instance server socket.io
        const io = new __TURBOPACK__imported__module__$5b$externals$5d2f$socket$2e$io__$5b$external$5d$__$28$socket$2e$io$2c$__esm_import$29$__["Server"](httpServer, {
            path: "/api/socket"
        });
        // Menyimpan server socket di res.socket.server untuk akses di lain tempat
        res.socket.server.io = io;
        // Konfigurasi event pada koneksi socket.io
        io.on("connection", (socket)=>{
            console.log(`User connected: ${socket.id}`);
            // Event userJoined (Hanya menangani sekali)
            socket.on("userJoined", (userName)=>{
                const newUser = {
                    id: socket.id,
                    name: userName
                };
                users.push(newUser); // Menambahkan pengguna baru ke daftar
                io.emit("users", users); // Kirim daftar pengguna terbaru ke semua klien
                io.emit("message", {
                    user: "System",
                    msg: `${userName} has joined the chat.`
                });
            });
            // Event message
            socket.on("message", (msgData)=>{
                io.emit("message", msgData); // Broadcast pesan ke semua klien
            });
            // Event disconnect (userLeft)
            socket.on("disconnect", ()=>{
                const user = users.find((u)=>u.id === socket.id);
                if (user) {
                    users = users.filter((u)=>u.id !== socket.id); // Hapus pengguna dari daftar
                    io.emit("users", users); // Kirim daftar pengguna terbaru ke semua klien
                    io.emit("message", {
                        user: "System",
                        msg: `${user.name} has left the chat.`
                    });
                }
            });
        });
    }
    // Menutup response
    res.end();
};
const __TURBOPACK__default__export__ = socketHandler;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1e797443._.js.map