const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const moment = require('moment-timezone');

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

// Función para verificar si el usuario existe en la base de datos
function verificarUsuario(usuario) {
  return new Promise((resolve, reject) => {
    // Verificar si el argumento es un número (ID)
    const isNumber = /^\d+$/.test(usuario);

    if (isNumber) {
      const sql = 'SELECT COUNT(*) AS userCount FROM PlayaRP WHERE ID = ?';
      connection.query(sql, [usuario], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0].userCount > 0);
        }
      });
    } else {
      const sql = 'SELECT COUNT(*) AS userCount FROM PlayaRP WHERE Name LIKE ?';
      const searchName = `%${usuario}%`; // Agregar %% alrededor del término de búsqueda
      connection.query(sql, [searchName], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0].userCount > 0);
        }
      });
    }
  });
}

function obtenerLeaderName(memberId) {
  return new Promise((resolve, reject) => {
    const leaderSql = 'SELECT Name FROM LeaderInfo WHERE Leader = ?';
    connection.query(leaderSql, [memberId], (error, leaderResult) => {
      if (error) {
        reject(error);
      } else {
        resolve(leaderResult.length > 0 ? leaderResult[0].Name : 'N/A');
      }
    });
  });
}

// Función para obtener información del usuario en la base de datos
function obtenerInfoUsuario(usuario) {
  return new Promise((resolve, reject) => {
    let sql;
    let searchParam;

    // Verificar si el usuario es un número (ID) o un nombre
    if (/^\d+$/.test(usuario)) {
      // Si es un número, buscar por ID
      sql = 'SELECT ID, Member, TimeDis, SkinMascota, MC FROM PlayaRP WHERE ID = ?';
      searchParam = [usuario];
    } else {
      // Si no es un número, buscar por nombre
      sql = 'SELECT ID, Member, TimeDis, SkinMascota, MC FROM PlayaRP WHERE Name LIKE ?';
      searchParam = [`%${usuario}%`];
    }

    connection.query(sql, searchParam, async (error, memberResult) => {
      if (error) {
        reject(error);
      } else {
        let leaderName = 'N/A';
        let ownerId = null;
        let lastConnection = null;
        let mc = null;

        if (memberResult.length > 0) {
          ownerId = memberResult[0].ID;
          lastConnection = new Date(memberResult[0].TimeDis * 1000);
          mc = memberResult[0].MC;

          try {
            leaderName = await obtenerLeaderName(memberResult[0].Member);
          } catch (error) {
            reject(error);
            return;
          }
        }

        const infoSql = 'SELECT Name, PuntosDeRol, HorasJugadas, Level, Vip, Prison, tBan, tBanN, Crystal, Bank, Warn, MoneyVR, Online, DineroGastado, CoinsGastados, tBanR, Discord,TimerAntiDM, PKFaccion FROM PlayaRP WHERE ID = ?';

        connection.query(infoSql, [ownerId], (error, results) => {
          if (error) {
            reject(error);
          } else {
            // Verificar si hay resultados antes de acceder a las propiedades
            if (memberResult.length > 0) {
              resolve({ userInfo: results, leaderName, ownerId, lastConnection, skinMascota: memberResult[0].SkinMascota, mc });
            } else {
              resolve({ userInfo: results, leaderName, ownerId, lastConnection, skinMascota: null, mc });
            }
          }
        });
      }
    });
  });
}

function obtenerCantidadAutos(ownerId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT COUNT(*) AS carCount FROM Car WHERE Owner = ?';
    connection.query(sql, [ownerId], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results[0].carCount);
      }
    });
  });
}

