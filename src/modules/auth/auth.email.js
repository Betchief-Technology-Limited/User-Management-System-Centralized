import { Resend } from "resend";
import { env } from "../../config/env.js";
import verifyEmailTemplate from "./emailTemplates/verifyEmail.template.js";
import { inviteUserTemplate } from "./emailTemplates/inviteUser.template.js";
import passwordResetTemplate from "./emailTemplates/passwordReset.template.js";

const resend = new Resend(env.RESEND_API_KEY);

async function sendVerificationEmail({
    to,
    firstName,
    token
}) {
    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`

    const template = verifyEmailTemplate({
        firstName,
        verificationLink
    })

    await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject: template.subject,
        html: template.html
    })
}

export default sendVerificationEmail;


export async function sendInvitationEmail({
    to,
    firstName,
    token,
    roleName,
    temporaryPassword
}) {
    const invitationLink = `${env.FRONTEND_URL}/accept-invitation?token=${token}`

    const template = inviteUserTemplate({
        firstName,
        invitationLink,
        roleName,
        temporaryPassword
    });

    await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject: template.subject,
        html: template.html
    })
}

export async function sendPasswordResetEmail({
    to,
    firstName,
    token
}) {
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const template = passwordResetTemplate({
        firstName,
        resetLink
    });

    await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject: template.subject,
        html: template.html
    });
}
