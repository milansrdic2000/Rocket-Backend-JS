const http = require("http");
const express = require("express");

const hostname = "127.0.0.1";
const port = 3000;

const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
app.use(bodyParser.json());
app.use(cors());

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.rockettt.rs", // e.g., 'mail.rocket.rs'
  port: 465, // typically 465 for secure connections
  secure: true, // use TLS
  auth: {
    user: "info@rockettt.rs", // your email
    pass: "kFe9.7Dws", // your email password
  },
});

app.post("/api/contact", (req, res) => {
  const { firstName, lastName, phone, email, message, lang } = req.body;

  const mailOptions = {
    from: "admin@rocket.rs", // sender address
    to: "milansrdic2000@gmail.com, office@orbital.rs, info@rockettt.rs", // list of receivers
    subject: "Thanks for contacting", // Subject line
    html: `
    <h1>Contact Form Submission</h1>
    <p><strong>First Name:</strong> ${firstName}</p>
    <p><strong>Last Name:</strong> ${lastName}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `, // HTML body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ data: error });
    }
    console.log("Message sent: %s", info.messageId);
    res.status(200).json({
      success: true,
      data: {
        message:
          lang?.shortcode === "en"
            ? "Email sent successfully"
            : "Email uspešno poslat",
      },
    });
  });
  // res.status(500).json({
  //   success: false,
  //   data: {
  //     message:
  //       lang?.shortcode === "en"
  //         ? "Server error, please try again later."
  //         : "Greška na serveru, molimo pokušajte kasnije.",
  //   },
  // });
  // res.status(200).json({
  //   success: true,
  //   data: {
  //     message:
  //       lang?.shortcode === "en"
  //         ? "Email sent successfully"
  //         : "Email uspešno poslat",
  //   },
  // });
});
app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});
app.get("/api/", (req, res) => {
  res.status(200).send("Hello World");
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
