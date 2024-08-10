/* 
** INDICACIONES **

• Tendrás que cambiar el ID_server la línea 66 según la facción

*/


const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const moment = require('moment-timezone');
const AsciiTable = require('ascii-table');

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

function obtenerCountNegocios(tableName) {
    const idField = tableName === 'GasStations' ? 'ID' : 'Number';

    return new Promise((resolve, reject) => {
        sqlQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
        connection.query(sqlQuery, (error, results) => {
            if (error) {
                reject(error);
            } else {
                const count = results[0].count;
                resolve(count);
            }
        });
    });
}
function obtenerNombreMafia(mafiaID, canalId) {
    return new Promise((resolve, reject) => {
        const queryMafia = `SELECT Name FROM LeaderInfo WHERE Leader = ?`;
        const queryParamsMafia = [mafiaID];

        connection.query(queryMafia, queryParamsMafia, (err, rows) => {
            if (err) {
                console.log('Error al obtener el nombre de la mafia:', err);
                reject(err);
            } else {
                let nombreMafia = 'Desconocido';

                const queryMensual = `SELECT ID_facc, ID_server FROM Mensual WHERE ID_server = ?`;
                const queryParamsMensual = [canalId];

                connection.query(queryMensual, queryParamsMensual, (err, mensualRows) => {
                    if (err) {
                        console.log('Error al obtener el ID_server de Mensual:', err);
                        reject(err);
                    } else {
                        if (rows.length > 0) {
                            nombreMafia = rows[0].Name;
                        }

                        resolve(nombreMafia);
                    }
                });
            }
        });
    });
}


function obtenerNegociosPromises(count, tableName, canalId) {
    const obtenerNegociosPromises = [];

    const idField = tableName === 'GasStations' ? 'ID' : 'Number';
    const selectFields = tableName === 'GlobalInfo' ? 'NoWar, Info' : 'NoWar';

    for (let i = 1; i <= count; i++) {
        obtenerNegociosPromises.push(new Promise((resolve, reject) => {
            const query = `SELECT Leader, ${selectFields} FROM ${tableName} WHERE ${idField} = ${i}`;

            connection.query(query, async (err, rows) => {
                if (err) {
                    console.log('Error al obtener el Nowar:', err);
                    reject(err);
                } else if (rows.length > 0) {
                    const nowarTimestamp = rows[0].NoWar;
                    const mafiaID = rows[0].Leader;

                    const formattedNoWarDate = moment.unix(nowarTimestamp).tz('Chile/Continental').add(7, 'hours');
                    const info = rows[0].Info || '';

                    let resultObject;

                    const nombreMafia = await obtenerNombreMafia(mafiaID, canalId);
                    resultObject = { fecha: formattedNoWarDate, info, mafia: nombreMafia };

                    resolve(resultObject);
                } else {
                    // No se encontraron filas para el valor de i
                    resolve(null); // O puedes rechazar la promesa según tus necesidades
                }
            });
        }));
    }

    return Promise.all(obtenerNegociosPromises);
}


const CHUNK_SIZE = 15;  // Número de negocios por página
async function obtenerMensajeYDescripcion(horaActual, canalId, negocio) {
    let mensaje, descripcion, estadoNegocios;
    try {
        if (negocio === 1) {
            const count = await obtenerCountNegocios('GlobalInfo');
            const obtenerNegocios = await obtenerNegociosPromises(count, 'GlobalInfo', canalId);

            estadoNegocios = obtenerNegocios.map((negocio, index) => {
                const nombreNeg = negocio.info;
                const fechaNeg = horaActual.isBefore(negocio.fecha)
                    ? negocio.fecha.format('YYYY-MM-DD HH:mm:ss')
                    : '¡Conquistalo!';
                const nombreMafia = negocio.mafia;

                // Acortar el contenido de info si es mayor a 14 caracteres
                const infoAcortada = nombreNeg.length > 14 ? nombreNeg.substring(0, 14) : nombreNeg;

                const MafiaAcortada = nombreMafia.length > 11 ? nombreMafia.substring(0, 11) : nombreMafia;

                return { index: index + 1, nombreNeg: infoAcortada, fechaNeg, nombreMafia: MafiaAcortada };
            });
            descripcion = `Se puede conquistar desde las 20:00 hasta las 22:00 horas.\n`;
            mensaje = 'Negocios generales';
        } else if (negocio === 2) {
            const count = await obtenerCountNegocios('Salon');
            const obtenerNegocios = await obtenerNegociosPromises(count, 'Salon', canalId);

            estadoNegocios = obtenerNegocios.map((negocio, index) => {
                const nombreNeg = `Conce`;
                const fechaNeg = horaActual.isBefore(negocio.fecha)
                    ? negocio.fecha.format('YYYY-MM-DD HH:mm:ss')
                    : '¡Conquistalo!';
                const nombreMafia = negocio.mafia;
                return { index: index + 1, nombreNeg, fechaNeg, nombreMafia };
            });

            descripcion = `Se pueden conquistar desde las 18:00 hasta las 20:00 horas.\n`;
            mensaje = 'Concesionarios';
        } else if (negocio === 3) {
            const count = await obtenerCountNegocios('Shop24');
            const obtenerNegocios = await obtenerNegociosPromises(count, 'Shop24', canalId);

            estadoNegocios = obtenerNegocios.map((negocio, index) => {
                const nombreNeg = `24/7`;
                const fechaNeg = horaActual.isBefore(negocio.fecha)
                    ? negocio.fecha.format('YYYY-MM-DD HH:mm:ss')
                    : '¡Conquistalo!';
                const nombreMafia = negocio.mafia;
                return { index: index + 1, nombreNeg, fechaNeg, nombreMafia };
            });

            descripcion = `Se puede conquistar desde las 16:00 hasta las 18:00 horas.\n`;
            mensaje = '24/7';
        } else if (negocio === 4) {
            const count = await obtenerCountNegocios('GasStations');
            const obtenerNegocios = await obtenerNegociosPromises(count, 'GasStations', canalId);

            estadoNegocios = obtenerNegocios.map((negocio, index) => {
                const nombreNeg = `Gasolinera`;
                const fechaNeg = horaActual.isBefore(negocio.fecha)
                    ? negocio.fecha.format('YYYY-MM-DD HH:mm:ss')
                    : '¡Conquistalo!';
                const nombreMafia = negocio.mafia;
                const MafiaAcortada = nombreMafia.length > 14 ? nombreMafia.substring(0, 14) : nombreMafia;
                return { index: index + 1, nombreNeg, fechaNeg, nombreMafia: MafiaAcortada };
            });

            descripcion = `Se pueden conquistar desde las 14:00 hasta 16:00 horas.\n`;
            mensaje = 'Gasolineras';
        } else {
            mensaje = null;
            descripcion = null;
        }
        descripcion += `\nSon las ${horaActual.hours()}:${horaActual.minutes().toString().padStart(2, '0')} en el servidor.`;

        const chunks = [];
        for (let i = 0; i < estadoNegocios.length; i += CHUNK_SIZE) {
            chunks.push(estadoNegocios.slice(i, i + CHUNK_SIZE));
        }
        return { mensaje, descripcion, chunks };
    } catch (error) {
        console.error('Error en obtenerMensajeYDescripcion:', error);
        throw error; // Re-lanzar el error para que sea capturado en el execute
    }
}




