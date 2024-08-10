const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const nodemailer = require('nodemailer');
const config = require('./config1');

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
  name: "comprobante1",
  aliases: [],

  async execute(client, message, args) {
      // Suponiendo que executeQuery es una función que ejecuta una consulta SQL y devuelve los resultados

const userID = message.author.id; // ID del usuario que está intentando ejecutar el comando

const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

if (resultGetUserPermissions.length === 0) {
  // El usuario no existe en la base de datos
  message.channel.send('No tienes permiso para usar este comando.');
  return;
}

const userPermissionLevel = resultGetUserPermissions[0].Admin;

if (userPermissionLevel <= 7) {
  // El nivel de permiso del usuario no es mayor a 8
  message.channel.send('No tienes permiso para usar este comando.');
  return;
}

    const recipientEmail = args[0];
    const tipoProducto = parseInt(args[1]);
    const valorCompra = parseFloat(args[2]);
    const cantidad = parseInt(args[3]);
    const fechaCompra = formatDate(new Date());

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

    const productoText = getProductoText(tipoProducto);
    if (!productoText) {
      return message.reply('Tipo de producto no válido. Debes elegir 1 para coins, 2 para vehículos, 3 para negocios, 4 para mascotas y 5 para gastos administrativos.');
    }

    let mensajeEspecifico = '';
    switch (tipoProducto) {
      case 1:
        mensajeEspecifico = 'Los coins que solicitaste han sido entregados!\n' +
          'Puedes comprobarlo con el comando /mm » estadísticas.\n' +
          'Para usarlos, usa /vip o cámbialo por dinero IC en el banco.';
        break;
      case 2:
        mensajeEspecifico = 'El vehículo que solicitaste ha sido entregado!\n' +
          'Puedes comprobarlo con el comando /gps » localización de vehículos, o con el comando /impuestos.';
        break;
      case 3:
        mensajeEspecifico = 'El negocio que solicitaste ha sido entregado y está a nombre de tu personaje virtual.\n' +
          'Puedes comprobarlo dirigiéndote a la dirección física del negocio dentro del juego o con el comando /impuestos.';
        break;
      case 4:
        mensajeEspecifico = 'La mascota que solicitaste ha sido entregada!\n' +
          'Puedes comprobarlo con el comando /mascota.';
        break;
      case 5:
        mensajeEspecifico = `Realizaste un depósito el día ${fechaCompra} a través de PayPal con un importe de: $${valorCompra} por motivo de tercerización.`;
        break;
      default:
        mensajeEspecifico = 'Producto desconocido.';
    }

    const cuerpoCorreo = `
  <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Comprobante de compra</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #1c1c1c;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 600px;
            margin: 0 auto;
            background-color: #222222;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            color: #ffffff;
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo img {
            width: 150px;
        }
        .content {
            margin-bottom: 20px;
        }
        .content p {
            margin-bottom: 10px;
            color: #ffffff;
        }
        .content table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #333333;
            color: #ffffff;
        }
        .content th, .content td {
            padding: 10px;
            text-align: left;
            border: 1px solid #333333;
            color: #ffffff;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #333333;
            color: #ffffff;
        }
        .button {
            display: inline-block;
            background-color: #00ced1;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .red-text {
            color: #ff0000;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://i.postimg.cc/BZm1Rvf8/Vida-Rol-Large.png" alt="Vida Rol">
        </div>
        <div class="content">
             <p>Realizaste una compra el día ${fechaCompra} a través de PayPal con un importe de: $${parseFloat(valorCompra).toFixed(2)} por motivo de la compra de ${productoText} en Vida Rol.</p>
            <p>${mensajeEspecifico}</p>
            <table>
                <tr>
                    <th>Importe</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                </tr>
                <tr>
    <td>$${parseFloat(args[2]).toFixed(2)}</td>
    <td>${getProductoText(parseInt(args[1]))}</td>
    <td>${parseInt(args[3])}</td>
</tr>
            </table>
            <p>El producto/servicio que solicitaste ha sido entregado con éxito. Para verificarlo, entra al juego.</p>
            <p>Por favor, para finalizar con esta compra y confirmar la recepción del producto, responda a este correo con el siguiente mensaje:</p>
            <blockquote>
                <p>"Estoy de acuerdo con los servicios brindados, comprobé los datos enviados y acepto que recibí el producto/servicio que solicité."</p>
            </blockquote>
        </div>
        <div class="footer">
            <p class="red-text">Al ser una transacción inmediata, responda a este correo en un plazo máximo de 24 horas, caso contrario se efectuará un reembolso y la cancelación del producto.</p>
            <a class="button" href="https://vida-roleplay.com/" style="color: #ffffff;">Visitar Vida Roleplay</a>
            <a class="button" href="https://discord.gg/d8fuGQ7xY5" style="color: #ffffff;">Unirse al servidor de Discord</a>
        </div>
    </div>
</body>
</html>
    `;

    sendMail(recipientEmail, cuerpoCorreo);
    message.reply('Se ha enviado el comprobante de compra por correo electrónico.\nResponda el mensaje con:\n"Estoy de acuerdo con los servicios brindados, comprobé los datos enviados y acepto que recibí el producto/servicio que solicité."');

    function getProductoText(tipoProducto) {
  switch (tipoProducto) {
    case 1:
      return 'Coins';
    case 2:
      return 'Vehículos';
    case 3:
      return 'Negocios';
    case 4:
      return 'Mascotas';
    case 5:
      return 'Gastos administrativos';
    default:
      return null;
  }
}

  },
};










