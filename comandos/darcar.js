const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const nodemailer = require('nodemailer');
const config = require('./config');
const mysql = require('mysql');

// Función para ejecutar consultas a la base de datos
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

// Función para enviar correos electrónicos
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

// Función para generar un nuevo número de coche
async function generateNewCarNumber() {
  try {
    const getMaxCarNumberSql = 'SELECT MAX(Number) AS maxNumber FROM Car';
    const maxCarNumberResult = await executeQuery(getMaxCarNumberSql);

    let newNumber = 1;
    if (maxCarNumberResult.length > 0 && maxCarNumberResult[0].maxNumber !== null) {
      newNumber = maxCarNumberResult[0].maxNumber + 1;
    }

    return newNumber;
  } catch (error) {
    console.error('Error al generar un nuevo número de coche:', error);
    throw new Error('Hubo un error al generar un nuevo número de coche.');
  }
}

// Función para verificar si una matrícula ya existe
async function checkMatricula(matricula) {
  try {
    const sqlCheckMatricula = 'SELECT Matricula FROM Car WHERE Matricula = ?';
    const resultCheckMatricula = await executeQuery(sqlCheckMatricula, [matricula]);

    return resultCheckMatricula.length > 0; // Devuelve true si la matrícula existe
  } catch (error) {
    console.error('Error al verificar la matrícula:', error);
    return false;
  }
}

// Función para generar una nueva matrícula
async function generateNewMatricula() {
  let newMatricula;
  do {
    newMatricula = Math.random().toString(36).substring(2, 8).toUpperCase(); // Genera una nueva matrícula aleatoria
  } while (await checkMatricula(newMatricula)); // Verifica si la nueva matrícula ya existe

  return newMatricula;
}

