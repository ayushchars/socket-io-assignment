import { Server } from "socket.io";
import userModel from "./models/userModel.js";
import Chat from "./models/chatModel.js";

const userSockets = {};

const updateUserStatus = async (userId, isOnline) => {
  try {
    await userModel.findByIdAndUpdate(userId, { isOnline });
  } catch (error) {
    console.error("error updating user status:", error);
  }
};

const initSocket = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  io.on("connection", (socket) => {
    socket.on("register", async (userId) => {
      userSockets[userId] = socket.id;
      await updateUserStatus(userId, true);
      io.emit("userStatusChanged", { userId, isOnline: true });
    });

    socket.on("disconnect", async () => {
      const userId = Object.keys(userSockets).find(id => userSockets[id] === socket.id);
      if (userId) {
        delete userSockets[userId];
        await updateUserStatus(userId, false);
        io.emit("userStatusChanged", { userId, isOnline: false });
      }
    });

    socket.on("sendMessage", async ({ chatId, senderId, receiverId, text }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit("error", "Chat not found");
          return;
        }
        if (!chat.participants.includes(senderId) || !chat.participants.includes(receiverId)) {
          socket.emit("error", "Sender or receiver is not a participant of this chat");
          return;
        }

        const message = { senderId, receiverId, text };
        chat.messages.push(message);
        await chat.save();

        if (userSockets[receiverId]) {
          io.to(userSockets[receiverId]).emit("messageReceived", { chatId, message });
        }

        socket.emit("messageReceived", { chatId, message });
      } catch (error) {
        console.error("err", error);
        socket.emit("error", "Error sending message");
      }
    });

    socket.on("typing", ({ chatId, senderId, receiverId }) => {
      const receiverSocketId = userSockets[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { chatId, senderId });
      }
    });
    
    socket.on("stopTyping", ({ chatId, senderId, receiverId }) => {
      const receiverSocketId = userSockets[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { chatId, senderId });
      }
    });
  });
};

export default initSocket;
