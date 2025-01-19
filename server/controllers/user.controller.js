import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import { User } from "../models/user.model.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { generateToken } from "../utils/generateTokes.js";

export const createUserAccount = catchAsync(async (req, res, next) => {
  const { name, email, password, role = "student" } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    throw new ApiError("User already exists", 400);
  }

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
  });
  await user.updateLastActive();
  generateToken(res, newUser, "User account created successfully");

  res
    .status(201)
    .json({ message: "User account created successfully", user: newUser });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError("Invalid credentials", 401);
  }
  await user.updateLastActive();
  generateToken(res, user, "Login successful");
});

export const logout = catchAsync(async (req, res, next) => {
  res.cookie("token", null, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
    sameSite: "strict",
    maxAge: 0,
  });
  res.status(200).json({ message: "Logout successful" });
});

export const getCurrentUserProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.id).populate({
    path: "enrolledCourses.course",
    select: "title thumbnail description",
  });
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  res.status(200).json({
    success: true,
    data: {
      ...user.toJSON(),
      totalEnrolledCourses: user.totalEnrolledCourses,
    },
  });
});

export const updateUserProfile = catchAsync(async (req, res, next) => {
  const { name, email, bio } = req.body;
  const updateData = {
    name,
    email: email?.toLowerCase(),
    bio,
  };

  if (req.file) {
    const avatarResult = await uploadMedia(req.file.path);
    updateData.avatar = avatarResult.secure_url;
    updateData.avatarPublicId = avatarResult.public_id;

    //delete old avatar
    const user = await User.findById(req.id);
    if (user.avatar && user.avatar !== "default-avatar.jpg") {
      await deleteMediaFromCloudinary(user.avatar);
    }
  }

  // update User and get Updated User
  const updatedUser = await User.findByIdAndUpdate(req.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedUser) {
    throw new ApiError("User not found", 404);
  }
  await updatedUser.updateLastActive();

  res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    data: updatedUser,
  });
});
