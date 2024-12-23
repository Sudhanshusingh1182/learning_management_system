import jwt from "jsonwebtoken"

const isAuthenticated = async(req,res,next)=>{
   try{
       const token = req.cookies.token;

       //if token is not present , the user is not logged in
       if(!token){
         return res.status(401).json({
            message:"User not authenticated",
            success:false
         })
       }
       
       //if token is there , we need to verify it
       const decode = jwt.verify(token,process.env.SECRET_KEY);
       
       //if token is invalid, return response
       if(!decode){
          return res.status(401).json({
             message:"Invalid token",
             success:false
          })
       }

       req.id = decode.userId; //check generateToken for reference of userId
       
       next();

   } catch(error){
       console.log(error);
   }
};

export default isAuthenticated;