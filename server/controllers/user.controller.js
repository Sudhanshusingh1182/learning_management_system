import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import { uploadMedia } from "../utils/cloudinary.js";

//business logic to register a new user
export const register = async(req,res)=>{
    try{
       
       //extract name, email and password from req ki body
       const {name,email,password, role}= req.body;

      
       //check if all the required fields are present 
       if(!name || !email || !password || !role){
          return res.status(400).json({
             success:false,
             message:"All fields are required."
          })
       }
       
       const user= await User.findOne({email});
       
       //check if the user is already registered or not
       if(user){
         return res.status(400).json({
            success:false,
            message:"User already exists with this email."
         })
       }

       const assignedRole = role?.toLowerCase();
       //hash the password
       const hashedPassword = await bcrypt.hash(password,10); 
       
       //create a new user in the database
       await User.create({
         name,
         email,
         password: hashedPassword,
         role : assignedRole
       })

       //return success response
       return res.status(201).json({
          success:true,
          message:"Account created successfully."
       })

    } catch(error){
          console.log("The error is :",error);
          return res.status(500).json({
            success:false,
            message:"Failed to register"
          })
          
    }
}

//business logic to login a user
export const login = async(req,res)=>{
    try{
      
      //extract email and password from req ki body  
      const {email,password}=  req.body;
      
      //check if the required fields are present or not
      if(!email || !password){
         return res.status(400).json({
            success:false,
            message:"Fill in all the required fields."
         })
      }

      //check if the user is already registered or not
      const user = await User.findOne({email});

      if(!user){
         return res.status(400).json({
            success:false,
            message:"User does not exist."
         })
      }
      
      //check if the passwords match
      const isPasswordMatched = await bcrypt.compare(password,user.password);
    
      if(!isPasswordMatched){
          return res.status(400).json({
            success:false,
            message:"Incorrect email or password"
          })
      }
      
      //generate a token for the user
      //This token helps to check whether the user is logged in or not
      
      generateToken(res,user,`Welcome back ${user.name}`)
      

    } catch(error){
        console.log("The error is :",error);
          return res.status(500).json({
            success:false,
            message:"Failed to login"
          })
    }
}

//business logic to logout a user
export const logout = async(_,res)=>{
   try{
      
      //delete or remove the cookie 
      return res.status(200).cookie("token","",{maxAge:0}).json({
         message:"Logged out successfully.",
         success:true
      })

   } catch(error){
      console.log("The error is :",error);
          return res.status(500).json({
            success:false,
            message:"Failed to logout"
          })
   }
}

//business logic to get the user details

export const getUserProfile = async(req,res)=>{
   try{
     //if someone is hitting this API , he has to be logged in.
     //For checking this , we would use a middleware beforehand to this

     const userId = req.id; //we are getting this from the middeware

     //find the user in the database
     const user = await User.findById(userId).select("-password").populate("enrolledCourses");

     if(!user){
       return res.status(404).json({
         success:false,
         message:"Profile not found"
       })
     }
     
     //return the profile of the user
     return res.status(200).json({
       success:true,
       user
     })

      
   } catch(error){
      console.log("The error is :",error);
      return res.status(500).json({
        success:false,
        message:"Failed to load user"
      })
   }
}

//business logic to update the user profile

export const updateProfile = async(req,res)=>{
   try{
      const userId = req.id;
      const {name}= req.body;
      const profilePhoto = req.file;
      
      const user = await User.findById(userId);

      if(!user){
         return res.status(404).json({
            success:false,
            message:"User not found"
         })
      }
      //profilePhoto won't be directly uploaded as photoUrl , 
      //we would need to use cloudinary
      
      //extract public id of the old image from the url , if it exists
      if(user.photoUrl){
         //extract public id
         const publicId = user.photoUrl.split("/").pop().split(".")[0]; 
         deleteMediaFromCloudinary(publicId); 
      }
      
      //upload new photo
      const cloudResponse = await uploadMedia(profilePhoto.path);
      const {secure_url:photoUrl}= cloudResponse;
      
      const updatedData = {name,photoUrl} 
      
      const updatedUser = await User.findByIdAndUpdate(userId,updatedData,{new:true}).select("-password");
      
      return res.status(200).json({
          success:true,
          user:updatedUser,
          message:"Profile updated successfully."
      })
      
   } catch(error){
      console.log("The error is :",error);
      return res.status(500).json({
        success:false,
        message:"Failed to update user profile"
      })
   }
}