import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Comment } from "../models/comment.model.js"
import mongoose, {isValidObjectId} from "mongoose"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid videoId is required");
    }

    const pipeline = [
        { $match: { video: new mongoose.Types.ObjectId(videoId) } },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [{ $project: { username: 1, fullname: 1, avatar: 1 } }],
            },
        },
        { $addFields: { owner: { $first: "$owner" } } },
    ];

    const options = {
        page: Math.max(parseInt(page, 10) || 1, 1),
        limit: Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50),
    };

    const comments = await Comment.aggregatePaginate(Comment.aggregate(pipeline), options);

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
})

const addComment = asyncHandler(async (req, res) => {
    // add a comment to a video
    const {videoId} = req.params // while sending the id no '' or "" required send the id as it is
    const {comment} = req.body // is {} is used then json format is used to send the data

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid videoId is required")
    }

    if(!comment?.trim()) {
        throw new ApiError(400 , "comment is required")
    }

  const newComment = await  Comment.create({
    video : videoId,
    comment : comment.trim(),
    owner : req.user._id
   })

   if(!newComment) {
    throw new ApiError(500 , "Comment not added")
   }

   return res
   .status(200)
   .json(
    new ApiResponse(
        200 , newComment ,  "commented Successfully"
    )
   )
})

const updateComment = asyncHandler(async (req, res) => {
    // update a comment
    const {commentId} = req.params
    const {comment}  = req.body

    if(!isValidObjectId(commentId) || !comment?.trim()) {
        throw new ApiError(400, "Valid commentId and comment text are required")
    }

    const existing = await Comment.findById(commentId);
    if (!existing) {
        throw new ApiError(404, "Comment not found");
    }
    if (existing.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only edit your own comments");
    }

  const updatedComment =  await Comment.findByIdAndUpdate(
        commentId,
        {
           $set : {
               comment : comment.trim()
           }
        },
        {
            new : true
        }
    )

    if(!updatedComment) {
        throw new ApiError(500 , "Comment not updated")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , updatedComment ,  "Comment updated Successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // delete a comment
    const {commentId} = req.params

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Valid commentId is required")
    }

    const existing = await Comment.findById(commentId);
    if (!existing) {
        throw new ApiError(404, "Comment not found");
    }
    if (existing.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own comments");
    }

   await Comment.findByIdAndDelete(commentId)

return res
.status(200)
.json(
    new ApiResponse(
        200 , {} , "Comment deleted Successfully"
)
)
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
}
