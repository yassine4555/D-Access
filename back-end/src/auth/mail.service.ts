import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host:   process.env.MAIL_HOST   ?? 'smtp.gmail.com',
            port:   Number(process.env.MAIL_PORT ?? 587),
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    async sendPasswordReset(to: string, token: string): Promise<void> {
        const appName = 'D-Access';
        try {
            await this.transporter.sendMail({
                from:    `"${appName}" <${process.env.MAIL_USER}>`,
                to,
                subject: `${appName} — Password Reset Code`,
                text:    `Your password reset code is: ${token}\n\nThis code expires in 15 minutes.\nIf you did not request this, ignore this email.`,
                html:    `
                    <div style="font-family:sans-serif;max-width:480px;margin:auto;">
                        <h2 style="color:#06b6d4;">${appName}</h2>
                        <p>You requested a password reset. Use the code below:</p>
                        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;
                                    background:#f3f4f6;padding:16px 24px;border-radius:8px;
                                    text-align:center;margin:24px 0;">${token}</div>
                        <p style="color:#6b7280;font-size:14px;">
                            This code expires in <strong>15 minutes</strong>.<br>
                            If you did not request this, you can safely ignore this email.
                        </p>
                    </div>
                `,
            });
            this.logger.log(`Reset email sent to ${to}`);
        } catch (err) {
            this.logger.error(`Failed to send reset email to ${to}`, err);
            throw err;
        }
    }
}