// Función para agregar un coche al usuario y realizar las operaciones adicionales
async function addCar(name_s, coche, matricula, precio, message, correo) {
  try {
    // Obtener el ID del usuario desde la tabla PlayaRP
    const getUserIdSql = 'SELECT ID FROM PlayaRP WHERE Name = ?';
    const userIdResult = await executeQuery(getUserIdSql, [name_s]);

    if (userIdResult.length === 0) {
      message.channel.send('El usuario no existe en la base de datos.');
      return;
    }

    const userId = userIdResult[0].ID;

    // Verificar si la matrícula ya existe
    let matriculaFinal = matricula;
    if (await checkMatricula(matricula)) {
      matriculaFinal = await generateNewMatricula();
      message.channel.send(`La matrícula ${matricula} ya existe. Se usará ${matriculaFinal} en su lugar.`);
    }

    // Generar un nuevo número para el coche
    const newNumber = await generateNewCarNumber();

    // Insertar el nuevo coche en la tabla Car
    const insertCarSql = `
        INSERT INTO Car VALUES (?, ?, ?, ?, '26645', '1961.27', '-1642.87', '13.0896', '0.337813', '0', '0', '0', '0', '1', '1', '1', '0', '0', '0', '93', '0', '0', '2992', '999', '100', '100', '100', '100', '100', '100', '1', '0', '1', '0', '1000.000000|0|0|0|0', '0', '100', '0', '0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0', '0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0', '0', '0', '0', '0', '0', ?)`;

    await executeQuery(insertCarSql, [newNumber, userId, coche, precio, matriculaFinal]);

    // Calcular el valor de la transacción
    const valor = (precio / 100000) * 3;

    // Insertar un nuevo comprobante en la tabla de comprobantes
    const insertComprobanteSql = 'INSERT INTO comprobante (Usuario, Valor, Correo, Tipo, Fecha) VALUES (?, ?, ?, ?, NOW())';
    const insertComprobanteResult = await executeQuery(insertComprobanteSql, [name_s, valor, correo, 'Vehículos']);

    if (insertComprobanteResult.affectedRows > 0) {
      // Crear un embed con la información de la transacción
      const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Recibo de compra / Comprobante de pago')
        .setDescription('La compra se ha realizado satisfactoriamente. A continuación, tienes los detalles.')
        .addFields(
          { name: 'Número de recibo de pago', value: insertComprobanteResult.insertId },
          { name: 'Valor', value: `$${valor}` },
          { name: 'Tipo', value: 'Vehículos' },
          { name: 'Modelo', value: coche },
          { name: 'Matrícula', value: matriculaFinal },
          { name: 'Precio', value: `${precio}` },
          { name: 'Usuario', value: name_s },
          { name: 'Correo', value: correo },
          { name: 'Fecha', value: new Date().toLocaleString() },
        )
        .setFooter('Vida Rol - Compras', 'https://i.postimg.cc/pXHF5Mbp/Logo-Oficial-1.png')
        .setThumbnail('https://i.postimg.cc/BZm1Rvf8/Vida-Rol-Large.png')
        .setTimestamp();

      message.channel.send(embed);
      const canalRegistro = servidor.channels.cache.get('1244831150766293005');
      canalRegistro.send(embed);
      const usuario = message.author;
      const getIdfechaQuery = 'SELECT ID, fecha FROM comprobante ORDER BY ID DESC LIMIT 1';
      const getIdfechaResult = await executeQuery(getIdfechaQuery);

      if (getIdfechaResult.length === 0) {
        message.channel.send(`No hay datos.`);
        return;
      }

      const ID = getIdfechaResult[0].ID;

      // Enviar el comprobante de compra por correo electrónico
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
      Ha pagado $<span class="valor">${valor}</span> en Vida Rol INC
    </div>
    <div class="info">
      <p>Id de transacción (Recibo de pago): ${ID}</p>
      <p>Fecha de la transacción: ${new Date().toLocaleString()}</p>
      <p>Comercio: Vida Rol INC</p>
      <p>vida.rol.oficial@gmail.com</p>
    </div>
    <div class="info">
      <p>Datos adicionales:</p>
      <p>Producto: vehículo</p>
      <p>Valor: $<span class="valor">${valor}</span></p>
      <p>Usuario: ${name_s}</p>
      <p>Modelo: ${coche}</p>
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
      await sendMail(correo, cuerpoCorreo);
    }

    return `Se ha agregado el coche con ID ${coche} al usuario ${name_s} con éxito.`;
  } catch (error) {
    console.error('Error al agregar el coche:', error);
    throw new Error('Hubo un error al agregar el coche. Por favor, inténtalo de nuevo más tarde.');
  }
}

// Función principal del comando addcar
module.exports = {
  name: 'addcar',
  aliases: ['darauto', 'darcar'],

  async execute(client, message, commandArgs) {
    let comandoEnEjecucion = false;

    if (comandoEnEjecucion) {
      message.channel.send('Por favor, espera a que el comando anterior termine.');
      return;
    }

    comandoEnEjecucion = true;

    try {
      const userID = message.author.id;
      const sqlGetUserPermissions = 'SELECT Admin FROM PlayaRP WHERE Discord = ?';
      const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

      if (resultGetUserPermissions.length === 0) {
        message.channel.send('No tienes permiso para usar este comando.');
        return;
      }

      const userPermissionLevel = resultGetUserPermissions[0].Admin;

      if (userPermissionLevel <= 7) {
        message.channel.send('No tienes permiso para usar este comando.');
        return;
      }

      const args = message.content.split(' ');
      const [name_s, coche, matricula, precio, correo] = args.slice(1);

      if (!name_s || !coche || !matricula || !precio || !correo) {
        message.channel.send('Por favor, proporciona todos los argumentos necesarios: nombre, coche, matrícula, precio y correo.');
        return;
      }

      const result = await addCar(name_s, coche, matricula, precio, message, correo);
      message.channel.send(result);
    } catch (error) {
      console.error('Error en el comando addcar:', error);
      message.channel.send('Hubo un error al agregar el coche. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      comandoEnEjecucion = false;
    }

    message.delete();
  }
}
