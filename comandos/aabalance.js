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
  name: "balance",
  aliases: [],

  async execute(client, message, commandArgs) {
    const userID = message.author.id;
    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    if (resultGetUserPermissions.length === 0 || resultGetUserPermissions[0].Admin <= 7) {
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const args = message.content.split(' ');

    const idPais = args[1];
    const mes = args[2];

    if (!idPais) {
      message.channel.send('Por favor, proporciona el ID del país o "7" para el total.');
      return;
    }

    // Definir el diccionario de mapeo
    const metodoMapping = {
      1: 'Perú',
      2: 'Ecuador',
      3: 'Colombia',
      4: 'Chile',
      5: 'Argentina',
      6: 'Internacional',
      7: 'Total'
    };

    // Mapeo de los nombres de los meses
    const meses = {
      1: 'Enero',
      2: 'Febrero',
      3: 'Marzo',
      4: 'Abril',
      5: 'Mayo',
      6: 'Junio',
      7: 'Julio',
      8: 'Agosto',
      9: 'Septiembre',
      10: 'Octubre',
      11: 'Noviembre',
      12: 'Diciembre'
    };

    // Obtener el país correspondiente al ID proporcionado
    const metodo = metodoMapping[idPais];

    if (!metodo) {
      message.channel.send('El ID del país proporcionado no es válido.');
      return;
    }

    try {
      let query;
      let params;

      if (idPais === '7') {
        // Balance total
        if (mes) {
          query = 'SELECT SUM(Valor) AS balance, COUNT(*) AS ventas FROM comprobante WHERE MONTH(Fecha) = ?';
          params = [mes];
        } else {
          query = 'SELECT SUM(Valor) AS balance, COUNT(*) AS ventas FROM comprobante';
          params = [];
        }
      } else {
        // Balance por país
        if (mes) {
          query = 'SELECT SUM(Valor) AS balance, COUNT(*) AS ventas FROM comprobante WHERE Metodo = ? AND MONTH(Fecha) = ?';
          params = [metodo, mes];
        } else {
          query = 'SELECT SUM(Valor) AS balance, COUNT(*) AS ventas FROM comprobante WHERE Metodo = ?';
          params = [metodo];
        }
      }

      const result = await executeQuery(query, params);

      if (result.length > 0 && result[0].balance !== null) {
        const balance = result[0].balance;
        const ventas = result[0].ventas;
        const promedioVenta = ventas > 0 ? (balance / ventas).toFixed(2) : 0;

        const nombreMes = mes ? meses[mes] : 'Total';
        const tituloEmbed = idPais === '7' ? `Balance ${nombreMes}` : `Balance ${metodo} ${nombreMes}`;

        const embed = new MessageEmbed()
          .setColor('#0099ff')
          .setTitle(tituloEmbed)
          .setDescription(`Total balance: $${balance.toFixed(2)}\nPromedio venta: $${promedioVenta}\nTotal ventas: ${ventas}`)
          .setColor("#00FFF5")

			
.setFooter('Vida Rol - Balance', 'https://i.postimg.cc/pXHF5Mbp/Logo-Oficial-1.png')
              .setThumbnail('https://i.postimg.cc/BZm1Rvf8/Vida-Rol-Large.png');

        message.channel.send(embed);
      } else {
        message.channel.send('No se encontraron registros para el filtro proporcionado.');
      }
    } catch (error) {
      console.error('Error al obtener el balance: ', error);
      message.channel.send('Se produjo un error al obtener el balance.');
    }
  }
};
