const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

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

module.exports = {
  name: "mc",
  aliases: [],

  async execute(client, message, commandArgs) {
    const userID = message.author.id;
    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    if (resultGetUserPermissions.length === 0 || resultGetUserPermissions[0].Admin <= 3) {
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const args = message.content.split(' ');

    const id = args[1];
    const id2 = args[2];

    if (!id || !id2) {
      message.channel.send('Por favor, proporciona el ID y el ID de la secundaria.\n!mc ID IDsecundaria');
      return;
    }

    try {
      // Verificar si las cuentas existen y si ya tienen un valor en MC
      const selectQuery = 'SELECT ID,Name, MC FROM PlayaRP WHERE ID = ? OR ID = ?';
      const selectResult = await executeQuery(selectQuery, [id, id2]);

      if (selectResult.length === 0) {
        message.channel.send('No se encontró el ID especificado en la base de datos.');
        return;
      }

      let idExists = false;
      let id2Exists = false;
      let idHasMC = false;
      let id2HasMC = false;
      let nombreID = "";
      let nombreID2 = "";
      let ID = 0;
      let ID2 = 0;

      selectResult.forEach(row => {
        if (row.ID == id) {
          idExists = true;
          nombreID = row.Name;
          ID = row.ID;
          if (row.MC) {
            idHasMC = true;
          }
        }
        if (row.ID == id2) {
          id2Exists = true;
          nombreID2 = row.Name;
          ID2 = row.ID;
          if (row.MC) {
            id2HasMC = true;
          }
        }
      });

      if (!idExists) {
        message.channel.send(`El ID ${id} no existe en la base de datos.`);
        return;
      }

      if (!id2Exists) {
        message.channel.send(`El ID ${id2} no existe en la base de datos.`);
        return;
      }

      if (idHasMC) {
        message.channel.send(`El ID ${id} ya tiene una multicuenta activa.`);
        return;
      }

      if (id2HasMC) {
        message.channel.send(`El ID ${id2} ya tiene una multicuenta activa.`);
        return;
      }

      // Actualizar la columna MC en la tabla PlayaRP
      const updateQuery = 'UPDATE PlayaRP SET MC = ? WHERE ID = ?';
      const updateResult1 = await executeQuery(updateQuery, [ID2, ID]);
      const updateResult2 = await executeQuery(updateQuery, [ID, ID2]);

      if (updateResult1.affectedRows > 0 && updateResult2.affectedRows > 0) {
        message.channel.send(`La Multicuenta para el ${nombreID}(${ID}) ha sido actualizado a ${nombreID2}(${ID2}) correctamente.`);

        // Enviar log al canal específico
        const logChannelId = '1244269138713645139'; // Reemplaza esto con el ID real del canal
        const logChannel = client.channels.cache.get(logChannelId);

        if (logChannel) {
          const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Actualización de MC')
            .setDescription(`El usuario ${message.author.username} (${message.author.id}) ha actualizado el MC.`)
            
            // Subtítulo para Principal
            .addField('**Principal**', '\u200B')
            .addField('ID', ID, true)
            .addField('Name', nombreID, true)
            
            // Campo en blanco para separación
            .addField('\u200B', '\u200B')
            
            // Subtítulo para Secundaria
            .addField('**Secundaria**', '\u200B')
            .addField('ID', ID2, true)
            .addField('Name', nombreID2, true)
            .setTimestamp();
        
          logChannel.send(embed);
        }
         else {
          console.error('No se encontró el canal de log.');
        }
      } else {
        message.channel.send('No se pudo actualizar el MC para el ID especificado.');
      }
    } catch (error) {
      console.error('Error al actualizar el MC: ', error);
      message.channel.send('Se produjo un error al actualizar el MC.');
    }
  }
};