module.exports = {
    name: 'vbizwar',
    aliases: [],

    async execute(client, message, commandArgs) {

        // Obtener registros con ID_user igual a '8' de la tabla bot_admin
        const sqlGetServer = "SELECT ID_server FROM Mensual WHERE Comando = 1";
        const resultGetServer = await executeQuery(sqlGetServer);

        // Guardar los registros en la variable boss
        const server = resultGetServer.map((row) => row.ID_server);

        const servidoresPermitidos = server;
        // Obtener el nombre del servidor


        const serverID = message.guild.id;

        const servers = client.guilds.cache.get(serverID);
        const serverName = servers ? servers.name : 'Desconocido';

        // Verificar si el mensaje proviene de uno de los servidores permitidos
        if (!servidoresPermitidos.includes(message.guild.id)) {
            message.channel.send(`Se les acabó la mensualidad, ${serverName}, renueve y tiene todo devuelta.`);
            message.delete();
            return;
        }


        // Si el servidor es permitido, continuar con la verificación de usuarios permitidos
        // Solo si el ID del servidor es '1055804678857826304' o '929898747155054683'
        if (message.guild.id === '929898747155054683' || message.guild.id === '1055804678857826304') {
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
        }

        const args = message.content.split(' ');
        const negocio = parseInt(args[1]); // Convertir a número entero

        if (isNaN(negocio) || negocio < 1 || negocio > 4) {
            message.channel.send('El tipo de negocio debe ser un número entre 1 y 4.\n1.Negocios Generales\n2.Concesarionarios\n3.24/7\n4.Gasolineras');
            return;
        }
        try {
            const nowPromise = new Promise((resolve, reject) => {
                connection.query('SELECT fecha_ahora() AS fecha_actual', (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                });
            });

            nowPromise.then(async (rows) => {
                const fechaActual = moment(rows[0].fecha_actual);

                try {
                    const { mensaje, descripcion, chunks } = await obtenerMensajeYDescripcion(fechaActual, message.guild.id, negocio);

                    if (!mensaje || !descripcion || !chunks) {
                        // Si alguna propiedad está vacía, asignar valores por defecto
                        mensaje = 'No hay información disponible';
                        descripcion = '';
                        chunks = [[]];
                    }

                    for (const chunk of chunks) {
                        const table = new AsciiTable()
                            .setHeading('#', 'Nombre', 'Estado/Fecha', 'Mafia')
                            .setAlign(0, AsciiTable.CENTER)
                            .setAlign(1, AsciiTable.LEFT)
                            .setAlign(2, AsciiTable.RIGHT);

                        for (const negocio of chunk) {
                            table.addRow(negocio.index, negocio.nombreNeg, negocio.fechaNeg, negocio.nombreMafia);
                        }

                        const tableString = '```' + table.toString() + '```';

                        // Resto de tu código para crear y enviar el mensaje embed
                        const embed = new MessageEmbed()
                            .setTitle(mensaje)
                            .setColor('#0099ff')
                            .setDescription(`${descripcion}\n${tableString}`);

                        await message.channel.send(embed);
                    }
                } catch (error) {
                    console.error('Error en obtenerMensajeYDescripcion:', error);
                }
            }).catch((error) => {
                console.error('Error en nowPromise:', error);
            });
        } catch (error) {
            console.error('Error al obtener bizwar de negocios: ', error);
        }
        message.delete();
    }
};
