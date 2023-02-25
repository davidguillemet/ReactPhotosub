const reCaptcha = require("../middlewares/reCaptcha");
const nodemailer = require("nodemailer");

const headOpenRegexp = new RegExp("<h[0-9]>|<p>", "g");
const headCloseRegexp = new RegExp("</h[0-9]>|</p>|<br>", "g");

function htmlMessageContent(props) {
    // Replace text line breaks by html line breaks
    const messageWithHtmlLineBreaks = props.message.replace(/\r\n|\r|\n/g, "<br>");
    return `
        <h3>Objet du message:</h3>
        <p>${props.subject}</p>
        <h3>Contenu du message:</h3>
        <p>${messageWithHtmlLineBreaks}</p>
    `;
}

function htmlContentForMainMessage(props) {
    return `
        <h3>Message de:</h3>
        <p>Nom: ${props.name}</p>
        <p>eMail: ${props.email}</p>
        ${htmlMessageContent(props)}
    `;
}

function htmlContentForCopyMessage(props) {
    return `
        <p>
        Bonjour,<br>
        Vous recevez ce mail suite au message que vous avez envoyé à partir du formulaire de contact du site
        www.davidphotosub.com et pour lequel vous avez demandé une copie.<br>
        Une réponse vous sera apportée dès que possible.<br>
        Merci.
        </p>
        ${htmlMessageContent(props)}
    `;
}

function fromHtmlToText(html) {
    return html
        .replace(headOpenRegexp, "") // Remove open tags <h3>, <p>
        .replace(headCloseRegexp, "\r\n"); // Replace </h3>, </p> and <br> by line breaks
}

module.exports = function(config) {
    config.app.route("/message")
        // Get a new message
        .post(
            reCaptcha, // Validate reCaptcha token
            async function(req, res, next) {
                // {
                //     name: <string>,      -> name of the use
                //     email: <string>      -> email of the user
                //     subject: <string>,   -> subject of the message
                //     message: <string>,   -> message boy as text
                //     sendcopy: <string>   -> true if a copy shall be sent to the user email
                //     token: <string>      -> RECAPTCHA token
                // };
                const transporter = nodemailer.createTransport({
                    port: parseInt(process.env.MAIL_SMTP_PORT), // 465,
                    host: process.env.MAIL_SMTP_HOST, // "smtp.gmail.com",
                    auth: {
                        user: process.env.MAIL_AUTH_USER, // "david.photosub",
                        pass: process.env.MAIL_AUTH_PASS,
                    },
                    secure: true,
                });

                const promises = [];

                // Prepare the mail to send to me
                const messageHtml = htmlContentForMainMessage(req.body);
                const messageText = fromHtmlToText(messageHtml);
                const mailData = {
                    from: process.env.MAIL_FROM, // "david.photosub@gmail.com",
                    to: process.env.MAIL_TO, // "david.guillemet@hotmail.com",
                    subject: `[davidphotosub.com] ${req.body.subject}`,
                    text: messageText,
                    html: messageHtml,
                };
                promises.push(transporter.sendMail(mailData));

                // If needed, prepare the copy to send to the user
                if (req.body.sendcopy) {
                    const messageCopyHtml = htmlContentForCopyMessage(req.body);
                    const messageCopyText = fromHtmlToText(messageCopyHtml);
                    const mailCopyData = {
                        from: process.env.MAIL_FROM, // "david.photosub@gmail.com",
                        to: req.body.email,
                        subject: `[davidphotosub.com] ${req.body.subject}`,
                        text: messageCopyText,
                        html: messageCopyHtml,
                    };
                    promises.push(transporter.sendMail(mailCopyData));
                }

                res.locals.errorMessage = "L'envoi du message a échoué.";
                return Promise.all(promises)
                    .then((_) => {
                        res.status(200).end();
                    }).catch(next);
            });
};
