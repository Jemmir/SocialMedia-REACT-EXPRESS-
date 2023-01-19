import { Router } from "express";
import bcrypt from "bcrypt"
import { User } from "../models/User.js";
import { deleteImage, uploadImage } from "../cloudinary/cloudinary.js";
import fs from "fs-extra";
import sharp from "sharp"
import cloudinary from "cloudinary"

const router = Router();

//updateuser
router.put("/:id", async(req,res) => {
    
    try {
        if(req.body.userId === req.params.id || req.body.isAdmin){
            if(req.body.password){
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }

            const user = await User.findById(req.body.userId)
            let image = null;
            let cover = null
            console.log(req.files)
            if(req.files?.cover !== undefined && req.files?.image !== undefined){
                user.coverPicture.url !== undefined && await deleteImage(user.coverPicture.public_id)
                user.profilePicture.url !== undefined && await deleteImage(user.profilePicture.public_id)
                const result1 = await uploadImage(req.files.cover.tempFilePath)
                await fs.remove(req.files.cover.tempFilePath);
                cover = {
                url: result1.url,
                public_id: result1.public_id,
                }
                user.coverPicture = cover;
                                            
                sharp(req.files.image.tempFilePath)
                .resize(300, 500)
                .toFile("./upload/lana", async(e,i) => {
                    
                const result = await uploadImage("./upload/lana")
                await fs.remove("./upload/lana")
                await fs.remove(req.files.image.tempFilePath);
                image = {
                url: result.url,
                public_id: result.public_id,
                }
                user.profilePicture = image;
                req.body.desc !== "undefined" && (user.desc = req.body.desc)
                req.body.name !== "undefined" && (user.name = req.body.name)
                req.body.from !== "undefined" && (user.from = req.body.from)
                              
                await user.save()
                return res.json(user)
            })
            }else if(req.files?.cover){
                if(user?.coverPicture?.url !== undefined) {
                
                    await deleteImage(user.coverPicture.public_id)
                    
                    
                        
                    const result = await uploadImage(req.files.cover.tempFilePath)
                   
                    await fs.remove(req.files.cover.tempFilePath);
                    cover = {
                    url: result.url,
                    public_id: result.public_id,
                    }
                    user.coverPicture = cover;
                    req.body.desc !== "undefined" && (user.desc = req.body.desc)
                    req.body.name !== "undefined" && (user.name = req.body.name)
                    req.body.from !== "undefined" && (user.from = req.body.from)
                    await user.save()
                    return res.json(user)
                                                            
                                                         
                    }else{           
                                        
                    const result = await uploadImage(req?.files?.cover?.tempFilePath);
                                                        
                    await fs.remove(req.files.cover.tempFilePath);
                    cover = {
                    url: result.url,
                    public_id: result.public_id,
                    }
                    user.coverPicture = cover;
                    req.body.desc !== "undefined" && (user.desc = req.body.desc)
                    req.body.name !== "undefined" && (user.name = req.body.name)
                    req.body.from !== "undefined" && (user.from = req.body.from)
                    await user.save()
                    return res.json(user)}
                

            }else if(req.files?.image){
                if(user?.profilePicture?.url !== undefined) {
                
                await deleteImage(user.profilePicture.public_id)
                sharp(req.files.image.tempFilePath)
                .resize(300, 500)
                .toFile("./upload/lana", async(e,i) => {
                    
                const result = await uploadImage("./upload/lana")
                await fs.remove("./upload/lana")
                await fs.remove(req.files.image.tempFilePath);
                image = {
                url: result.url,
                public_id: result.public_id,
                }
                user.profilePicture = image;
                req.body.desc !== "undefined" && (user.desc = req.body.desc)
                req.body.name !== "undefined" && (user.name = req.body.name)
                req.body.from !== "undefined" && (user.from = req.body.from)

                console.log("desde aqui")
                await user.save()
                return res.json(user)
                })
                        
                }else{           
                
                    sharp(req.files.image.tempFilePath)
                    .resize(300, 500)
                    .toFile("./upload/lana", async(e,i) => {
                    const result = await uploadImage("./upload/lana")
                    await fs.remove("./upload/lana")
                    await fs.remove(req.files.image.tempFilePath);
                    image = {
                    url: result.url,
                    public_id: result.public_id,
                    }
                    user.profilePicture = image;
                    req.body.desc !== "undefined" && (user.desc = req.body.desc)
                    req.body.name !== "undefined" && (user.name = req.body.name)
                    req.body.from !== "undefined" && (user.from = req.body.from)
                    await user.save()
                    return res.json(user)
                    })}
              
            }else{
                req.body.desc !== "undefined" && (user.desc = req.body.desc)
                req.body.name !== "undefined" && (user.name = req.body.name)
                req.body.from !== "undefined" && (user.from = req.body.from)
                await user.save()
                return res.json(user)
            }
        }else throw new Error("You can't update a different user than yours")

    } catch (error) {
        if(error.message === "You can't update a different user than yours"){
            res.status(403).json(error.message)
        }
    }
   
})

