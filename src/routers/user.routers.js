import {Router} from "express";
import { registerUser , 
    loginUser , 
    loggoutUser  , 
    RefreshAccessToken , 
    updatePassword , 
    getCurrentUser ,
    updateUserAccountDetails, 
    upadeUserAvatar,
    updateUserCoverImage ,
     getUserChannelDetails , 
     getWatchHistory,
     deleteAvatar
    } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';   
import {validateJWT} from '../middlewares/auth.middleware.js';


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

router.route("/logout").post(validateJWT , loggoutUser)

router.route("/refresh-token").post(RefreshAccessToken)
router.route("/change-password").post(validateJWT , updatePassword)
router.route("/current-user").get(validateJWT , getCurrentUser)
router.route("/update-user").patch(validateJWT , updateUserAccountDetails)
router.route("/avatar").patch(validateJWT , upload.single("avatar") , upadeUserAvatar)
router.route("/avatar").delete(validateJWT , deleteAvatar)
router.route("/cover-image").patch(validateJWT , upload.single("coverImage") , updateUserCoverImage)
router.route("/c/:username").get(validateJWT , getUserChannelDetails)
router.route("/history").get(validateJWT , getWatchHistory)

export default router;