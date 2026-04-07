import { Resend } from "resend";
import { env } from "../../config/env.js";
import verifyEmailTemplate from "./emailTemplates/verifyEmail.template.js";
import { inviteUserTemplate } from "./emailTemplates/inviteUser.template.js";

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
    token,
    roleName
}) {
    const invitationLink = `${env.FRONTEND_URL}/accept-invitation?token=${token}`

    const template = inviteUserTemplate({
        invitationLink,
        roleName
    });

    await resend.emails.send({
        from: env.EMAIL_FROM,
        to,
        subject: template.subject,
        html: template.html
    })
}