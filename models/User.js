import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required: true,
        min: 5,
        max: 25,
        unique: true
    },
    email:{
        type: String,
        required:true,
        max:50,
        unique:true

    },
    password:{
        type: String,
        required: true,
        min:6

    },
    profilePicture:{
        public_id: String,
        url: String,
    },
    coverPicture:{
        public_id: String,
        url: String,
    },
    followers:{
        type:Array,
        default:[]
    },
    following:{
        type:Array,
        default:[]
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    desc:{
        type:String,
        max:50
    },
    from:{
        type:String,
        max:50,
        required: true

    },
    city:{
        type:String,
        max:50
    },
    relationship:{
        type:String,
        enum:[1,2,3]
    },
    name:{
        type:String,
        required: true
    },
    
    
},{timestamps:true})

export const User = mongoose.model("User", UserSchema)