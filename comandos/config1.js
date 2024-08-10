
module.exports = {
  email: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Usamos STARTTLS, por lo que no es seguro
    auth: {
      user: 'juanjoserinconrojas@gmail.com',
      pass: 'wtex vnxr ttnv kpvi',
    },
    requireTLS: true, // Agregamos esta opción para requerir STARTTLS
  },
};