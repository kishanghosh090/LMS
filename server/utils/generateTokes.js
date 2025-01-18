import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
    expiresIn: "30d",
  });
  res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development" ? false : true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,// 30 days
    })
    .json({ success: true, message, token });
};
