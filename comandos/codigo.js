const generateRandomCode = require('./utils');
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

// Función para ejecutar consultas a la base de datos
function executeQuery(query, params) {
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

module.exports = {
  name: 'codigo',
  alias: [],

  async execute(client, message, commandArgs) {
    const sqlGetBoss = "SELECT ID_user FROM bot_admin WHERE Admin = '8'";
    const resultGetBoss = await executeQuery(sqlGetBoss);
    // Guardar los registros en la variable boss
    const boss = resultGetBoss.map((row) => row.ID_user);
    const usuariosPermitidos = boss;
    if (message.author.bot) return;
    if (!usuariosPermitidos.includes(message.author.id)) {
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    let comandoEnEjecucion = false;
    if (comandoEnEjecucion) {
      message.channel.send('Por favor, espera a que el comando anterior termine.');
      return;
    }

    const playerName = commandArgs[0]; // Usar commandArgs en lugar de args
    const mentionedUser = message.mentions.users.first();

    if (!playerName || !mentionedUser) {
      return message.reply('Uso incorrecto del comando. Uso: !codigo Nombre_Apellido @Usuario');
    }

    // Generar el código aleatorio
    const randomCode = generateRandomCode();

    try {
      const updateQuery = 'UPDATE PlayaRP SET Code = ? WHERE Name = ?';
      connection.query(updateQuery, [randomCode, playerName], async (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating code in database:', updateErr);
        } else {
          console.log('Code updated in database!');

          try {
            // Envía el mensaje privado al usuario mencionado
            const userDM = await mentionedUser.createDM();
            userDM.send(`¡Hola ${mentionedUser.username}! Tu código de verificación es: ${randomCode}`)
              .then(() => {
                console.log('Mensaje enviado al usuario.');
              })
              .catch((error) => {
                console.error('Error al enviar el mensaje:', error);
              });
          } catch (error) {
            console.error(error);
            message.reply('Hubo un error al enviar el mensaje privado.');
          }
        }
      });
    } catch (error) {
      console.error(error);
      message.reply('Hubo un error al procesar el comando.');
    }
  }
};


