"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

// we don't use api to call or render data in client side
// we render all components in server side to optimize seo and render page quickly

interface Params{ // creating interface for object userId,....
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

// creating new function to update the user

export async function updateUser({ // creating object of userId,.. because to prevent error while passing parameter while calling this function
    userId,
    username,
    name,
    bio,
    image,
    path,
}: Params): Promise<void> {
    connectToDB();
    
    try{
        await User.findOneAndUpdate(
            {id: userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            {upsert: true} // upsert mean simply updating if object is already exist and inserting if object is not exist
        );
    
        if(path === '/profile/edit'){ 
            revalidatePath(path); // it revalidate the data associated with a specific path, updating the catch data without wating for revalidation period to expire.
        }
    }
    catch(error: any){
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
    
}

export async function fetchUser(userId: string){
    try{
        connectToDB();

        return await User.findOne({id: userId})
        // .populate({
        //     path: 'communities',
        //     model: Community
        // })
    }
    catch(error: any){
        throw new Error(`Failed to fetch user: ${error.message}`)
    }
}

export async function fetchUserPosts(userId: string){
    try{
        connectToDB();

        //Find all threads authored by user with the given userId

        //TODO: Populate community
        const threads = await User.findOne({id: userId})
        .populate({
            path: 'threads',
            model: Thread,
            populate:{
                path:'children',
                model: Thread,
                populate:{
                    path: 'author',
                    model: User,
                    select: "name image id"
                }
            }
        })
        return threads;
    }
    catch(error: any){
        throw new Error(`Failed to fetch user post: ${error.message}`);
    }
}

export async function fetchUsers({
    userId,
    searchString="",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
}:{
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder
}){
    try{


        const skipAmount = (pageNumber-1) * pageSize;

        const regex = new RegExp(searchString, "i");

        const query: FilterQuery<typeof User> =  {
            id: {$ne: userId}
        }

        if(searchString.trim() !== ''){
            query.$or = [
                {username: { $regex: regex}},
                {name: { $regex: regex}}
            ]
        }

        const sortOptions = { createdAt: sortBy};

        const userQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

        const totalUsersCount =  await User.countDocuments(query);

        const users = await userQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return {users, isNext}
    }
    catch(error: any){
        throw new Error(`Failed to fetch users: ${error.message}`);
    }
}

export async function getActivity(userId: string){
    try{
        connectToDB();

        //find all threads created by user
        const userThreads = await Thread.find({ author: userId});

        //Collect all the child thread ids (replies) from the children field
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
        }, [])

        const replies = await Thread.find({
            _id: { $in: childThreadIds},
            author: { $ne: userId}
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        })

        return replies;
    }
    catch(error: any){
        throw new Error(`Failed to fetch Activity: ${error.message}`)
    }
}