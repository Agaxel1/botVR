const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const AsciiTable = require('ascii-table');
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

async function obtenerHoraServer() {
    try {
        const sqlHoraServer = 'SELECT fecha_ahora() AS ServerTime';
        const resultHoraServer = await executeQuery(sqlHoraServer, []);

        if (resultHoraServer.length > 0) {
            const serverTime = resultHoraServer[0].ServerTime;
            const serverTimeFormatted = moment(serverTime)
                .format('HH:mm:ss');
            return serverTimeFormatted;
        } else {
            return 'No se pudo obtener la hora del servidor.';
        }
    } catch (error) {
        console.error('Error al obtener la hora del servidor: ', error);
        return 'Error al obtener la hora del servidor.';
    }
}

// Función para obtener el nombre de una facción por su ID
function obtenerNombreFaccion(idFaccion) {
    return new Promise((resolve, reject) => {
        const sqlFaccion = 'SELECT Name FROM LeaderInfo WHERE Leader = ?';
        connection.query(sqlFaccion, [idFaccion], (error, nombreFaccionResult) => {
            if (error) {
                reject(error);
            } else {
                resolve(nombreFaccionResult[0].Name);
            }
        });
    });
}

// Función para obtener información de los miembros de una facción en la base de datos
function obtenerInfoMiembrosFaccion(idFaccion) {
    return new Promise((resolve, reject) => {
        const sqlMiembros = 'SELECT ID, Name, Warn, Leader, TimeDis, Online, Rank,\`Group\`  FROM PlayaRP WHERE Member = ? ORDER BY Leader DESC';
        connection.query(sqlMiembros, [idFaccion], (error, miembrosResult) => {
            if (error) {
                reject(error);
            } else {
                resolve(miembrosResult);
            }
        });
    });
}
async function obtenerRolesPermitidos(idFaccion) {
    const sqlRoles = `SELECT rol1, rol2, rol3 FROM Mensual WHERE ID_facc = ${idFaccion}`;
    const resultRoles = await executeQuery(sqlRoles);
    return resultRoles[0];
}


// Agrega la variable numérica y asígnale el valor 10
const numero = 25;

