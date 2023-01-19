import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from "morgan"
import {config} from "dotenv"
import users from './routes/users.js';
import auth from './routes/auth.js'
import posts from './routes/posts.js'
import http from "http"
import fileUpload from "express-fileupload";
import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import {Server as SocketServer} from "socket.io"
import conversations from "./routes/conversation.js"
import messages from "./routes/messages.js"
import cors from "cors"

config();
const app = express();
const server = http.createServer(app)
export const io = new SocketServer(server, {
  cors:{
    origin: "http://localhost:3000"
  }
})
mongoose.set("strictQuery", true).connect(process.env.MONGO_URI)
.then(() => console.log("Conectado a la db"))
.catch(e => console.log("Error " + e ));

const __dirname = dirname(fileURLToPath(import.meta.url))
//socketio


let userSocket = [];

const addUser = (username, socketId) => {
  if(!userSocket.some((user) => user.username === username)){
    userSocket.push({ username, socketId });
  }else if((userSocket.some((user) => user.username === username) && userSocket.some((user) => user.socketId !== socketId))){ 
    userSocket = userSocket.filter(i => i.username !== username)
    userSocket.push({username, socketId})
    return
  }
};

const removeUser = (socketId) => {
  userSocket = userSocket.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
  return userSocket.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (username) => {
    addUser(username, socket.id);
    io.emit("getUsers", userSocket);
    console.log(userSocket)
  });

  //newPost
  socket.on("mensaje al usuario", (userId, post) => {
       
    socket.broadcast.emit("mensaje usuario", {
        "userId": userId,
        "post": post.post

    })
})
  //send and get message
  socket.on("sendMessage", ({ senderUsername, receiverUsername, text }) => {
    const user = getUser(receiverUsername);
    
    io.to(user.socketId).emit("getMessage", {
      senderUsername,
      text,
    });
  });

   //when disconnect
   socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", userSocket);
  });
  
  
});



//middlewares

const corsOptions = {
  credentials: true,
  origin: process.env.LINK || "*",
  methods: ["GET", "POST", "PUT", "DELETE"]
}


app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan("common"))
app.use(
    fileUpload({
      tempFileDir: "./upload",
      useTempFiles: true,
    })
  );
//

app.use("/api/users", users)
app.use("/api/auth", auth)
app.use("/api/posts", posts)
app.use("/api/conversation", conversations)
app.use("/api/messages", messages)



server.listen(8000, () => console.log("Server running on http://localhost:8000") )