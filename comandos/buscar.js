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

// Función para buscar el valor en todas las columnas
function buscarValorEnColumnas(valores) {
  return new Promise(async (resolve, reject) => {
    try {
      // Supongamos que Object1, Object2, ..., Object150 son las columnas a buscar
      const columnas = Array.from({ length: 150 }, (_, i) => `Object${i + 1}`);

      // Construir la consulta dinámica
      const consultaBase = "SELECT * FROM House WHERE CONCAT(" + columnas.join(', ') + ") LIKE ?";

      // Ejecutar la consulta
      const resultado = await executeQuery(consultaBase, [`%|${valores.join('|')}|%`]);

      if (resultado.length > 0) {
        // Encontrar todas las columnas donde se encuentra el valor
        const columnasEncontradas = columnas.filter((columna) => resultado.some((row) => row[columna].includes(`|${valores.join('|')}|`)));

        // Extraer la lista de owners y numbers
        const owners = resultado.map((row) => row.Owner);
        const numbers = resultado.map((row) => row.Number);

        // Puedes devolver tanto la lista de columnas encontradas como las listas de owners y numbers
        resolve({ columnasEncontradas, owners, numbers });
      } else {
        resolve(null); // Valor no encontrado en ninguna columna
      }
    } catch (error) {
      reject(error);
    }
  });
}



module.exports = {
  name: "buscar",
  aliases: [],

  async execute(client, message, commandArgs) {
    const userID = message.author.id;

    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    if (resultGetUserPermissions.length === 0 || resultGetUserPermissions[0].Admin <= 4) {
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const comandoEnEjecucion = false;
    if (comandoEnEjecucion) {
      message.channel.send('Por favor, espera a que el comando anterior termine.');
      return;
    }

    const args = message.content.split(' ');
    args.shift(); // Eliminar el primer elemento "!buscar"
    const valores = args.join('').split('|');

    try {
      const resultadoBusqueda = await buscarValorEnColumnas(valores);

      if (resultadoBusqueda) {
        const { columnasEncontradas, owners, numbers } = resultadoBusqueda;

        if (columnasEncontradas.length > 0) {
          // Realizar un segundo SELECT para obtener el Name desde la tabla PlayaRP
          const sqlGetName = "SELECT Name FROM PlayaRP WHERE ID = ?";

          // Mostrar cada resultado encontrado
          for (let i = 0; i < columnasEncontradas.length; i++) {
            const owner = owners[i];
            const number = numbers[i];

            // Obtener el Name del owner
            const resultGetName = await executeQuery(sqlGetName, [owner]);
            const playerName = resultGetName.length > 0 ? resultGetName[0].Name : 'Desconocido';

            message.channel.send(`Resultado ${i + 1}:\nEl valor ${valores.join('|')} fue encontrado en la columna ${columnasEncontradas[i]}.\n\nOwner: ${owner} (${playerName})\nCasa Numero: ${number}.`);
          }
        } else {
          message.channel.send(`El valor ${valores.join('|')} no fue encontrado en ninguna columna.`);
        }
      } else {
        message.channel.send(`El valor ${valores.join('|')} no fue encontrado en ninguna columna.`);
      }
    } catch (error) {
      console.error('Error al buscar el valor en las columnas: ', error);
    }
  }
};