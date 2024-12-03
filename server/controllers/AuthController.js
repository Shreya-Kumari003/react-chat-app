import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync } from "fs";
import { imageUploadUtils, removeImage } from "../helpers/cloudinary.js";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (request, response, next) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response
        .status(400)
        .json({ error: "Email and Password are required." });
    }

    // Create the user
    const user = await User.create({ email, password });

    // Set the JWT token in a cookie
    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    return response.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error for email
      return response
        .status(409)
        .json({ error: "User with this email already exists." });
    }

    console.error({ error });
    return response.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and Password is required.");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(404).send("User with the given email not found");
    }
    const auth = await compare(password, user.password);
    if (!auth) {
      return response.status(400).send("Password is incorrect");
    }
    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return response.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (request, response, next) => {
  try {
    const userData = await User.findById(request.userId);

    if (!userData) {
      return response.status(404).send("User with the given id not found");
    }

    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const updateProfile = async (request, response, next) => {
  try {
    const { userId } = request;
    const { firstName, lastName, color } = request.body;

    if (!firstName || !lastName) {
      return response
        .status(400)
        .send("First name, last name and color is requird.");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );

    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const addProfileImage = async (request, response, next) => {
  try {
    if (!request.file) {
      return response
        .status(400)
        .json({ success: false, message: "File is required." });
    }

    // Upload image to Cloudinary

    const b64 = Buffer.from(request.file.buffer).toString("base64");
    const url = "data:" + request.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtils(url);

    // Update user profile with Cloudinary image URL
    const updatedUser = await User.findByIdAndUpdate(
      request.userId, // Assuming userId is in the request object
      { image: result.secure_url }, // Store the Cloudinary URL in the 'image' field
      { new: true, runValidators: true }
    );

    return response.status(200).json({
      success: true,
      message: "Profile image uploaded successfully!",
      image: updatedUser.image, // Return the new image URL
    });
  } catch (error) {
    console.error("Error in addProfileImage:", error);
    return response.status(500).json({
      success: false,
      message: "Error occurred in image upload!",
    });
  }
};

export const removeProfileImage = async (request, response, next) => {
  try {
    const { userId } = request;
    const user = await User.findById(userId);

    if (!user) {
      return response.status(404).send("User not found.");
    }

    // If there's an image URL, remove it from Cloudinary
    if (user.image) {
      await removeImage(user.image); // Call removeImage to delete from Cloudinary
    }

    user.image = null;
    await user.save();

    return response.status(200).send("Profile image removed successfully.");
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};

export const logout = async (request, response, next) => {
  try {
    response.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    return response.status(200).send("Logout successfull.");
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};
