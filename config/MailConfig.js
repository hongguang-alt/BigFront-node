"use strict";
const nodemailer = require("nodemailer");


// async..await is not allowed in global scope, must use a wrapper
async function main(userInfo) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.qq.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: "2273049646@qq.com", // generated ethereal user
            pass: "nlmnrkmffzbvebhj", // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"认证邮件" <2273049646@qq.com>', // sender address
        to: "2273049646@qq.com", // list of receivers
        subject: "红光论坛注册码", // Subject line
        text: `您在修改密码，您的邀请码为${userInfo.code}`, // plain text body
        html: `<div style="width: 800px;height:280px;border:1px solid gray;border-radius: 10px;margin: auto;">
        <div style="height:50px;color:white;font-size:25px;border-radius: 10px;line-height:50px;text-align:left;background-color: black;padding: 10px;">
            红光社区——欢迎来到红光社区
        </div>
        <div style="background-color: white;padding: 15px;">
            <p>您好，${userInfo.user}同学，重置链接有效时间30分钟，请在${userInfo.expire}之前重置你的密码：</p>
           <a href="http://www.baidu.com"> 
               <button style="height: 40px;width: 150px;color: white;background-color: #009688;">
                立即重置密码
                </button>
            </a>
            <p style="background-color: rgba(0,0,0,.2);">如果该邮件不是你本人操作，请勿进行激活，否则你的邮箱将被他人绑定！</p>
        </div>
        <div style="color:gray;text-align:center;">系统邮件，请勿直接回复</div>
        </div>`, // html body
    });

    return "Message sent: %s", info.messageId
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// main(userInfo).catch(console.error);
module.exports = main