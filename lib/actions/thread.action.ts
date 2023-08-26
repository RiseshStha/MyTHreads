"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params{
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}


export async function createThread({text, author, communityId, path}:Params){
    try{
        connectToDB();

        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        });

    //Update user model
    await User.findByIdAndUpdate(author, {
        $push: {threads: createdThread._id}
    });

    revalidatePath(path);
    }
    catch(error: any){
        throw new Error(`Error creating thread: ${error.message}`);
    }
    
}

export async function fetchPosts(pageNumber = 1, pageSize = 20){ // it for fetching post from database(mongodb)
    connectToDB();

    //Calculate the number of the post to skip
    const skipAmount = (pageNumber -1) * pageSize;

    //Fetch the post that have no parents (top-level threads)
    const postsQuery = Thread.find({parentId: { $in: [null, undefined]}})
    .sort({createdAt: 'desc'})
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: 'author', model: User})
    .populate({
        path: "children",
        populate:{
            path: "author",
            model: User,
            select: "_id name parentId image"
        },
    });
    // make totalPostSount to get total posts count, it is needed for total number of pages
    const totalPostsCount = await Thread.countDocuments({parentId: {$in: [null, undefined]}});

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return {posts, isNext};

}

export async function fetchThreadById(id: string){
    connectToDB();

    try{

        //TODO: Populate community

        const thread = await Thread.findById(id)
        .populate({
            path:'author',
            model: User,
            select:"_id id name image"
        })
        .populate({
            path:'children',
            populate: [
                {
                path: 'author',
                model: User,
                select: "_id id name parentId image"
            },
            {
                path:'children',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: "_id id name parentId image"
                }
            }
            ]
        }).exec();
        return thread;

    }
    catch(error){
        console.log(error);
    }
}

export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string,
    path: string,
){
    connectToDB();

    try{
        //FInd the original thread by it's ID
        const originalThread = await Thread.findById(threadId);
        // console.log("It is original threads",originalThread);
        if(!originalThread){
            throw new Error("Thread not Found");
        }

        //Create a new thread with the comment text
        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId, // Set the parentID to the original thread's ID
        });

        //Save the new thread
        const savedCommentThread = await commentThread.save();
        try{
            //Update the original thread to include the new comment
            originalThread.children.push(savedCommentThread._id);
        }catch(error){
            console.log(error);
        }

        //Save the original thread
        await originalThread.save();

        revalidatePath(path);
    }
    catch(error: any){
        throw new Error(`Error adding comment to thread: ${error.message}`);
    }
}