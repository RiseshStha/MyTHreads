import mongoose from "mongoose";
//creating user model


const userSchema = new mongoose.Schema({
    id: { type: String, required: true},
    username: { type: String, required: true, unique: true},
    name: {type: String, required: true},
    image: String,
    bio: String,
    threads: [ //it means one user can create many threads
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Thread"
        }
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    communities: [ // one user can be in many community
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community"
        }
    ]
});

const User = mongoose.models.User || mongoose.model('User', userSchema); // first time we need to create the user model and later on second time it create on that instance

export default User;