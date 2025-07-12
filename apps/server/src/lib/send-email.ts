import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  const { data, error } = await resend.emails.send({
    from: "hello@llmonitor.io",
    to,
    subject,
    html,
  });

  if (error) {
    console.log(`Error sending email to ${to}:`, error);
    return;
  }

  return data;
};
