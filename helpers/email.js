import nodemailer from 'nodemailer'

export const registerEmail = async data => {
  const { email, name, token } = data

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PWD,
    },
  })
  //E-mail Information
  const info = await transport.sendMail({
    from: '"UpTask - Project Administrator" <cuentas@uptask.com>',
    to: email,
    subject: 'Uptask - Confirm your Account',
    text: 'Confirm your Account on UpTask',
    html: `<p>Hola: ${name} Confirm your account on UpTask</p>
    <p>Your Account is almost ready, just need to confirm on the following link:
    <a href="${process.env.FRONTEND_URL}/confirm/${token}">Confirm Account</a>
    </p>
    <p>If you didn't create this account, you could ignore this message</p>
    `,
  })
  //   transport.
}

export const resetPasswordEmail = async data => {
  const { email, name, token } = data

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PWD,
    },
  })
  //E-mail Information
  const info = await transport.sendMail({
    from: '"UpTask - Project Administrator" <cuentas@uptask.com>',
    to: email,
    subject: 'Uptask - Reset Password Link',
    text: "Reset your Account's Password on UpTask",
    html: `<p>Hi: ${name} Reset your Account's Password on UpTask</p>
    <p>Please use the following link to reset your password, just need to click on the following link:
    <a href="${process.env.FRONTEND_URL}/reset-password/${token}">Reset Password</a>
    </p>
    <p>If you didn't request this action, you could ignore this message</p>
    `,
  })
  //   transport.
}
