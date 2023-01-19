import { Router } from "express";
import { Conversation } from "../models/Conversation.js";
const router = Router();

//new conv

router.post("/", async (req, res) => {
  
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.body.senderUsername, req.body.receiverUsername] },
    });
    console.log(conversation)
    if(conversation) throw new Error("Conversation already exists")
    else if(!conversation){
        const newConversation = new Conversation({
            members: [req.body.senderUsername, req.body.receiverUsername],
        });
    
        const savedConversation = await newConversation.save();
        return res.status(200).json(savedConversation);
    }
    
  } catch (err) {
    
   return res.status(500).json(err.message)
    
  }
});

//get conv of a user

router.get("/:username", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.username] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});


//update lastmessage
router.put("/", async(req,res) => {
  try {
    const conversation = await Conversation.findOneAndUpdate({
      members: { $all: [req.body.senderUsername, req.body.receiverUsername] },
    }, {lastMessage: req.body.text, sender:req.body.senderUsername});
    res.status(200).json(conversation)
  } catch (error) {
    res.status(500).json(error)
  }
})

// get conv includes two userId
router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation)
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router
