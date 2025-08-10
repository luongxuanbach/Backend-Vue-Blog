import Post from "../models/Post.js";

// @desc Lấy danh sách bài viết (có phân trang + search)
export const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const query = search
            ? { title: { $regex: search, $options: "i" } }
            : {};

        const total = await Post.countDocuments(query);
        const posts = await Post.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        res.json({
            total,
            page: Number(page),
            limit: Number(limit),
            data: posts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Lấy 1 bài viết
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Tạo bài viết mới
export const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.create({ title, content });
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Cập nhật bài viết
export const updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Xóa bài viết
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });
        res.json({ message: "Xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
};