module.exports = {
    name: `lmenu${numero}`,
    aliases: [],

    async execute(client, message, commandArgs) {
        // Obtener registros con ID_user igual a '8' de la tabla bot_admin
        const sqlGetServer = `SELECT ID_server, ID_facc FROM Mensual WHERE (ID_facc = ${numero} OR ID_facc > 99) AND Comando = 1`;
        const resultGetServer = await executeQuery(sqlGetServer);

        // Guardar los registros en la variable boss
        const server = resultGetServer.map(row => ({ ID_server: row.ID_server, ID_facc: row.ID_facc }));

        const servidoresPermitidos = server;

        const serverID = message.guild.id;

        const servers = client.guilds.cache.get(serverID);
        const serverName = servers ? servers.name : 'Desconocido';

        // Verificar si el mensaje proviene de uno de los servidores permitidos
        if (!servidoresPermitidos.some(row => row.ID_server === message.guild.id)) {
            message.channel.send(`Se les acabó la mensualidad, ${serverName}, renueve y tiene todo devuelta.`);
            message.delete();
            return;
        }

        // Obtener el ID_facc del autor del mensaje
        const authorFactionID = (resultGetServer.find(row => row.ID_server === message.guild.id) || {}).ID_facc;

        // Verificar si el autor tiene un ID_facc menor que 99
        const hasFactionBelow99 = authorFactionID !== undefined && authorFactionID < 99;

        // Si el autor tiene ID_facc < 99, verificar los roles
        if (hasFactionBelow99) {
            // Obtener los roles permitidos desde la base de datos
            const rolesPermitidos = await obtenerRolesPermitidos(authorFactionID);

            // Obtener los roles del autor del mensaje por ID
            const memberRoles = message.member.roles.cache.map(role => role.id);

            // Verificar si el autor tiene uno de los roles permitidos
            const hasAllowedRole = memberRoles.some(roleID => Object.values(rolesPermitidos).includes(roleID));

            if (!hasAllowedRole) {
                message.channel.send('No tienes los roles necesarios para usar este comando en esta facción.');
                message.delete();
                return;
            }
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

        try {

            // Obtener el nombre de la facción correspondiente al ID 20
            const nombreFaccion = await obtenerNombreFaccion(numero);

            // Verificar el número total de miembros de la facción
            const sqlFaccionTotal = 'SELECT COUNT(*) AS faccionTotal FROM PlayaRP WHERE Member = ?';
            const resultFaccionTotal = await executeQuery(sqlFaccionTotal, [numero]);

            // Almacenar el valor de faccionTotal en una variable
            const faccionTotal = resultFaccionTotal.length > 0 ? resultFaccionTotal[0].faccionTotal : 0;

            if (commandArgs[0] === 'invite' || commandArgs[0] === 'invitar') {
                // Verificar si se proporcionan los argumentos necesarios
                if (commandArgs.length < 2) {
                    message.channel.send(`Faltan argumentos para actualizar un registro.\nSe usa !${module.exports.name} invite Nombre_Apellido`);
                    return;
                }

                const usuario = commandArgs[1];

                // Verificar si el usuario tiene Member = 0
                const sqlCheckMember = `SELECT Member, Online, Warn, PuntosDeRol FROM PlayaRP WHERE Name = ?`;
                const resultCheckMember = await executeQuery(sqlCheckMember, [usuario]);

                if (resultCheckMember.length === 0) {
                    message.channel.send(`El usuario ${usuario} no existe en la base de datos.`);
                    return;
                }

                const puntosDeRol = resultCheckMember[0].PuntosDeRol;
                const warns = resultCheckMember[0].Warn;
                const memberStatus = resultCheckMember[0].Member;
                const onlineStatus = resultCheckMember[0].Online;

                if (puntosDeRol < 5) {
                    message.channel.send(`El usuario ${usuario} no tiene suficientes puntos de rol (actualmente ${puntosDeRol}). No puedes invitarlo.`);
                    return;
                }

                if (warns >= 3) {
                    message.channel.send(`El usuario ${usuario} tiene más de 3 warns. No puedes invitarlo.`);
                    return;
                }

                if (memberStatus !== 0) {
                    message.channel.send(`El usuario ${usuario} ya está en una facción. No puedes invitarlo.`);
                    return;
                }

                // Verificar si está Online
                if (onlineStatus === 1) {
                    message.channel.send(`El usuario ${usuario} se encuentra ONLINE. Debe salirse para aplicar los cambios.`);
                    return;
                }

                // Actualizar el registro en la base de datos
                const sqlUpdate = `UPDATE PlayaRP SET Member = ${numero}, \`Group\` = 0, Rank = 1, Rvol = 1 WHERE Name = ?`; // Usar `Group` en lugar de Group
                await executeQuery(sqlUpdate, [usuario]);


                message.channel.send(`Se ha metido a ${usuario} a la facción de ${nombreFaccion}.`);
                return;
            }

            if (commandArgs[0] === 'expulsar' || commandArgs[0] === 'demote') {
                // Verificar si se proporcionan los argumentos necesarios
                if (commandArgs.length < 2) {
                    message.channel.send(`Faltan argumentos para actualizar un registro.\nSe usa !${module.exports.name} expulsar/demote Nombre_Apellido`);
                    return;
                }

                const usuario = commandArgs[1];

                // Verificar si el usuario tiene Member = 20
                const sqlCheckMember = `SELECT Member, Online FROM PlayaRP WHERE Name = ?`;
                const resultCheckMember = await executeQuery(sqlCheckMember, [usuario]);

                if (resultCheckMember[0].Member !== numero) {
                    message.channel.send(`El usuario ${usuario} no está en la facción ${nombreFaccion}.`);
                    return;
                }
                //Verificar si está Online
                if (resultCheckMember[0].Online === 1) {
                    message.channel.send(`El usuario ${usuario} se encuentra ONLINE debe salirse para aplicar los cambios.`)
                    return;
                }

                // Actualizar el registro en la base de datos
                const sqlUpdate = `UPDATE PlayaRP SET Leader = 0, Member = 0, \`Group\` = 0, Rank = 0, Rvol = 0 WHERE Name = ?`; // Usar `Group` en lugar de Group
                await executeQuery(sqlUpdate, [usuario]);


                message.channel.send(`Se ha expulsado a ${usuario} de la facción ${nombreFaccion}.`);
                return;
            }
            if (commandArgs[0] === 'departamento') {
                // Verificar si se proporcionan los argumentos necesarios
                if (commandArgs.length < 3) {
                    message.channel.send(`Faltan argumentos para actualizar un registro.\nSe usa !${module.exports.name} departamento Nombre_Apellido Numero`);
                    return;
                }

                const usuario = commandArgs[1];
                const numeroDepartamento = parseInt(commandArgs[2]);


                // Verificar si el usuario tiene Member = 20
                const sqlCheckMember = `SELECT Member, Online FROM PlayaRP WHERE Name = ?`;
                const resultCheckMember = await executeQuery(sqlCheckMember, [usuario]);

                if (resultCheckMember[0].Member !== numero) {
                    message.channel.send(`El usuario ${usuario} no está en la facción ${nombreFaccion}.`);
                    return;
                }

                // Verificar si está Online
                if (resultCheckMember[0].Online === 1) {
                    message.channel.send(`El usuario ${usuario} se encuentra ONLINE, debe salirse para aplicar los cambios.`);
                    return;
                }

                // Verificar que el número del departamento sea válido (1-4)
                if (isNaN(numeroDepartamento) || numeroDepartamento < 1 || numeroDepartamento > 5) {
                    message.channel.send('Número de departamento inválido. Debe ser un número del 1 al 5.');
                    return;
                }

                // Obtener el nombre del departamento
                let nombreDepartamento;
                switch (numeroDepartamento) {
                    case 1:
                        nombreDepartamento = 'Fuerza Aerea';
                        break;
                    case 2:
                        nombreDepartamento = 'Marina de Guerra';
                        break;
                    case 3:
                        nombreDepartamento = 'Infantería';
                        break;
                    case 4:
                        nombreDepartamento = 'Área Médica';
                        break;
                    case 5:
                        nombreDepartamento = 'Área TIC';
                        break;
                    default:
                        nombreDepartamento = 'Desconocido';
                        break;
                }

                // Actualizar el registro en la base de datos
                const sqlUpdate = `UPDATE PlayaRP SET \`Group\` = ?, Rank = 1 WHERE Name = ?`;
                await executeQuery(sqlUpdate, [numeroDepartamento, usuario]);

                message.channel.send(`Se ha actualizado el departamento de ${usuario} a ${nombreDepartamento} en la facción ${nombreFaccion}.`);
                return;
            }

            if (commandArgs[0] === 'puesto') {
                // Verificar si se proporcionan los argumentos necesarios
                if (commandArgs.length < 3) {
                    message.channel.send(`Faltan argumentos para actualizar un registro.\nSe usa !${module.exports.name} puesto Nombre_Apellido Numero`);
                    return;
                }

                const usuario = commandArgs[1];
                const numeroPuesto = parseInt(commandArgs[2]);

                // Verificar si el usuario tiene Member = 20
                const sqlCheckMember = `SELECT Member, Online, \`Group\` FROM PlayaRP WHERE Name = ?`;
                const resultCheckMember = await executeQuery(sqlCheckMember, [usuario]);

                if (resultCheckMember.length === 0 || resultCheckMember[0].Member !== numero) {
                    message.channel.send(`El usuario ${usuario} no está en la facción ${nombreFaccion}.`);
                    return;
                }

                // Verificar si está Online
                if (resultCheckMember[0].Online === 1) {
                    message.channel.send(`El usuario ${usuario} se encuentra ONLINE, debe salirse para aplicar los cambios.`);
                    return;
                }

                // Verificar si el usuario está en un departamento (Group diferente de 0)
                if (resultCheckMember[0].Group === 0) {
                    message.channel.send(`${usuario} no está en un departamento, mételo a un departamento primero.`);
                    return;
                }

                // Verificar que el número del puesto sea válido (1-9)
                if (isNaN(numeroPuesto) || numeroPuesto < 1 || numeroPuesto > 9) {
                    message.channel.send('Número de puesto inválido. Debe ser un número del 1 al 9.');
                    return;
                }

                // Obtener el nombre del puesto
                let nombrePuesto;
                switch (numeroPuesto) {
                    case 1:
                        nombrePuesto = 'Soldado';
                        break;
                    case 2:
                        nombrePuesto = 'Cabo';
                        break;
                    case 3:
                        nombrePuesto = 'Sargento';
                        break;
                    case 4:
                        nombrePuesto = 'Subteniente';
                        break;
                    case 5:
                        nombrePuesto = 'Teniente';
                        break;
                    case 6:
                        nombrePuesto = 'Capitán';
                        break;
                    case 7:
                        nombrePuesto = 'Mayor';
                        break;
                    case 8:
                        nombrePuesto = 'Teniente Coronel';
                        break;
                    case 9:
                        nombrePuesto = 'Coronel';
                        break;
                    default:
                        nombrePuesto = 'Desconocido';
                        break;
                }

                // Actualizar el registro en la base de datos
                const sqlUpdate = `UPDATE PlayaRP SET Rank = ? WHERE Name = ?`;
                await executeQuery(sqlUpdate, [numeroPuesto, usuario]);

                message.channel.send(`Se ha actualizado el puesto de ${usuario} a ${nombrePuesto} en la facción ${nombreFaccion}.`);
                return;
            }

            if (commandArgs[0] === 'rangos') {
                try {
                    const miembros = await obtenerInfoMiembrosFaccion(numero);
                    const table = new AsciiTable(`Rangos de la facción ${nombreFaccion}`);
                    table.setHeading('Nombre', 'Puesto', 'Departamento');

                    for (let miembro of miembros) {
                        let nombre = miembro.Leader !== 0 ? `${miembro.Name} (LG)` : miembro.Name;

                        // Obtener el nombre del puesto según el rango
                        let nombrePuesto;
                        if (nombre.includes('(LG)')) {
                            nombrePuesto = 'Lider';
                        } else {
                            switch (miembro.Rank) {
                                case 1:
                                    nombrePuesto = 'Soldado';
                                    break;
                                case 2:
                                    nombrePuesto = 'Cabo';
                                    break;
                                case 3:
                                    nombrePuesto = 'Sargento';
                                    break;
                                case 4:
                                    nombrePuesto = 'Subteniente';
                                    break;
                                case 5:
                                    nombrePuesto = 'Teniente';
                                    break;
                                case 6:
                                    nombrePuesto = 'Capitán';
                                    break;
                                case 7:
                                    nombrePuesto = 'Mayor';
                                    break;
                                case 8:
                                    nombrePuesto = 'Teniente Coronel';
                                    break;
                                case 9:
                                    nombrePuesto = 'Coronel';
                                    break;
                                default:
                                    nombrePuesto = 'Desconocido';
                                    break;
                            }
                        }

                        // Obtener el nombre del departamento según el grupo
                        let nombreDepartamento;
                        if (nombre.includes('(LG)')) {
                            nombreDepartamento = 'Lider';
                        } else {
                            switch (miembro.Group) {
                                case 1:
                                    nombreDepartamento = 'Fuerza Aerea';
                                    break;
                                case 2:
                                    nombreDepartamento = 'Marina de Guerra';
                                    break;
                                case 3:
                                    nombreDepartamento = 'Infantería';
                                    break;
                                case 4:
                                    nombreDepartamento = 'Área Médica';
                                    break;
                                case 5:
                                    nombreDepartamento = 'Área TIC';
                                    break;
                                default:
                                    nombreDepartamento = 'Desconocido';
                                    break;
                            }
                        }

                        table.addRow(`${nombre}`, `${nombrePuesto}`, `${nombreDepartamento}`);
                    }

                    const tableString = table.toString();
                    const lines = tableString.split('\n');
                    const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
                    const topLine = '─'.repeat(maxLength);

                    const serverTime = await obtenerHoraServer();

                    const mensaje = new MessageEmbed()
                        .setDescription(`\`\`\`${topLine}\n${tableString}\n\nHora Server: ${serverTime}\`\`\``)
                        .setColor('#0099ff')
                        .setFooter('Consultado por: ' + message.member.displayName, message.author.displayAvatarURL());

                    message.channel.send(mensaje);
                } catch (error) {
                    console.error('Error al obtener la información de los miembros de la facción: ', error);
                }
                message.delete();
                return;
            }





            const miembros = await obtenerInfoMiembrosFaccion(numero);
            const table = new AsciiTable(`Miembros de la facción ${nombreFaccion}`);
            table.setHeading('Nombre', 'Ultima conexion');

            for (let miembro of miembros) {
                let nombre = miembro.Leader !== 0 ? `${miembro.Name} (LG)` : miembro.Name;
                let estado = miembro.Online === 1 ? 'En línea ✅' : moment(miembro.TimeDis * 1000)
                    .tz('America/Lima')
                    .add({ hours: 20, days: -1}).format('YYYY-MM-DD HH:mm:ss');
                table.addRow(`${nombre}`, estado);
            }


            const tableString = table.toString();
            const lines = tableString.split('\n');
            const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
            const topLine = '─'.repeat(maxLength);

            const serverTime = await obtenerHoraServer();

            const mensaje = new MessageEmbed()
                .setDescription(`\`\`\`${topLine}\n${tableString}\n\nTotal: ${faccionTotal}\n\nHora Server: ${serverTime}\`\`\``)
                .setColor('#0099ff')
                .setFooter('Consultado por: ' + message.member.displayName, message.author.displayAvatarURL());

            message.channel.send(mensaje);
        } catch (error) {
            console.error('Error al obtener la información de los miembros de la facción: ', error);
        }
        message.delete();
    }
};
