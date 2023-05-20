const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, message) {
    this.to = user.email;
    this.from = `Ramkumar Gurav <${process.env.EMAIL_FROM}>`;
    this.message = message;
  }

  newTransport() {
    // //--------------------------------------------------------
    // return nodemailer.createTransport({
    //   host: process.env.MAILTRAP_EMAIL_HOST,
    //   port: process.env.MAILTRAP_EMAIL_PORT,
    //   auth: {
    //     user: process.env.MAILTRAP_EMAIL_USERNAME,
    //     pass: process.env.MAILTRAP_EMAIL_PASSWORD,
    //   },
    // });
    // //--------------------------------------------------------

    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async send(subject) {
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject: subject,
      text: this.message,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(`Welcome to the MyExams Family!`);
  }

  async sendResetPasswordUrl() {
    await this.send(`MyExams Password Recovery`);
  }
};
