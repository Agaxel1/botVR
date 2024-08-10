const Discord = require('discord.js');
const AsciiTable = require('ascii-table');
const connection = require('./database');
const mysql = require('mysql');

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
  name: 'inventario',
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

    const action = args[0];
    const Usuario = args[1];
    const slotNumber = parseInt(args[2]);

    if (!Usuario) {
      message.channel.send('Debes especificar un usuario.');
      return;
    }

    try {
      // Realiza una consulta a la base de datos para obtener el inventario del usuario
      const sqlGetInventory = 'SELECT Inventory FROM PlayaRP WHERE Name = ?';
      const resultGetInventory = await executeQuery(sqlGetInventory, [Usuario]);

      if (resultGetInventory.length > 0) {
        let inventory = resultGetInventory[0].Inventory;

        // Obtener los nombres de los objetos desde la base de datos
        const sqlGetItemNames = 'SELECT ID, Nombre FROM Objetos';
        const resultGetItemNames = await executeQuery(sqlGetItemNames);

        // Crear un objeto con los nombres de los objetos
        const objetos = {};
        resultGetItemNames.forEach((row) => {
          objetos[row.ID] = row.Nombre;
        });

        // Acción: Mostrar inventario
        if (action === 'mostrar') {
          // Crear la tabla con ascii-table
          const table = new AsciiTable(`Inventario de ${Usuario}`);
          table.setHeading('Slot', 'Item', 'Cantidad');
          table.setBorder('|', '-', '+', '+');

          // Separa el inventario en 15 slots de 3 espacios cada uno
          const slots = inventory.match(/\d+\|\d+\|\d+/g);

          for (let i = 0; i < 15; i++) {
            const slot = slots[i] || '0|0|0';
            const [item, cantidad] = slot.split('|');
            const itemName = objetos[item] || 'Vacio';
            const slotNumberFormatted = `${i + 1}`.padEnd(4);
            const itemNameFormatted = itemName.padEnd(15);
            table.addRow(slotNumberFormatted, itemNameFormatted, cantidad);
          }

          // Convertir la tabla en un mensaje de Discord con la línea superior añadida
          const tableString = '```' + table.toString() + '```';
          const lines = tableString.split('\n');
          const topLine = lines[1].replace(/[^|]/g, '-');
          lines.splice(1, 0, topLine);
          const formattedTable = lines.join('\n');

          const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Inventario de ${Usuario}`)
            .setDescription(formattedTable);

          // Mostrar el inventario del usuario
          message.channel.send(embed);
        }
        // Acción: Eliminar inventario
        else if (action === 'eliminar') {
          inventory = '241|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0';
          const sqlUpdateInventory = 'UPDATE PlayaRP SET Inventory = ? WHERE Name = ?';
          await executeQuery(sqlUpdateInventory, [inventory, Usuario]);
          message.channel.send(`El inventario de ${Usuario} ha sido eliminado.`);
        }
        // Acción inválida
        else {
          message.channel.send(`La acción ${action} no es válida.`);
        }
      } else {
        // El usuario no se encuentra en la base de datos
        message.channel.send(`El usuario ${Usuario} no existe en la base de datos.`);
      }
    } catch (error) {
      console.error('Error al obtener el inventario del usuario: ', error);
      message.channel.send('Ocurrió un error al intentar ejecutar este comando.');
    }
  }
};
