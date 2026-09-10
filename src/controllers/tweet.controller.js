import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //create tweet
    const {content} = req.body    
    if(!content) {
        throw new ApiError(400, "Tweet is required")
    }

    const newTweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    if(!newTweet) {
        throw new ApiError(500, "Tweet not created")
    }

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200, newTweet, "Tweet created successfully"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // get user tweets
    const {userId} = req.params
    
    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID")
    }

const allUserTweet = await Tweet.aggregate(
        [
            {
                $match: {
                    owner : new mongoose.Types.ObjectId(userId)
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $project : {
                    content : 1,
                    owner : 1,
                    createdAt : 1
                }
            }
        ]
    )

    if(!allUserTweet) {
        throw new ApiError(500, "No tweets found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , allUserTweet , "All user tweets fetched successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //update tweet
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }
    const {content} = req.body

    if(!content?.trim()) {
        throw new ApiError(400, "Tweet content is required")
    }

    const existing = await Tweet.findById(tweetId);
    if (!existing) {
        throw new ApiError(404, "Tweet not found");
    }
    if (existing.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only edit your own posts");
    }

const updtaedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content : content.trim()
            }
        },
        {
            new : true
        }
    )

    if(!updtaedTweet) {
        throw new ApiError(500, "Tweet not updated")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , updtaedTweet , "Tweet updated successfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //delete tweet
    const {tweetId}  = req.params
    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID")
    }

    const existing = await Tweet.findById(tweetId);
    if (!existing) {
        throw new ApiError(404, "Tweet not found");
    }
    if (existing.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own posts");
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , {} , "Tweet deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}