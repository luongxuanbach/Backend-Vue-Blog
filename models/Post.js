import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        author: { type: String, default: 'Anonymous' },
        thumbnail: { type: String, default: '' },
        published: { type: Boolean, default: false },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;