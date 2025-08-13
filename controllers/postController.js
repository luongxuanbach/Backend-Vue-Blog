import Post from "../models/Post.js";
import Category from "../models/Category.js";


// @desc Lấy danh sách bài viết (có phân trang + search + lọc category + published)
export const getPosts = async (req, res) => {
    try {

        console.log("Get Posts called with query:", req.query);
        const { page = 1, limit = 10, search = "", category, published } = req.query;

        const query = {};
        if (search) query.title = { $regex: search, $options: "i" };
        if (category) query.category = category;
        if (published !== undefined) query.published = published === "true";

        const total = await Post.countDocuments(query);
        const posts = await Post.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 })
            .populate("category");

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
        const post = await Post.findById(req.params.id).populate("category");
        if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Tạo bài viết mới
export const createPost = async (req, res) => {
    try {
        console.log("Create Post called with body:", req.body);

        let imageUrl = '';
        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file);
        } else {
            imageUrl = req.body.thumbnail || '';
        }

        const { title, content, author, category, published } = req.body;
        const post = await Post.create({
            title,
            content,
            author: author || 'Anonymous',
            thumbnail: imageUrl,
            category,
            published: published ?? false
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Cập nhật bài viết
export const updatePost = async (req, res) => {
    try {
        const { title, content, author, category, published } = req.body;
        const updateData = { title, content, author, category, published };

        // Nếu có ảnh mới
        if (req.file) {
            updateData.thumbnail = await uploadImageToCloudinary(req.file);
        } else if (req.body.thumbnail) {
            updateData.thumbnail = req.body.thumbnail;
        }

        const post = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });
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

// @desc Cập nhật trạng thái published
export const togglePublish = async (req, res) => {
    try {
        const { published } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { published },
            { new: true }
        );
        if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload lên Cloudinary
const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Bcommy");
    formData.append("cloud_name", "dardcocuk");

    const res = await fetch(
        "https://api.cloudinary.com/v1_1/dardcocuk/image/upload",
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await res.json();
    return data.secure_url;
};

export default {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    togglePublish
};
