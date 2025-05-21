import express from 'express';
import mongoose from 'mongoose';
import Chat from '../../models/chatModel.js';
import User from '../../models/userModel.js';
import {
  ErrorResponse,
  successResponse,
  notFoundResponse,
  successResponseWithData
} from '../../helpers/apiResponse.js';

const router = express.Router();

export const createOrGetChatId = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sender) || !mongoose.Types.ObjectId.isValid(receiver)) {
      return ErrorResponse(res, "Invalid user IDs");
    }

    const userOne = await User.findById(sender);
    const userTwo = await User.findById(receiver);

    if (!userOne || !userTwo) {
      return notFoundResponse(res, "One or both users not found");
    }

    const participants = [sender, receiver].sort();

    let chat = await Chat.findOne({
      participants: { $all: participants, $size: 2 }
    });

    if (!chat) {
      chat = new Chat({
        participants,
        messages: []
      });
      await chat.save();
    }

    return successResponseWithData(res, "Chat found or created successfully", { chatId: chat._id });
  } catch (error) {
    console.error("Error occurred during creating or getting chat ID:", error);
    return res.status(500).send({
      success: false,
      message: "Error while creating or getting chat ID",
      error,
    });
  }
};

export const addMessageToChat = async (req, res) => {
  try {
    const { chatId, senderId, receiverId, text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return ErrorResponse(res, "Invalid IDs");
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return notFoundResponse(res, "Chat not found");
    }

    if (chat.block) {
      return ErrorResponse(res, "Chat is blocked. Messages cannot be sent.");
    }

    if (!chat.participants.includes(senderId) || !chat.participants.includes(receiverId)) {
      return ErrorResponse(res, "Sender or receiver is not a participant of this chat");
    }

    chat.messages.push({ senderId, receiverId, text });
    await chat.save();

    return successResponseWithData(res, "Message added successfully", chat);
  } catch (error) {
    console.error("Error occurred during adding message to chat:", error);
    res.status(500).send({
      success: false,
      message: "Error while adding message to chat",
      error,
    });
  }
};

export const getChatbyId = async (req, res) => {
  try {
    const { id } = req.body;
    const chat = await Chat.findById(id)
      .populate({
        path: 'messages',
        populate: [
          {
            path: 'senderId',
            select: 'name' 
          },
          {
            path: 'receiverId',
            select: 'name' 
          }
        ]
      })
      .exec();

    if (!chat) {
      return res.status(404).send({
        success: false,
        message: 'Chat not found',
      });
    }

    return successResponseWithData(res, 'Chats fetched successfully', chat);
  } catch (error) {
    console.error('Error occurred while fetching chat:', error);
    res.status(500).send({
      success: false,
      message: 'Error while fetching chat',
    });
  }
};
