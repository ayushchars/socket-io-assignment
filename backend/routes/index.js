import express from "express"
import cors  from "cors";

import authRoute from "../controller/auth/auth.js"
import chatRoute from "../controller/chat/chat.js"
const app = express();
app.use(cors());

app.use("/auth",authRoute)
app.use("/chat",chatRoute)

export default app