//delete user
router.delete("/:id", async(req,res) => {
    try {
        if(req.body.userId === req.params.id || req.body.isAdmin){
            const user = await User.findByIdAndDelete(req.body.userId)
            return res.status(200).json("User has been deleted successfully")
        }else throw new Error("You can't delete a different user than yours")

    } catch (error) {
        if(error.message === "You can't delete a different user than yours"){
            res.status(403).json(error.message)
        }
    }
   
})

//get a user

router.get("/", async(req,res) => {
    
    try {
        if(req.query.username !== undefined && req.query.nofull !== undefined){
        const user = await User.findOne({username: req.query.username})
        
        if(user){
            const {password, updatedAt, isAdmin, email, followers, following, coverPicture,from ,createdAt,__v, ...other} = user._doc
            return res.status(200).send(other)
        }else if(!user){
            throw new Error("User not found")
        }
        }
        else if(req.query.username !== undefined && req.query.full !== undefined){
        const user = await User.findOne({username: req.query.username})
        
        if(user){
            const {password, updatedAt, isAdmin, ...other} = user._doc
            return res.status(200).send(other)
        }else if(!user){
            throw new Error("User not found")
        }
        }
        
    } catch (error) {
        console.log(error)
        if(error.message === "User not found"){
            return res.status(500).json({message: error.message})
        }
    }
   
})

//follow a user

router.put("/:id/follow", async(req,res) => {
    try {
        if(req.body.userId !== req.params.id){
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
         
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{followers: req.body.userId}})
                await currentUser.updateOne({$push:{following: req.params.id}})
                return res.status(200).json("User is now been followed")
            }else{
                throw new Error("Already in follow")
            }
        }else {
            throw new Error("You can't follow yourself")
        }
    } catch (error) {
        console.log(error)
        error.message === "You can't follow yourself" && res.status(403).json(error.message)
        error.message === "Already in follow" && res.status(403).json(error.message)

    }
})

router.put("/:id/unfollow", async(req,res) => {
    try {
        if(req.body.userId !== req.params.id){
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.body.userId)
         
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers: req.body.userId}})
                await currentUser.updateOne({$pull:{following: req.params.id}})
                return res.status(200).json("User is now been unfollowed")
            }else{
                throw new Error("This user is not being follow by you")
            }
        }else {
            throw new Error("You can't unfollow yourself")
        }
    } catch (error) {
        console.log(error)
        error.message === "You can't unfollow yourself" && res.status(403).json(error.message)
        error.message === "This user is not being follow by you" && res.status(403).json(error.message)

    }
})

//search for users
router.get("/:name/search", async(req,res) => {
    try {
        function containsSpecialChars(str) {
            const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            return specialChars.test(str);
          }
        let resp = containsSpecialChars(req.params.name)
        if(resp){
            throw new Error("Special characters are not allowed")
        }else if(!resp){
        const user = await User.aggregate([
            { "$match": { name : {$regex: req.params.name , $options: "i" }}},
            { "$sort": { "name": 1 } },
            { $project: {
                _id: 1,
                name: '$name',
                profilePicture: '$profilePicture',
                username: "$username"
                
              }
            }
        ])
        
        
        return res.status(200).json(user)
        }
        
    } catch (error) {
        return res.status(400).json(error.message)
    }
})

export default router