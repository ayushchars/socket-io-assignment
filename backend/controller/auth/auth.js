import express  from "express"
import {register,login, getAllUsersExceptLoggedIn, getUserbyId } from "./authContoller.js"
import validateUser from "../../middleware/validateUser.js"
import {requireSignin} from "../../middleware/authMiddleware.js"

const router = express.Router()

router.post("/register" ,validateUser, register)
router.post("/login" , login)
router.get('/allusers', requireSignin, getAllUsersExceptLoggedIn);
router.post('/getUserbyId', requireSignin, getUserbyId);



export default router