import nodemailer from "nodemailer";

const emailRegistro = async (datos) => {
  var transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const {email, nombre, token} = datos
  const info = await transport.sendMail({
    from: "APV- Administrado de Pacientes de Veterinario",
    to: email,
    subject: "Comprueba tu cuenta en APV",
    text: 'Cumprueba tu cuenta en APV',
    html: `<p>Hola, ${nombre}! </p>
            <p>Tu cuenta ya esta lista, solo debes de comprobarla en el siguiente enlace:
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a> </p>
            
            <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>`
  })
  console.log("Mensaje enviado: %s", info.messageId)
};
export default emailRegistro;
