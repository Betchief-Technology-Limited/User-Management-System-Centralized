export default function verifyEmailTemplate({ firstName, verificationLink }) {
    return {
        subject: "Verify your email address",
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verify your email</h2>
        <p>Hello ${firstName},</p>
        <p>Please verify your email by clicking the button below:</p>

        <a href="${verificationLink}" 
           style="display:inline-block; padding:10px 20px; background:#000; color:#fff; text-decoration:none; border-radius:5px;">
          Verify Email
        </a>

        <p>If the button does not work, use this link:</p>
        <p>${verificationLink}</p>

        <p>This link will expire in 1 hour.</p>
      </div>
    `,
    }
}