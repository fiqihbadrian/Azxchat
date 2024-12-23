import { NextApiRequest } from "next";
import NextApiResponseServerIO from "@/types/next"; // Pastikan tipe NextApiResponseServerIO sudah terdefinisi dengan benar
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";

// Konfigurasi agar bodyParser dimatikan
export const config = {
  api: {
    bodyParser: false,
  },
};

type User = {
  id: string;
  name: string;
};

let users: User[] = []; // Array untuk menyimpan daftar pengguna

const socketHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  // Pastikan server socket hanya dibuat sekali
  if (!res.socket.server.io) {
    console.log("New Socket.io server...");

    // Mengadaptasi Next.js server ke http server
    const httpServer = res.socket.server as unknown as NetServer;

    // Membuat instance server socket.io
    const io = new ServerIO(httpServer, {
      path: "/api/socket", // Path yang digunakan untuk socket.io
    });

    // Menyimpan server socket di res.socket.server untuk akses di lain tempat
    res.socket.server.io = io;

    // Konfigurasi event pada koneksi socket.io
    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Event userJoined (Hanya menangani sekali)
      socket.on("userJoined", (userName: string) => {
        const newUser = { id: socket.id, name: userName };
        users.push(newUser); // Menambahkan pengguna baru ke daftar
        io.emit("users", users); // Kirim daftar pengguna terbaru ke semua klien
        io.emit("message", {
          user: "System",
          msg: `${userName} has joined the chat.`, // Pesan saat pengguna baru bergabung
        });
      });

      // Event message
      socket.on("message", (msgData) => {
        io.emit("message", msgData); // Broadcast pesan ke semua klien
      });

      // Event disconnect (userLeft)
      socket.on("disconnect", () => {
        const user = users.find((u) => u.id === socket.id);
        if (user) {
          users = users.filter((u) => u.id !== socket.id); // Hapus pengguna dari daftar
          io.emit("users", users); // Kirim daftar pengguna terbaru ke semua klien
          io.emit("message", {
            user: "System",
            msg: `${user.name} has left the chat.`,
          });
        }
      });
    });
  }

  // Menutup response
  res.end();
};

export default socketHandler;
