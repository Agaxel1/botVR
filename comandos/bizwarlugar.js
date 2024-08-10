

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



function obtenerNegociosPromisesLugar(count, tableName, canalId) {
    const obtenerNegociosPromises = [];

    const idField = tableName === 'GasStations' ? 'ID' : 'Number';
    const selectFields = tableName === 'GlobalInfo' ? 'Lugar, Info' : 'Lugar';

    for (let i = 1; i <= count; i++) {
        if (tableName === 'GlobalInfo' && [3, 4, 6, 7, 8, 9].includes(i)) {
            // Excluir los números 3, 4, 6, 7, 8, y 9 para GlobalInfo
            continue;
        }
        obtenerNegociosPromises.push(new Promise((resolve, reject) => {
            const query = `SELECT ${selectFields} FROM ${tableName} WHERE ${idField} = ${i}`;
            connection.query(query, async (err, rows) => {
                if (err) {
                    console.log('Error al obtener la información del negocio:', err);
                    reject(err);
                } else if (rows.length > 0) {
                    const info = rows[0].Info || '';
                    const Lugar = rows[0].Lugar;

                    resolve({ index: i, info, Lugar });
                } else {
                    resolve(null);
                }
            });
        }));
    }

    return Promise.all(obtenerNegociosPromises);
}

const CHUNK_SIZE = 15;  // Número de negocios por página
async function obtenerMensajeYDescripcionLugar(horaActual, canalId, negocio) {
    let mensaje, descripcion, estadoNegocios;
    try {
        if (negocio === 1) {
            const count = await obtenerCountNegocios('GlobalInfo');
            const obtenerNegocios = await obtenerNegociosPromisesLugar(count, 'GlobalInfo', canalId);

            estadoNegocios = obtenerNegocios.map((negocio, index) => {
                const nombreNeg = negocio.info;
                const Lugar = negocio.Lugar;
                // Acortar el contenido de info si es mayor a 14 caracteres
                const infoAcortada = nombreNeg.length > 18 ? nombreNeg.substring(0, 18) : nombreNeg;

                return { index: index + 1, nombreNeg: infoAcortada, Lugar };
            });
            descripcion = `Se puede conquistar desde las 20:00 hasta las 22:00 horas.\n`;
            mensaje = 'Negocios generales';
        } else if (negocio === 2) {
            const count = await obtenerCountNegocios('Salon');
            const obtenerNegocios = await obtenerNegociosPromisesLugar(count, 'Salon', canalId);

            estadoNegocios = obtenerNegocios.map((negocio, index) => {
                const nombreNeg = `Concesionario`;
                const Lugar = negocio.Lugar;
                return { index: index + 1, nombreNeg, Lugar };
            });

            descripcion = `Se pueden conquistar desde las 18:00 hasta las 20:00 horas.\n`;
            mensaje = 'Concesionarios';
        } else if (negocio === 3) {
            const count = await obtenerCountNegocios('Shop24');
            const obtenerNegocios = await obtenerNegociosPromisesLugar(count, 'Shop24', canalId);

            estadoNegocios = obtenerNegocios.map((negocio, index) => {
                const nombreNeg = `24/7`;
                const Lugar = negocio.Lugar;
                return { index: index + 1, nombreNeg, Lugar };
            });

            descripcion = `Se puede conquistar desde las 16:00 hasta las 18:00 horas.\n`;
            mensaje = '24/7';
        } else if (negocio === 4) {
            const count = await obtenerCountNegocios('GasStations');
            const obtenerNegocios = await obtenerNegociosPromisesLugar(count, 'GasStations', canalId);

            estadoNegocios = obtenerNegocios.map((negocio, index) => {
                const nombreNeg = `Gasolinera`;
                const Lugar = negocio.Lugar;
                return { index: index + 1, nombreNeg, Lugar };
            });

            descripcion = `Se pueden conquistar desde las 14:00 hasta 16:00 horas.\n`;
            mensaje = 'Gasolineras';
        } else {
            mensaje = null;
            descripcion = null;
        }
        descripcion += `\nSon las ${horaActual.hours()}:${horaActual.minutes().toString().padStart(2, '0')} en el servidor.`;

        const chunks = [];
        // Añadimos una verificación para asegurarnos de que estadoNegocios está definido

        for (let i = 0; i < estadoNegocios.length; i += CHUNK_SIZE) {
            chunks.push(estadoNegocios.slice(i, i + CHUNK_SIZE));
        }

        return { mensaje, descripcion, chunks };
    } catch (error) {
        console.error('Error en obtenerMensajeYDescripcionLugar:', error);
        throw error;
    }
}




module.exports = {
    name: 'bizwarlugar',
    aliases: [''],

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
                    const { mensaje, descripcion, chunks } = await obtenerMensajeYDescripcionLugar(fechaActual, message.guild.id, negocio);

                    if (!mensaje || !descripcion || !chunks) {
                        mensaje = 'No hay información disponible';
                        descripcion = '';
                        chunks = [[]];
                    }

                    for (const chunk of chunks) {
                        const table = new AsciiTable()
                            .setHeading('#', 'Nombre', 'Lugar')
                            .setAlign(0, AsciiTable.CENTER)
                            .setAlign(1, AsciiTable.LEFT);

                        for (const negocio of chunk) {
                            table.addRow(negocio.index, negocio.nombreNeg, negocio.Lugar);
                        }

                        const tableString = '```' + table.toString() + '```';

                        const embed = new MessageEmbed()
                            .setTitle(mensaje)
                            .setColor('#0099ff')
                            .setDescription(`${descripcion}\n${tableString}`);

                        await message.channel.send(embed);
                    }
                } catch (error) {
                    console.error('Error en obtenerMensajeYDescripcionLugar:', error);
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