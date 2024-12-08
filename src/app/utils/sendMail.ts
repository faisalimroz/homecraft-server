import nodemailer from 'nodemailer';
import config from '../../config'; // Ensure config has SMTP details

export const sendEMail = async (
    fromEmail: string,
    toEmail: string,
    subject: string,
    html: string
) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: config.SMTP_MAIL,
            pass: config.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject: subject,
        html: html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        // console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email'); // Optional: You can rethrow to handle it higher up if needed
    }
};
