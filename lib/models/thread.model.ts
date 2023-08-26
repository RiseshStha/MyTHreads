import mongoose from "mongoose";
//creating thread model


const threadSchema = new mongoose.Schema({
    text: {type: String, required: true},
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    parentId:{
        type:String,
    },
    children: [
    { //it means one thread can have multiple threads as children
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread"
    },
],

});

const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema); // first time we need to create the user model and later on second time it create on that instance

export default Thread;

//eg
//  Thread Original
//    ->Thread Comment1
//    ->Thread Comment2
//         ->Thread Comment3