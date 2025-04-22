import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly logger: Logger) {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      secure: true,
      debug: true,
      logger: true
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    try {
      const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: "Password Reset Request",
        html: `<p>Click <a target="_blank" href="${resetLink}">here</a> to reset your password.</p>`
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      this.logger.error("SMTP Error Details:", error);
      throw new Error("Failed to send email");
    }
  }
}
