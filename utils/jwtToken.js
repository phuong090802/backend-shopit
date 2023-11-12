const sendToken = (user, statusCode, res) => {
    // const token = user.getJwtToken();
    const options = {
        // Date.now() trả về kiểu Number từ 1/1/1970
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'None',
        secure: true, // Thêm secure nếu sử dụng HTTPS,
    }

    res.status(statusCode).cookie('token', null, options).json({
        success: true,
        user
    });

}

export default sendToken;