import emailConfig from "../config/emailSending.config";

function sendEmail(email: string, subject: string, message: string) {
  emailConfig.emailOptions.to = email;
  emailConfig.emailOptions.subject = subject;
  emailConfig.emailOptions.text = message;
  emailConfig.transporter.sendMail(
    emailConfig.emailOptions,
    function (error, info) {
      if (error) {
        throw new Error(error.message);
      }
    }
  );
}

export default {
  sendEmail,
};
