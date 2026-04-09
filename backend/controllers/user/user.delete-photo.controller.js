const User = require("../../models/user.model.js");
const cloudinary = require("../../config/Cloudinary.js");

const DeletePhoto = async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: "User not found!" });

    // Delete photo from Cloudinary if it's not the default
    if (user.profile && user.profile.includes("res.cloudinary.com") && user.profile !== "https://res.cloudinary.com/dgu6xwnzx/image/upload/v1743159225/defaultProfileImg_cmmurk.jpg") {
      const oldImagePublicId = user.profile.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`CPMS/Profile/${oldImagePublicId}`);
    }

    // Reset to default profile picture
    user.profile = "https://res.cloudinary.com/dgu6xwnzx/image/upload/v1743159225/defaultProfileImg_cmmurk.jpg";
    await user.save();

    return res.status(200).json({ msg: "Profile picture deleted successfully!", url: user.profile });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return res.status(500).json({ msg: "Server error", error });
  }
};

module.exports = DeletePhoto;
