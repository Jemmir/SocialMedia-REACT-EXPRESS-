import { Router } from "express";

import { Post } from "../models/Post.js";
import { User } from "../models/User.js";



import { deleteImage, uploadImage, uploadVideo } from "../cloudinary/cloudinary.js";
import fs from "fs-extra";

import cloudinary from "cloudinary"
import { io } from "../index.js";

const router = Router();

//create a post 
router.post("/", async(req,res) => {
  let video = null
  let img = null
  

    try {
      if(req.files){
       
      if(req.files.uploadVideo !== undefined && req.files?.uploadVideo?.size <= 15000000){
        if(req.files.uploadImg !== undefined){
          const result = await uploadImage(req.files.uploadImg.tempFilePath)
        await fs.remove(req.files.uploadImg.tempFilePath);
        img = {
        url: result.url,
        public_id: result.public_id,
        
        }
        console.log("se ejecutó")
       
        }
        console.log(img)
        const result1 = await uploadVideo(req.files.uploadVideo.tempFilePath)
        await fs.remove(req.files.uploadVideo.tempFilePath);
        video = {
        url: result1.url,
        public_id: result1.public_id,
        }
        
        const newPost = new Post({...req.body, uploadVideo: video, uploadImg: img !== null ? img : null})
        const savedPost = await newPost.save()
        return res.status(200).json(savedPost)
      }else if(req.files.uploadImg !== undefined){
        const result = await uploadImage(req.files.uploadImg.tempFilePath)
        await fs.remove(req.files.uploadImg.tempFilePath);
        img = {
        url: result.url,
        public_id: result.public_id,
        }
        
        const newPost = new Post({...req.body, uploadImg: img})
        const savedPost = await newPost.save()
        return res.status(200).json(savedPost)
      }
    }else{
      const newPost = new Post(req.body)
      const savedPost = await newPost.save()
      
      return res.status(200).json(savedPost)
    }
    } catch (error) {
        console.log(error)
    }
})

//update post 

router.put("/:id", async(req, res) => {
    const post = await Post.findById(req.params.id)
    try {
        if(post.userId === req.body.userId){
            const updated = await post.updateOne({$set: req.body})
            return res.status(200).json("Updated successfully")
        }else throw new Error("This is not your post")
    } catch (error) {
        console.log(error)
        error.message === "This is not your post" && res.status(403).json(error.message)
    }
    
})

//delete post

router.delete("/:id", async(req, res) => {
    console.log(req.params.id)
    console.log(req.body)
    
    const post = await Post.findById(req.params.id)
    try {
        if(post.userId === req.body.userId){
            await post.deleteOne()
            return res.status(200).json("Post deleted")
        }else throw new Error("This is not your post")
    } catch (error) {
        console.log(error)
        error.message === "This is not your post" && res.status(403).json(error.message)
    }
    
})

//like a post

router.put("/:id/like", async(req,res) => {
    const post = await Post.findById(req.params.id)
    try {
        if(!post.likes.includes(req.body.userId)){
            post.likes.push(req.body.userId)
            post.likesNumber += 1
            await post.save()
            res.status(200).json("Liked")
        }else if(post.likes.includes(req.body.userId)){
            const nuevo = post.likes.filter((i) => i !== req.body.userId)
            post.likes = nuevo
            post.likesNumber -= 1
            await post.save()
            res.status(200).json("You took out your like")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

//get a post 

router.get("/:id", async(req,res) => {
    const post = await Post.findById(req.params.id)
    try {
        return res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
})

//get timeline post
router.get("/timeline/:userId/", async (req, res) => {
  let valor = Number(req.query.valor)
  let limit = Number(req.query.limit)
  let array = []
  console.log(valor, limit)
     try {
      const currentUser = await User.findById(req.params.userId);
   
      const friendPosts = await Promise.all(
        currentUser.following.map((friendId) => {
          return array.push(friendId)
        })
      );
      const postDefinitivos = await Post.aggregate([
        {$match: {userId:{$in: array}}},
        { $sort: {createdAt : -1 } },
        { $skip: valor },
        { $limit: limit }
      ])
      res.status(200).json(postDefinitivos);
    
   
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
//get user's all posts

router.get("/profile/:username", async (req, res) => {
    try {
      
      const posts = await Post.find({username: req.params.username});
      res.status(200).json(posts.sort((a,b) => b.createdAt - a.createdAt));
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
//get user's liked posts

router.get("/profile/:id/liked", async (req, res) => {
    try {
      
      const posts = await Post.find({likes: {$all: [req.params.id]}});
      res.status(200).json(posts.sort((a,b) => b.createdAt - a.createdAt));
    } catch (err) {
      res.status(500).json(err);
    }
  });

//get the most liked post

router.get("/mostliked/:userId", async(req,res) => {
    
      let array = []
     
         try {
          const currentUser = await User.findById(req.params.userId);
       
          const friendPosts = await Promise.all(
            currentUser.following.map((friendId) => {
              return friendId !== req.params.userId && array.push(friendId)
            })
          );
          
          const postDefinitivos = await Post.aggregate([
            {$match: {userId: {$in: array}}},
            
            {$group:{
              "_id":"$userId",
              
              "info":{
                "$max":{
                  "likesNumber":"$likesNumber",
                  "postId":"$_id",
                  "username": "$username",
                  "desc":"$desc",
                  "createdAt": "$createdAt",
                  "likes": "$likes",
                  "img": "$img",
                  "video": "$video",
                  "uploadVideo": "$uploadVideo",
                  "uploadImg": "$uploadImg"
                  
                }
              }
            }},
            {$limit:1}
            

           
            
          ])
          
          res.status(200).json(...postDefinitivos);
      
      
      } catch (err) {
        res.status(500).json(err);
      }
})
export default router