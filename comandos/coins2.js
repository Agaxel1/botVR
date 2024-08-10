const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const nodemailer = require('nodemailer');
const config = require('./config');

async function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Función para enviar el correo con el comprobante de compra
async function sendMail(recipientEmail, cuerpoCorreo) {
  const transporter = nodemailer.createTransport(config.email);

  const mailOptions = {
    from: config.email.auth.user,
    to: recipientEmail,
    subject: 'Comprobante de compra',
    html: cuerpoCorreo,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado');
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
}

module.exports = {
  name: "darcoinsv",
  aliases: [],

  async execute(client, message, commandArgs) {
    const userID = message.author.id;
    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    if (resultGetUserPermissions.length === 0 || resultGetUserPermissions[0].Admin <= 7) {
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    let comandoEnEjecucion = false;
    if (comandoEnEjecucion) {
      message.channel.send('Por favor, espera a que el comando anterior termine.');
      return;
    }

    const args = message.content.split(' ');
    const Usuario = args[1];
    const coins = args[2];
    const correo = args[3];
    const metodoNumero = args[4];

    // Definir el diccionario de mapeo
    const metodoMapping = {
      1: 'Perú',
      2: 'Ecuador',
      3: 'Colombia',
      4: 'Chile',
      5: 'Argentina',
      6: 'Internacional'
    };

    // Obtener el país correspondiente al número
    const metodo = metodoMapping[metodoNumero];

    if (!Usuario || !coins || isNaN(coins) || !correo || !metodo) {
      message.channel.send('Use el comando como !darcoinsv Nombre_Apelido Coins Correo Pais.\n1.Perú\n2.Ecuador\n3.Colombia\n4.Chile\n5.Argentina\n6.Internacionales');
      return;
    }

    try {
      comandoEnEjecucion = true;
      const getIdQuery = 'SELECT ID, Online FROM PlayaRP WHERE Name = ?';
      const getIdResult = await executeQuery(getIdQuery, [Usuario]);

      if (getIdResult.length === 0) {
        message.channel.send(`El usuario ${Usuario} no existe en la base de datos.`);
        return;
      }

      const usuarioId = getIdResult[0].ID;
      const Online = getIdResult[0].Online;

      if (Online === 1) {
        const mensaje = `El usuario ${Usuario} está en línea. Por favor, sal del servidor para poder proseguir con los coins.`;
        await message.channel.send(mensaje);
      } else {
        const valor = coins / 100 * 3;
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' '); // Fecha actual en formato YYYY-MM-DD HH:MM:SS

        const sql = 'UPDATE PlayaRP SET Crystal = Crystal + ? WHERE Name = ?';
        const result = await executeQuery(sql, [coins, Usuario]);

        if (result.affectedRows > 0) {
          const insertComprobanteQuery = 'INSERT INTO comprobante (Usuario, Valor, Correo, Tipo, Fecha, Metodo) VALUES (?, ?, ?, ?, ?, ?)';
          const insertResult = await executeQuery(insertComprobanteQuery, [Usuario, valor, correo, 'Coins', fecha, metodo]);

          if (insertResult.affectedRows > 0) {
            const mensaje = `Se han dado ${coins} coins a ${Usuario}.`;
            const warnMessage = await message.channel.send(mensaje);
            const embedn = new Discord.MessageEmbed()
              .setColor('#0099ff')
              .setTitle('Recibo de compra / Comprobante de pago')
              .setDescription(`La compra se ha realizado satisfactoriamente, a continuación tienes los detalles.`)
              .addFields(
                { name: 'Número de recibo de pago', value: insertResult.insertId },
                { name: 'Valor', value: `$${valor}` },
                { name: 'Tipo', value: 'Coins' },
                { name: 'Cantidad', value: `${coins}` },
                { name: 'Usuario', value: Usuario },
                { name: 'Correo', value: `${correo}` },
                { name: 'Fecha', value: `${fecha}` },
                { name: 'Metodo', value: metodo }
              )
              .setFooter('Vida Rol - Compras', 'https://i.postimg.cc/pXHF5Mbp/Logo-Oficial-1.png')
              .setThumbnail('https://i.postimg.cc/BZm1Rvf8/Vida-Rol-Large.png')
              .setTimestamp();

            message.channel.send(embedn);

            const usuario = message.author;
            const listaServidores = ['1055804678857826304'];

            listaServidores.forEach(servidorId => {
              const servidor = client.guilds.cache.get(servidorId);
              if (servidor) {
                let canalId = "1244831150766293005"
                
                

                const canalRegistro = servidor.channels.cache.get(canalId);
                if (canalRegistro) {
                  const embed = new MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle(`Compra de coins: ${Usuario} (${usuarioId})`)
                    .setDescription(`El usuario ${usuario.username} (${usuario.id}) dio ${coins} coins a ${Usuario}.`)
                    .addFields(
                      { name: 'Número de recibo de pago', value: insertResult.insertId },
                      { name: 'Valor', value: `$${valor}` },
                      { name: 'Tipo', value: 'Coins' },
                      { name: 'Usuario', value: Usuario }
                    )
                    .setTimestamp();
                  canalRegistro.send(embed);
                } else {
                  console.log(`No se encontró el canal de registro en el servidor ${servidor.name}`);
                }
              } else {
                console.log(`No se encontró el servidor con ID ${servidorId}`);
              }
            });

            message.delete({ timeout: 5000 });
          }
        } else {
          const mensaje = `El usuario ${Usuario} no existe en la base de datos.`;
          message.channel.send(mensaje);
        }
      }
      const getIdfechaQuery = 'SELECT ID, fecha FROM comprobante ORDER BY ID DESC LIMIT 1';
      const getIdfechaResult = await executeQuery(getIdfechaQuery);

      if (getIdfechaResult.length === 0) {
        message.channel.send(`No hay datos.`);
        return;
      }

      const ID = getIdfechaResult[0].ID;
      const fecha = getIdfechaResult[0].fecha;

      // Convertir la cadena de fecha en un objeto Date
      const fechaObjeto = new Date(fecha);

      // Obtener día, mes y año
      const dia = fechaObjeto.getDate();
      const mes = fechaObjeto.getMonth() + 1; // Los meses comienzan desde 0, entonces sumamos 1
      const año = fechaObjeto.getFullYear();

      // Formatear la fecha en formato DD-MM-YYYY
      const fechaFormateada = `${dia < 10 ? '0' : ''}${dia}-${mes < 10 ? '0' : ''}${mes}-${año}`;
      try {

        comandoEnEjecucion = true;
        const cuerpoCorreo = `
        <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comprobante de compra</title>
  <style>
    /* Estilos CSS */
    body {
      font-family: 'Roboto', sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }

    .container {
      width: 90%;
      max-width: 600px;
      margin: 20px auto;
      background-color: #333;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .logo {
      text-align: center;
      margin-bottom: 20px;
    }

    .logo img {
      width: 200px;
    }

    .title {
      font-size: 24px;
      text-align: center;
      margin-bottom: 20px;
      color: #ffffff;
    }

    .info {
      margin-bottom: 20px;
      color: #ffffff;
    }

    .info p {
      margin: 5px 0;
    }

    .button-container {
      text-align: center;
    }

    .button {
      display: inline-block;
      background-color: #00ced1;
      color: #ffffff;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 15px;
      margin: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .footer {
      text-align: center;
      border-top: 1px solid #ffffff;
      color: #ffffff;
      margin-top: 20px;
      padding-top: 10px;
    }

    .small-text {
      font-size: 10px;
      color: #dddddd;
      font-weight: bold;
    }

    .small-text a {
      color: #007bff;
      text-decoration: none;
    }

    .small-text a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://i.postimg.cc/BZm1Rvf8/Vida-Rol-Large.png" alt="Vida Rol">
    </div>
    <div class="title">
      Ha pagado $<span class="valor">${(coins * 0.03).toFixed(2)}</span> en Vida Rol INC
    </div>
    <div class="info">
      <p>Id de transacción (Recibo de pago): ${ID}</p>
      <p>Fecha de la transacción: ${fechaFormateada}</p>
      <p>Comercio: Vida Rol INC</p>
      <p>vida.rol.oficial@gmail.com</p>
    </div>
    <div class="info">
      <p>Datos adicionales:</p>
      <p>Producto: Coins</p>
      <p>Valor: $<span class="valor">${(coins * 0.03).toFixed(2)}</span></p>
      <p>Usuario: ${Usuario}</p>
      <p>Cantidad: ${coins}</p>
    </div>
    <div class="button-container">
      <a class="button" href="https://vida-roleplay.com/" style="color: #ffffff;">Administrar productos</a>
      <a class="button" href="https://discord.gg/vida-rol-929898747155054683" style="color: #ffffff;">Contacto y ayuda</a>
    </div>
    <div class="footer">
      <p class="small-text">Vida Rol tiene el compromiso de prevenir los correos electrónicos fraudulentos. Los correos electrónicos de Vida Rol siempre contienen su nombre completo. <br>No responda a este correo electrónico. Para ponerse en contacto con nosotros, haga clic en <a href="https://discord.gg/vida-rol-929898747155054683">Contacto y ayuda</a>.</p>
      <p class="small-text">Copyright © 2018-2024 Vida Rol. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html> `;
        // Enviamos el correo electrónico con el comprobante de compra
        await sendMail(correo, cuerpoCorreo);

      } catch (error) {
        console.error('Error al dar las coins al usuario: ', error);
      } finally {
        comandoEnEjecucion = false;
      }
      message.reply('Se ha enviado el comprobante de compra por correo electrónico.');
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      message.channel.send('Se produjo un error al enviar el correo electrónico.');
    }
  }
};