module.exports = {
  name: "stats",
  aliases: [],

  async execute(client, message, commandArgs) {
    const userID = message.author.id; // ID del usuario que está intentando ejecutar el comando

    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    if (resultGetUserPermissions.length === 0) {
      // El usuario no existe en la base de datos
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const userPermissionLevel = resultGetUserPermissions[0].Admin;

    if (userPermissionLevel <= 3) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const args = message.content.split(' ');
    const usuario = args[1];

    try {
      const usuarioExiste = await verificarUsuario(usuario);

      if (usuarioExiste) {
        const result = await obtenerInfoUsuario(usuario);
        const carCount = await obtenerCantidadAutos(result.ownerId);

        const data = result.userInfo[0];
        const lastConnection = moment(result.lastConnection).tz('America/Lima').add({ hours: 20, days: -1 }).format('YYYY-MM-DD HH:mm:ss');
        let mascota = 'No';

        const mascotas = { '122': 'Perro', '123': 'Perro', '136': 'Perro', '144': 'Perro', '181': 'Perro', '14': 'Gato', '146': 'Gallina', '162': 'Gorila', '145': 'Lobo', '227': 'Leopardo', '231': 'Cabra', '232': 'Zorro' };

        if (result.skinMascota && mascotas[result.skinMascota]) {
          mascota = mascotas[result.skinMascota];
        }
        const fechaBaneoUnix = data.tBan; // Suponiendo que data.tBanN es un valor Unix
        const fechaAntiDmUnix = data.TimerAntiDM;

        if (fechaAntiDmUnix) {
          const fechAntidm = moment.unix(fechaAntiDmUnix).tz('Chile/Continental').add(19, 'hours').format('YYYY-MM-DD HH:mm:ss');
          data.TimerAntiDM = fechAntidm;
        } else {
          data.TimerAntiDM = 'N/A'; // O cualquier otro mensaje que desees mostrar si el valor es nulo
        }

        if (fechaBaneoUnix) {
          const fechaBaneo = moment.unix(fechaBaneoUnix).tz('Chile/Continental').add(19, 'hours').format('YYYY-MM-DD HH:mm:ss');
          data.tBan = fechaBaneo;
        } else {
          data.tBan = 'N/A'; // O cualquier otro mensaje que desees mostrar si el valor es nulo
        }

        const fechaPKFUnix = data.PKFaccion; // Suponiendo que data.tBanN es un valor Unix

        if (fechaPKFUnix) {
          const fechaPKF = moment.unix(fechaPKFUnix).tz('Chile/Continental').add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
          data.PKFaccion = fechaPKF;
        } else {
          data.PKFaccion = 'N/A'; // O cualquier otro mensaje que desees mostrar si el valor es nulo
        }

        const mensaje = new MessageEmbed()
          .setTitle(`🌟 Información de ${data.Name} 🌟`)
          .addFields(
            { name: '🆔', value: result.ownerId, inline: true },
            { name: '🌟 Puntos de Rol', value: data.PuntosDeRol, inline: true },
            { name: '⏰ Horas Jugadas', value: data.HorasJugadas, inline: true },
            { name: '🎮 Nivel', value: data.Level, inline: true },
            { name: '🚀 Facción', value: result.leaderName, inline: true },
            { name: '💎 Nivel VIP', value: data.Vip, inline: true },
            { name: '⛓ Tiempo de Jail', value: `${Math.round(data.Prison / 60)} min`, inline: true },
            { name: '🚫 Fecha Antidm', value: data.TimerAntiDM, inline: true },
            { name: '⛔ Fecha de Baneo', value: data.tBan, inline: true },
            { name: '🔨 Baneado por', value: data.tBanN || 'N/A', inline: true },
            { name: '💬 Razón de Baneo', value: data.tBanR || 'N/A', inline: true },
            { name: '⚠ Advertencias', value: data.Warn, inline: true },
            { name: '💰 Coins', value: data.Crystal, inline: true },
            { name: '🏦 Dinero en banco', value: data.Bank, inline: true },
            { name: '💵 Dinero en mano', value: data.MoneyVR, inline: true },
            { name: '🚗 Numero de Autos', value: carCount, inline: true },
            { name: '💸 Dinero Gastado', value: data.DineroGastado, inline: true },
            { name: '💳 Coins Gastados', value: data.CoinsGastados, inline: true },
            { name: '🐾 Mascota', value: result.skinMascota ? mascotas[result.skinMascota] : 'No tiene', inline: true },
            { name: '⚔ PK faccion', value: data.PKFaccion || 'N/A', inline: true },
            { name: '📡 Discord', value: data.Discord !== null ? 'Verificado' : 'No está verificado', inline: true },
            { name: data.Online === 1 ? '🟢 Usuario En Línea' : '⚪ Última Conexión', value: data.Online === 1 ? '✅' : lastConnection, inline: true },
            { name: '⚙️ Multicuenta', value: result.mc || 'N/A', inline: true }
          )
          .setColor('#6633FF')
          .setFooter('Gracias por utilizar el comando de estadísticas. 📊');

        message.channel.send(mensaje);
      } else {
        const mensaje = `El usuario ${usuario} no existe en la base de datos.`;
        message.channel.send(mensaje);
      }
    } catch (error) {
      console.error('Error al obtener la información del usuario: ', error);
    }

    message.delete();
  }
};
