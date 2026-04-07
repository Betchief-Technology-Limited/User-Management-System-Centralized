export function inviteUserTemplate({ invitationLink, roleName }) {
    return {
        subject: "You have been invited to join the platform",
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>You have been invited</h2>
        <p>You have been invited to join the platform with the role <strong>${roleName}</strong>.</p>
        <p>Click the button below to set your password and activate your account.</p>

        <a href="${invitationLink}" 
           style="display:inline-block; padding:10px 20px; background:#000; color:#fff; text-decoration:none; border-radius:5px;">
          Accept Invitation
        </a>

        <p>If the button does not work, use this link:</p>
        <p>${invitationLink}</p>

        <p>This invitation link will expire in 48 hours.</p>
      </div>
    `,
    };
}