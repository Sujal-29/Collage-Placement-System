const StudentUser = require("../../models/user.model");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const Login = async (req, res) => {
  const { email, password } = req.body;
  console.log("[LOGIN] Attempted login for email:", email);

  try {
    const user = await StudentUser.findOne({ email });
    console.log("[LOGIN] User found:", user);
    if (!user) {
      console.log("[LOGIN] No user found with email:", email);
      return res.status(400).json({ msg: "User Doesn't Exist!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] Password match:", isMatch);
    console.log("[LOGIN] User role:", user.role);

    if (!isMatch || user.role !== "superuser") {
      console.log("[LOGIN] Credentials not matched. isMatch:", isMatch, ", role:", user.role);
      return res.status(400).json({ msg: 'Credentials Not Matched!' });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    user.token = token;
    await user.save();

    console.log("[LOGIN] Login successful for:", email);
    return res.json({ token });
  } catch (error) {
    console.log("admin.login.js => ", error);
    return res.status(500).json({ msg: "Internal Server Error!" });
  }
}

module.exports = Login;