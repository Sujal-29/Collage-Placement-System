const User = require("../../models/user.model.js");
const cloudinary = require("../../config/Cloudinary.js");

const UpdatePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded." });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ msg: "Cloudinary credentials are missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend .env." });
    }

    const userId = req.body.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: "User not found!" });

    // If a previous stored profile picture exists on Cloudinary, delete it
    if (user.profile && user.profile.includes("res.cloudinary.com") && user.profile !== "https://res.cloudinary.com/dgu6xwnzx/image/upload/v1743159225/defaultProfileImg_cmmurk.jpg") {
      const oldImagePublicId = user.profile.split("/").pop().split(".")[0]; // Extract public ID
      await cloudinary.uploader.destroy(`CPMS/Profile/${oldImagePublicId}`);
    }

    // Upload new profile photo to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: "CPMS/Profile",
      width: 300, // Resize to 300px for optimization
      height: 300,
      crop: "fill",
    });

    // Update user profile picture URL in MongoDB
    user.profile = cloudinaryResponse.secure_url;
    await user.save();

    return res.status(201).json({ msg: "Profile Picture Updated Successfully!", url: cloudinaryResponse.secure_url });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({ msg: "Server error", error });
  }
};

module.exports = UpdatePhoto;
