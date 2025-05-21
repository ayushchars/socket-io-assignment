import express  from "express"
import { addMessageToChat, createOrGetChatId, getChatbyId } from "./chatController.js"
import { requireSignin } from "../../middleware/authMiddleware.js";


const router = express.Router()

router.post('/chats', createOrGetChatId);
router.post('/chats/messages', addMessageToChat);
router.post('/getChatbyId', requireSignin, getChatbyId);

export default router