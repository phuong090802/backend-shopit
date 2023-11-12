import User from '../models/user.js';
import ErrorHandler from '../utils/errorHandler.js';
import catchAsyncError from '../middlewares/catchAsyncError.js';
import sendToken from '../utils/jwtToken.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

export const registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;


    const result = await cloudinary.uploader
        .upload(req.body.avatar, { folder: "avatars", width: 150, crop: "crop" });

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: result.public_id,
            url: result.secure_url
        }
    });


    sendToken(user, 200, res)
});

export const loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email & password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401));
    }

    sendToken(user, 200, res)
});

export const getUserProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        user
    })
});

export const updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
        return next(new ErrorHandler('Old password is incorrect'));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    if (req.body.avatar !== '') {
        const user = await User.findById(req.user.id);
        const image_id = user.avatar.public_id;
        await cloudinary.uploader.destroy(image_id);

        const result = await cloudinary.uploader
        .upload(req.body.avatar, { folder: "avatars", width: 150, crop: "crop" });
        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    // new: true: trả về user được cập nhật, mặc định là false trước khi cập nhật
    // runValidators: true: validation trước khi cập nhật dữ liệu
    // useFindAndModify: false: ngăn việc sử dụng findOneAndUpdate() thay vì findByIdAndUpdate() 
    // findOneAndUpdate() có thể đã bị loại bỏ khỏi phiên bản mới của Mongoose, 
    // vì vậy tùy chọn này đảm bảo rằng Mongoose sử dụng findByIdAndUpdate() thay vì findOneAndUpdate().
    await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.json({
        success: true
    })
})

export const resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
        return next(new ErrorHandler('Password reset token is invalid or has been expired', 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match', 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);

});

export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404));
    }
    const resetToken = user.getResetPasswordToken();
    // validateBeforeSave: false: tắt validation trước khi lưu
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, them ignore it.`;
    try {
        await sendEmail({
            email: user.email,
            subject: 'ShopIT Password Recovery',
            message
        });
        res.json({
            success: true,
            message: `Email send to: ${user.email}`
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(err.message, 500));
    }
});

export const logout = catchAsyncError(async (req, res, next) => {
    // const options = {
    //     httpOnly: true,
    //     path: '/api',
    //     sameSite: 'None',
    //     secure: true
    // }
    // res.clearCookie('token', options);
    // res.json({
    //     success: true,
    //     message: 'Logged out'
    // })
    const options = {
       
        expires: new Date(1),
        httpOnly: true,
        path: '/api',
        sameSite: 'None',
        secure: true, // Thêm secure nếu sử dụng HTTPS,

    }

    res.cookie('token', '', options).json({
        success: true,
        message: 'Logged out'
    });
});

export const allUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();
    res.json({
        success: true,
        users
    })
})

export const getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`));
    }
    res.status(200).json({
        success: true,
        user
    })
});

export const updateUser = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.json({
        success: true
    })
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`));
    }

    await user.deleteOne();

    res.status(200).json({
        success: true
    })
});