const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const generatePassword = require("../../utlis/generatePassword");
const sendMail = require("../../config/Nodemailer");
const emailTemplate = require("../../utlis/emailTemplates");

// get management user
const managementUsers = async (req, res) => {
  const managementUsers = await User.find({ role: "management_admin" });
  res.json({ managementUsers });
}

const managementAddUsers = async (req, res) => {
  const { email, first_name, number, password: suppliedPassword } = req.body;

  try {
    if (await User.findOne({ email }))
      return res.json({ msg: "User Already Exists!" });

    const password = suppliedPassword && suppliedPassword.trim().length > 0
      ? suppliedPassword
      : generatePassword();

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ first_name, email, number, password: hashPassword, role: "management_admin" });
    await newUser.save();

    if (!suppliedPassword || suppliedPassword.trim().length === 0) {
      const html = emailTemplate({
        role: "Management",
        name: first_name,
        email,
        password
      });
      const subject = "Welcome to CPMS | Your Login Credentials as a Management";
      await sendMail(email, subject, html);
    }

    return res.json({ msg: "User Created!" });
  } catch (error) {
    console.log("admin.user-management => ", error);
    return res.json({ msg: "Internal Server Error!" });
  }
}

const managementDeleteUsers = async (req, res) => {
  // const user = await Users.find({email: req.body.email});
  const ress = await User.deleteOne({ email: req.body.email });
  if (ress.acknowledged) {
    return res.json({ msg: "User Deleted Successfully!" });
  } else {
    return res.json({ msg: "Error While Deleting User!" });
  }
}


module.exports = {
  managementUsers,
  managementAddUsers,
  managementDeleteUsers
};