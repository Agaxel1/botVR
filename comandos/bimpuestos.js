const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const moment = require('moment-timezone');

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
const MAX_FIELDS_PER_EMBED = 25;

module.exports = {
  name: 'bimpuestos',
  aliases: [],

  async execute(client, message, commandArgs) {
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

    if (userPermissionLevel <= 4) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }
    const args = message.content.split(' ');
    const usuario = args[1];
    if (!usuario) {
      message.channel.send('No has establecido el nombre.');
      return;
    }
    try {

      // Verificar si el argumento es un número (ID)
      const isNumber = /^\d+$/.test(usuario);
      let userID;
      let Name;

      if (isNumber) {
        // Verificar si el usuario existe en la base de datos
        const sqlUsuario = 'SELECT COUNT(*) AS userCount FROM PlayaRP WHERE ID = ?';
        const usuarioResult = await executeQuery(sqlUsuario, [usuario]);
        const usuarioExiste = usuarioResult[0].userCount > 0;

        if (!usuarioExiste) {
          message.channel.send(`El ID ${usuario} no existe en la base de datos.`);
          return;
        }

        // Obtener ID del usuario
        const sqlID = 'SELECT ID, Name FROM PlayaRP WHERE ID = ?';
        const idResult = await executeQuery(sqlID, [usuario]);
        userID = idResult[0].ID;
        Name = idResult[0].Name;
      } else {
        // Verificar si el usuario existe en la base de datos
        const sqlUsuario = 'SELECT COUNT(*) AS userCount FROM PlayaRP WHERE Name = ?';
        const usuarioResult = await executeQuery(sqlUsuario, [usuario]);
        const usuarioExiste = usuarioResult[0].userCount > 0;

        if (!usuarioExiste) {
          message.channel.send(`El usuario ${usuario} no existe en la base de datos.`);
          return;
        }

        // Obtener ID del usuario
        const sqlID = 'SELECT ID, Name FROM PlayaRP WHERE Name = ?';
        const idResult = await executeQuery(sqlID, [usuario]);
        userID = idResult[0].ID;
        Name = idResult[0].Name;
      }


      // Obtener registros de log_car_delete
      const sqlCar = 'SELECT Owner, Name, Model, DiasRestantes, fecha FROM log_car_delete WHERE Owner = ? AND tipo = 1';
      const carResult = await executeQuery(sqlCar, [userID]);

      // Iterar sobre los resultados y obtener el carname
      for (const item of carResult) {
        const vehicleID = item.Model;

        // Consulta para obtener el carname de la tabla car_table
        const sqlCarName = 'SELECT carname FROM car_table WHERE vehicleid = ?';
        const carNameResult = await executeQuery(sqlCarName, [vehicleID]);

        if (carNameResult.length > 0) {
          const carName = carNameResult[0].carname;

          // Agregar el campo carName a cada elemento de carResult
          item.carName = carName;
        }

      }

      // Enviar el embed con la información, incluyendo el carName
      await sendEmbedForCategory(message, carResult, 'autos', Name, userID);

      // Obtener registros de log_house_delete
      const sqlHouse = 'SELECT Owner, Name, Number, DiasRestantes, fecha FROM log_house_delete WHERE Owner = ?';
      const houseResult = await executeQuery(sqlHouse, [userID]);
      await sendEmbedForCategory(message, houseResult, 'casas', Name, userID);

      // Obtener registros de negocios
      const sqlNeg = 'SELECT Owner_old, Owner_new, Name_old, id_neg, Name_neg, impuesto, fecha FROM log_negoc_owner WHERE Owner_old = ? GROUP BY Owner_old, Owner_new, Name_old, id_neg, Name_neg, impuesto, fecha ORDER BY id DESC';
      const negResult = await executeQuery(sqlNeg, [userID]);
      await sendEmbedForCategory(message, negResult, 'negocios', Name, userID);

    } catch (error) {
      console.error('Error al obtener registros de impuestos: ', error);
    }

    message.delete();
  }
};

async function sendEmbedForCategory(message, result, category, Name, userID) {
  if (result.length > 0) {
    const embed = new MessageEmbed()
      .setTitle(`Registros de impuestos para ${Name} [${userID}] - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
      .setColor('#0099ff');

    const fields = await Promise.all(result.map(async (item, index) => {
      const commonFields = {
        name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${index + 1}:`,
        value: '',
      };

      switch (category) {
        case 'autos':
          commonFields.value = `ID Modelo: ${item.Model || 'N/A'}\nAuto: ${item.carName}\nDías Restantes: ${item.DiasRestantes || '0'}\nFecha: ${item.fecha ? moment(item.fecha).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}`;
          break;
        case 'casas':
          commonFields.value = `Número: ${item.Number || 'N/A'}\nDías Restantes: ${item.DiasRestantes || '0'}\nFecha: ${item.fecha ? moment(item.fecha).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}`;
          break;
        case 'negocios':
          const ownerOld = item.Owner_old;
          const ownerNew = item.Owner_new;
          const number = item.id_neg || 'N/A';
          const name = item.Name_neg || 'N/A';
          const diasRestantes = item.impuesto || '0';
          const fecha = item.fecha ? moment(item.fecha).format('YYYY-MM-DD HH:mm:ss') : 'N/A';

          if (ownerOld !== 0 && ownerNew === 0) {
            const negocioKey = `${number}-${name}`;
            commonFields.value = `Número: ${number}\nNegocio: ${name}\nDías Restantes: ${diasRestantes}\nFecha: ${fecha}`;
          } else {
            commonFields.value = 'Información no disponible';
          }
          break;
        default:
          commonFields.value = 'Información no disponible';
          break;
      }

      return commonFields;
    }));

    // Dividir los campos en grupos de 25
    const chunkedFields = [];
    for (let i = 0; i < fields.length; i += MAX_FIELDS_PER_EMBED) {
      chunkedFields.push(fields.slice(i, i + MAX_FIELDS_PER_EMBED));
    }

    // Enviar mensajes para cada grupo de campos
    for (const chunk of chunkedFields) {
      embed.fields = chunk;
      message.channel.send(embed);
    }
  }
}
