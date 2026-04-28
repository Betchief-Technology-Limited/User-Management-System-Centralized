export default function passwordResetTemplate({ firstName, resetLink }) {
    return {
        subject: "Reset your password",
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Reset your password</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to continue:</p>

        <a href="${resetLink}" 
           style="display:inline-block; padding:10px 20px; background:#000; color:#fff; text-decoration:none; border-radius:5px;">
          Reset Password
        </a>

        <p>If the button does not work, use this link:</p>
        <p>${resetLink}</p>

        <p>This link will expire in 1 hour.</p>
      </div>
    `,
    };
}
