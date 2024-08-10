const { MessageEmbed } = require('discord.js');
const connection = require('./database');
const AsciiTable = require('ascii-table');

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

module.exports = {
  name: "buser",
  aliases: [],

  async execute(client, message, args) {
    const sqlGetBoss = "SELECT Discord FROM PlayaRP WHERE Admin >='5'";
    const resultGetBoss = await executeQuery(sqlGetBoss);

    // Guardar los registros en la variable boss
    const boss = resultGetBoss.map((row) => row.ID_user);

    const usuariosPermitidos = boss;

    if (message.author.bot) return;

    if (!usuariosPermitidos.includes(message.author.id)) {
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }
    const name = args[0];

    if (!name) {
      message.channel.send('Debes proporcionar la parte del nombre del usuario a buscar.');
      return;
    }

    try {
      // Realizar la consulta para obtener los nombres de usuarios y sus respectivas ID filtrando por la parte del nombre
      const sqlQuery = 'SELECT Name, ID FROM PlayaRP WHERE Name LIKE ?';
      const result = await executeQuery(sqlQuery, [`%${name}%`]);

      if (result.length === 0) {
        message.channel.send('No se encontraron usuarios con la parte del nombre proporcionada.');
        return;
      }

      // Crear una tabla ASCII para mostrar los resultados
      const table = new AsciiTable();
      table.setHeading('NAME', 'ID');

      result.forEach((row) => {
        table.addRow(row.Name, row.ID);
      });

      // Obtener el contenido de la tabla y calcular la línea superior personalizada
      const tableString = table.toString();
      const lines = tableString.split('\n');
      const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
      const topLine = '─'.repeat(maxLength);

      // Crear un mensaje con la tabla y enviarlo al canal
      let remainingLines = lines;
      let currentContent = '';
      while (remainingLines.length > 0) {
        if (currentContent.length + remainingLines[0].length > 1024) {
          const embed = new MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Usuarios por nombre')
            .setDescription('```' + topLine + '\n' + currentContent + '```');

          message.channel.send(embed);
          currentContent = '';
        }

        currentContent += remainingLines.shift() + '\n';
      }

      if (currentContent.length > 0) {
        const embed = new MessageEmbed()
          .setColor('#00ff00')
          .setTitle('Usuarios por nombre')
          .setDescription('```' + topLine + '\n' + currentContent + '```');

        message.channel.send(embed);
        message.delete()
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta:', error);
      message.channel.send('Ocurrió un error al obtener la información de los usuarios.');
    }
  }
};


