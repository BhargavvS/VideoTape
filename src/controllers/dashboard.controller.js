import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user._id;

    const [videoStats] = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
            },
        },
    ]);

    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    const channelVideoIds = await Video.find({ owner: channelId }).distinct("_id");
    const totalLikes = channelVideoIds.length
        ? await Like.countDocuments({ video: { $in: channelVideoIds } })
        : 0;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    totalVideos: videoStats?.totalVideos || 0,
                    totalViews: videoStats?.totalViews || 0,
                    totalSubscribers,
                    totalLikes,
                },
                "Channel stats fetched successfully"
            )
        )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all the videos uploaded by the channel
    const videos = await Video.find({ owner: req.user._id })
        .populate("owner", "username fullname avatar")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
})

export {
    getChannelStats, 
    getChannelVideos
    }
