
module.exports = {
  email: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Usamos STARTTLS, por lo que no es seguro
    auth: {
      user: 'vida.rol.oficial@gmail.com',
      pass: 'gkkz kwwg bong sjge',
    },
    requireTLS: true, // Agregamos esta opción para requerir STARTTLS
  },
};