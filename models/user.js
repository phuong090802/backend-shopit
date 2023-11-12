import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [30, 'Your name cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        // validator validate is Email
        validator: [validator.isEmail, 'Please enter valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [6, 'Your password must be longer than 6 characters'],
        // hidden password in result query
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// this.password -> password của đối tượng user

// middleware của mongoose trước khi lưu dữ liệu
// được kích hoạt trước khi lưu dữ liệu
// nếu user mới được lưu hoặc password bị thay đổi -> hash, ngược lại next
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    // 10 số lần lặp thực hiện quá trình hash
    this.password = await bcrypt.hash(this.password, 10);
});

// thêm một phương thức tùy chỉnh vào userSchema

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

userSchema.methods.getResetPasswordToken = function () {
    // chuỗi dài 20 byte, sau đó chuyển thành chuỗi hex
    const resetToken = crypto.randomBytes(20).toString('hex');
    // dùng để làm param url
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    return resetToken;
}

const User = mongoose.model('User', userSchema);
export default User;