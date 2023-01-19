import mongoose from "mongoose"

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    lastMessage:{
      type: String
    },
    sender:{
      type:String
    },
    newMessagesCount:{
      type:Number,
      default:0
    }
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", ConversationSchema)
