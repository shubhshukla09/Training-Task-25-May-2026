export const email = {
  /**
   * Send a beautiful HTML verification email
   */
  async sendVerificationEmail(to: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${token}`;
    const subject = "🚀 Verify your AI Blogging Platform account";
    
    const htmlBody = `
      <div style="background-color:#09090b; padding:40px; font-family:sans-serif; color:#f4f4f5; text-align:center; border-radius:12px;">
        <h1 style="color:#06b6d4; margin-bottom:20px;">Welcome to the Future of Blogging</h1>
        <p style="font-size:16px; margin-bottom:30px; line-height:1.6;">Click the button below to verify your email address and activate your cinematic blogging dashboard.</p>
        <a href="${verificationUrl}" style="background:linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%); color:#ffffff; padding:12px 28px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block; box-shadow:0 4px 15px rgba(6,182,212,0.3);">Verify Email Address</a>
        <p style="margin-top:40px; font-size:12px; color:#a1a1aa;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    return this._sendEmailMock(to, subject, htmlBody);
  },

  /**
   * Send a beautiful HTML password reset email
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    const subject = "🔒 Reset your Account Password";

    const htmlBody = `
      <div style="background-color:#09090b; padding:40px; font-family:sans-serif; color:#f4f4f5; text-align:center; border-radius:12px;">
        <h1 style="color:#8b5cf6; margin-bottom:20px;">Password Reset Request</h1>
        <p style="font-size:16px; margin-bottom:30px; line-height:1.6;">We received a request to reset your password. Click the button below to configure a new password.</p>
        <a href="${resetUrl}" style="background:linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); color:#ffffff; padding:12px 28px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block; box-shadow:0 4px 15px rgba(139,92,246,0.3);">Reset Password</a>
        <p style="margin-top:40px; font-size:12px; color:#a1a1aa;">This password link is valid for 1 hour. If you did not request this, no further action is required.</p>
      </div>
    `;

    return this._sendEmailMock(to, subject, htmlBody);
  },

  /**
   * Send newsletter updates to subscribers
   */
  async sendNewsletterEmail(to: string, subject: string, content: string): Promise<boolean> {
    const htmlBody = `
      <div style="background-color:#09090b; padding:40px; font-family:sans-serif; color:#f4f4f5; border-radius:12px;">
        <div style="text-align:center; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:20px; margin-bottom:30px;">
          <h2 style="color:#06b6d4; margin:0;">AI Blogging Platform</h2>
          <span style="font-size:12px; color:#a1a1aa;">WEEKLY BRIEFING</span>
        </div>
        <div style="font-size:16px; line-height:1.8; color:#e4e4e7;">
          ${content}
        </div>
        <div style="text-align:center; border-top:1px solid rgba(255,255,255,0.08); padding-top:30px; margin-top:40px; font-size:12px; color:#a1a1aa;">
          <p>You received this email because you are subscribed to our newsletter.</p>
          <a href="#" style="color:#06b6d4; text-decoration:none;">Unsubscribe</a>
        </div>
      </div>
    `;

    return this._sendEmailMock(to, subject, htmlBody);
  },

  /**
   * Send notification for contact submissions
   */
  async sendContactFormNotification(name: string, senderEmail: string, message: string): Promise<boolean> {
    const to = process.env.EMAIL_FROM || "admin@example.com";
    const subject = `✉️ New Contact Message from ${name}`;

    const htmlBody = `
      <div style="background-color:#09090b; padding:30px; font-family:sans-serif; color:#f4f4f5; border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
        <h2 style="color:#10b981; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:15px; margin-bottom:20px;">Contact Form Submission</h2>
        <p style="margin-bottom:10px;"><strong>Name:</strong> ${name}</p>
        <p style="margin-bottom:10px;"><strong>Email:</strong> ${senderEmail}</p>
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:15px; border-radius:6px; margin-top:20px; line-height:1.6; color:#e4e4e7;">
          ${message}
        </div>
      </div>
    `;

    return this._sendEmailMock(to, subject, htmlBody);
  },

  /**
   * Internal mock mailer to print to console with complete formatting
   */
  async _sendEmailMock(to: string, subject: string, htmlContent: string): Promise<boolean> {
    const border = "=".repeat(60);
    console.log(`
${border}
✉️  OUTBOUND TRANSACTIONAL EMAIL TRIGGERED
${border}
TO      : ${to}
SUBJECT : ${subject}
FROM    : ${process.env.EMAIL_FROM || "noreply@aiblog.platform"}
STATUS  : DELIVERED (MOCK DISPATCH LOGGER SUCCESS)
${border}
CONTENT PREVIEW (HTML RENDERED SYSTEM LOGS):
${htmlContent.replace(/<[^>]*>/g, "").split("\n").map(line => line.trim()).filter(Boolean).slice(0, 10).join("\n")}
... [HTML BODY EMBEDDED IN SYSTEM DISPATCH] ...
${border}
    `);
    
    // Always resolve to true to ensure backend authentication/reset chains don't break during offline dev
    return true;
  }
};
