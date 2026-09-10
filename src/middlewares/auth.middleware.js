import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js"


// steps
// get the ascess token fro the cookies or from the req headers
// the token comes as barrier AccessToken , remove the barrier keyword
// check if the token is recived or not
// verify using the jwt.verify methos
// the decoded token is the user_id
// if exist return else error
export const validateJWT = asyncHandler( async (req,res ,next) => 
    {
  try {
    const token  =  req.cookies?.accessToken || req.header
      ("authorization")?.replace(/^bearer\s+/i,"")
  
      if(!token) {
          throw new ApiError(401 , "UnAuthorized request") 
      }
  
     const decodedToken =  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
  
  const user = await User.findById(decodedToken._id).select("-password -refreshToken")

  if (!user) {
      throw new ApiError(401, "User no longer exists")
  }
  
  req.user = user
  
    next()
  } catch (error) {
    throw new ApiError(401 , error?.message || "UnAuthorized request")
  }
    
}) 