import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // toggle subscription

    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel ID is required")
    }

  const subscribed = await  Subscription.findOne({
        channel : channelId,
        subscriber : req.user._id
    })

    if(subscribed) {
       try {
        await Subscription.findByIdAndDelete(subscribed._id)

        return res
        .status(200)
        .json(
            new ApiResponse(
                200 , {} , "Unsubscribed the channel sucessfully"
            )
        )
       } catch (error) {
              throw new ApiError(500, "Subscription not removed")
       }
    }

    if(!subscribed) {
          const newSubscription =   await Subscription.create(
                { subscriber : req.user._id,
                 channel : channelId}
            )
        
            if(!newSubscription) {
                throw new ApiError(500 , "Unsucessful Subscription")
            }

            return res
            .status(200)
            .json(
                new ApiResponse(
                    200 , newSubscription , "Subscribed to the channel successfully"
                )
            )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const id = channelId || req.params.subscriberId;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Valid channelId is required");
    }

    const subscribers = await Subscription.find({ channel: id })
        .populate("subscriber", "username fullname avatar")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const id = subscriberId || req.params.channelId;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Valid subscriberId is required");
    }

    const channels = await Subscription.find({ subscriber: id })
        .populate("channel", "username fullname avatar")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}