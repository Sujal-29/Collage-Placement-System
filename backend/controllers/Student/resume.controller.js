const User = require("../../models/user.model.js");
const cloudinary = require("../../config/Cloudinary.js");
const path = require("path");

const UploadResume = async (req, res) => {
  try {
    console.log('resume upload payload', req.file);
    console.log('resume upload body', req.body);
    if (!req.file) {
      return res.status(400).json({ msg: "No resume uploaded" });
    }
    if (!req.file.path) {
      console.error('uploaded file has no path:', req.file);
      return res.status(500).json({ msg: 'Server error: file path missing' });
    }

    // Check for PDF MIME type
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ msg: "Only PDF files are allowed" });
    }

    if (!req.body.userId) {
      console.error('resume upload missing userId in body', req.body);
      return res.status(400).json({ msg: "userId required" });
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ msg: "Student not found!" });
    }

    // Delete old resume from Cloudinary if it exists
    if (user.studentProfile.resume) {
      const oldResumeUrl = user.studentProfile.resume;
      const oldResumeFileName = oldResumeUrl.substring(oldResumeUrl.lastIndexOf("/") + 1).split(".")[0];
      const oldResumePublicId = `CPMS/Resume/${oldResumeFileName}`;

      await cloudinary.uploader.destroy(oldResumePublicId, { resource_type: "raw" });
    }

    // Generate a unique filename based on original name + timestamp + userId
    const originalName = path.parse(req.file.originalname).name;
    const uniqueFilename = `${originalName}_${Date.now()}_${req.body.userId}`;

    // Upload the new resume as raw file
    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: "CPMS/Resume",
      public_id: uniqueFilename,
      resource_type: "raw",
    });

    // Update resume path in MongoDB
    user.studentProfile.resume = cloudinaryResponse.secure_url;
    await user.save();

    return res.status(200).json({ msg: "Resume uploaded successfully!", url: cloudinaryResponse.secure_url });
  } catch (error) {
    console.error('resume upload error:', error);
    if (error.stack) console.error(error.stack);
    return res.status(500).json({ msg: "Server error", error: error.message || String(error) });
  }
};

const DeleteResume = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ msg: "userId required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "Student not found!" });

    if (!user.studentProfile.resume) {
      return res.status(400).json({ msg: "No resume available to delete." });
    }

    const oldResumeUrl = user.studentProfile.resume;
    const oldResumeFileName = oldResumeUrl.substring(oldResumeUrl.lastIndexOf("/") + 1).split(".")[0];
    const oldResumePublicId = `CPMS/Resume/${oldResumeFileName}`;
    await cloudinary.uploader.destroy(oldResumePublicId, { resource_type: "raw" });

    user.studentProfile.resume = undefined;
    await user.save();

    return res.status(200).json({ msg: "Resume deleted successfully." });
  } catch (error) {
    console.error('resume delete error:', error);
    return res.status(500).json({ msg: "Server error", error: error.message || String(error) });
  }
};

module.exports = { UploadResume, DeleteResume };
