import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    // get all videos based on query, sort and paginate

    const pipeline = [];

    // Only show published videos to other users; owners see their own via dashboard
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ],
            },
        });
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }
        pipeline.push({
            $match: { owner: new mongoose.Types.ObjectId(userId) },
        });
    } else {
        pipeline.push({ $match: { isPublished: true } });
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, fullname: 1, avatar: 1 } },
                ],
            },
        },
        { $addFields: { owner: { $first: "$owner" } } },
        { $sort: { [sortBy]: sortType === "asc" ? 1 : -1 } }
    );

    const options = {
        page: Math.max(parseInt(page, 10) || 1, 1),
        limit: Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50),
    };

    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    // get a video, upload to cloudinary, create a video
    const { title, description } = req.body;

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const videoUrl = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoUrl) {
        throw new ApiError(500, "Video not uploaded");
    }
    if (!thumbnailUrl) {
        throw new ApiError(500, "Thumbnail not uploaded");
    }

    const video = await Video.create({
        videoFile: videoUrl.url,
        thumbnail: thumbnailUrl.url,
        owner: req.user._id,
        title: title.trim(),
        description: description.trim(),
        duration: videoUrl.duration || 0,
        views: 0,
        isPublished: true,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid videoId is required")
    }

    const video = await Video.findById(videoId).populate("owner", "username fullname avatar");

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // count a view and push to the viewer's watch history (once)
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { watchHistory: video._id },
        });
        await User.findByIdAndUpdate(req.user._id, {
            $push: { watchHistory: { $each: [video._id], $position: 0, $slice: 100 } },
        });
    }

    const updated = await Video.findById(videoId).populate("owner", "username fullname avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, updated, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid videoId is required")
    }

    const { title, description } = req.body

    if (!title?.trim() && !description?.trim() && !req.file?.path) {
        throw new ApiError(400, "Title, description or thumbnail is required")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos");
    }

    const update = {};
    if (title?.trim()) update.title = title.trim();
    if (description?.trim()) update.description = description.trim();
    if (req.file?.path) {
        const thumbnailUrl = await uploadOnCloudinary(req.file.path);
        if (!thumbnailUrl) {
            throw new ApiError(500, "Thumbnail not uploaded");
        }
        update.thumbnail = thumbnailUrl.url;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: update },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})

const deleteAvideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid videoId is required")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only delete your own videos");
    }

    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Valid videoId is required")
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You can only update your own videos");
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Publish status toggled successfully"))
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteAvideo,
    togglePublishStatus
}
