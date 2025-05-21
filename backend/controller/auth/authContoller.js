import { compairPassword, hashPassword } from "../../helpers/authHelper.js";
import userModel from "../../models/userModel.js";
import Jwt from "jsonwebtoken";
import {
  ErrorResponse,
  successResponse,
  notFoundResponse,
  successResponseWithData
} from "../../helpers/apiResponse.js";
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return ErrorResponse(res, "User already Exist");
    }

    const hashedPassword = await hashPassword(password);

     await new userModel({
      name,
      email,
      password: hashedPassword,
    }).save();
    return successResponse(res, "User created successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Error while Registering",
      err,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return notFoundResponse(res, "Email or Password wrong");
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      return notFoundResponse(res, "Email  not found");
     
    }

    const match = await compairPassword(password, user.password);

    if (!match) {
      return ErrorResponse(res, " Password wrong");
     
    }
    const additionalData = {
      email: user.email,
      name: user.name,
      password: user.password,
      createdAt: user.createdAt,
    };
    const jwtPayload = { _id: user._id, ...additionalData };

    const token = await Jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return successResponseWithData(res, "Login successfully",{
      user: {
          id: user._id,
          name: user.name,
          lname: user.lname,
          email: user.email,
          phone: user.phone,
      }, token
  });
    
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error while login.....",
    });
  }
};

export const getAllUsersExceptLoggedIn = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await userModel.find({ _id: { $ne: loggedInUserId } });

    return successResponseWithData(res, "Users fetched successfully", users);
  } catch (error) {
    console.error("Error occurred while fetching users:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching users",
    });
  }
};
export const getUserbyId = async (req, res) => {
  try {
    const {id} = req.body;
    const users = await userModel.find({ _id:  id });

    return successResponseWithData(res, "Users fetched successfully", users);
  } catch (error) {
    console.error("Error occurred while fetching users:", error);
    res.status(500).send({
      success: false,
      message: "Error while fetching users",
    });
  }
};