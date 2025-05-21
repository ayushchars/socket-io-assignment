import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true,
        trim  :true
    },
    email :{ 
        type : String,
        required  :true,
        unique : true
    },
    password :{ 
        type : String,
        required  :true,
    },

    isOnline: {
        type: Boolean,
        default: false
    },

},{timestamps : true})

export default mongoose.model("Users",UserSchema)