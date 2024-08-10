
module.exports = {
  email: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Usamos STARTTLS, por lo que no es seguro
    auth: {
      user: 'agaxelytinfo@gmail.com',
      pass: 'txgq bmns vgrm hkcv',
    },
    requireTLS: true, // Agregamos esta opción para requerir STARTTLS
  },
};