import nodemailer from "nodemailer";

const emailOptions = {
  from: "librarybookweb@gmail.com",
  to: "",
  subject: "",
  text: "",
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "arcodiet@gmail.com",
    pass: "kvjmwrlzzpxmcfqp",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default {
  emailOptions,
  transporter,
};
