const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');

function obtenerInfoTabla(tabla, leaderId) {
    return new Promise((resolve, reject) => {
        const sqlQuery = `SELECT * FROM ${tabla} WHERE Leader = ?`;

        connection.query(sqlQuery, [leaderId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
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
    name: "bizwar",
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

if (userPermissionLevel <= 6) {
  // El nivel de permiso del usuario no es mayor a 8
  message.channel.send('No tienes permiso para usar este comando.');
  return;
}
        // Obtener el ID del servidor en el que se ejecuta el comando
        const serverId = message.guild ? message.guild.id : null;

        // Verificar si el comando se está ejecutando en alguno de los dos servidores permitidos
        if (serverId !== '1055804678857826304' && serverId !== '929898747155054683') {
            message.channel.send('Este comando solo se puede ejecutar en los servidores específicos.');
            return;
        }

        // Definir leaderId dependiendo del servidor en el que se ejecuta el comando
        let leaderId;
        if (serverId === '1055804678857826304') {
            leaderId = 15;
        } else if (serverId === '929898747155054683') {
            leaderId = 19;
        } else {
            // Esto no debería ocurrir, pero por si acaso definimos un valor predeterminado
            leaderId = 0;
        }

        try {
            // Obtener nombre del líder desde la tabla LeaderInfo
            const sqlLeaderName = 'SELECT Name FROM LeaderInfo WHERE Leader = ?';
            const leaderNameResult = await executeQuery(sqlLeaderName, [leaderId]);
            const leaderName = leaderNameResult.length > 0 ? leaderNameResult[0].Name : 'N/A';

            // Obtener información de la tabla Shop24 para el líder especificado
            const shop24Info = await obtenerInfoTabla('Shop24', leaderId);
            // Obtener información de la tabla Salon para el líder especificado
            const salonInfo = await obtenerInfoTabla('Salon', leaderId);
            // Obtener información de la tabla GlobalInfo para el líder especificado
            const globalInfo = await obtenerInfoTabla('GlobalInfo', leaderId);
            // Obtener información de la tabla GasStations para el líder especificado
            const gasStationsInfo = await obtenerInfoTabla('GasStations', leaderId);

            // Verificar si hay información en cada tabla y crear un mensaje si es el caso
            const mensaje = new MessageEmbed().setTitle('Negocios extorsionados por ').addField('Facción', leaderName);

            if (shop24Info.length > 0) {
                const shop24Fields = shop24Info.map((row, index) => {
                    return {
                        name: `24/7 Registro ${index + 1}`,
                        value: `Extorsionado el Número: ${row.Number}`,
                    };
                });
                mensaje.addFields(shop24Fields);
            }

            if (salonInfo.length > 0) {
                const salonFields = salonInfo.map((row, index) => {
                    return {
                        name: `Concesionario Registro ${index + 1}`,
                        value: `Extorsionado el Número: ${row.Number}`,
                    };
                });
                mensaje.addFields(salonFields);
            }

            if (globalInfo.length > 0) {
                const globalInfoFields = globalInfo.map((row, index) => {
                    return {
                        name: `Negocios Generales Registro ${index + 1}`,
                        value: `Nombre: ${row.Info}\nNúmero: ${row.Number}`,
                    };
                });
                mensaje.addFields(globalInfoFields);
            }

            if (gasStationsInfo.length > 0) {
                const gasStationsFields = gasStationsInfo.map((row, index) => {
                    return {
                        name: `Gasolinera Registro ${index + 1}`,
                        value: `Extorsionado el Número: ${row.Number}`,
                    };
                });
                mensaje.addFields(gasStationsFields);
            }

            if (mensaje.fields.length === 0) {
                mensaje.setDescription('No se encontró información para el líder especificado.');
            }

            mensaje.setColor('#0099ff');
            message.channel.send(mensaje);
        } catch (error) {
            console.error('Error al obtener la información: ', error);
            message.channel.send('Hubo un error al obtener la información.');
        }
        message.delete();
    }
};