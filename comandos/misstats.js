const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const moment = require('moment-timezone');

// Objeto para rastrear el tiempo del último uso del comando por cada usuario
const cooldowns = new Map();

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
        const sql = 'SELECT COUNT(*) AS userCount FROM PlayaRP WHERE ID = ?';
        connection.query(sql, [usuario], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0].userCount > 0);
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

// Función para obtener la información de la multicuenta
function obtenerInfoMC(mcId) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT Name, PuntosDeRol,TimeDis, HorasJugadas, Level, Vip, Prison, tBan, tBanN, Crystal, Bank, Warn, MoneyVR, Online, DineroGastado, CoinsGastados, tBanR, Discord, TimerAntiDM, PKFaccion FROM PlayaRP WHERE ID = ?';

        connection.query(sql, [mcId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0]);
            }
        });
    });
}

module.exports = {
    name: "mistats",
    aliases: [],

    async execute(client, message, commandArgs) {
        // Verificar si el usuario está en cooldown
        if (cooldowns.has(message.author.id)) {
            const cooldownTime = 5000; // Tiempo en milisegundos (en este caso, 5 segundos)
            const expirationTime = cooldowns.get(message.author.id) + cooldownTime;

            if (Date.now() < expirationTime) {
                const timeLeft = (expirationTime - Date.now()) / 1000;
                message.author.send(`Debes esperar ${timeLeft.toFixed(1)} segundos antes de volver a usar este comando.`);
                message.delete();
                return;
            }
        }

        const userID = message.author.id; // ID del usuario que está intentando ejecutar el comando

        const sqlGetUserPermissions = "SELECT ID, Name FROM PlayaRP WHERE Discord = ?";
        const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

        if (resultGetUserPermissions.length === 0) {
            // El usuario no existe en la base de datos
            message.channel.send('El usuario no tiene esta cuenta verificada.');
            return;
        }

        // const playaRPUserID = resultGetUserPermissions[0].ID;
        const nombreUsuario = resultGetUserPermissions[0].Name;
        const IDUsuario = resultGetUserPermissions[0].ID;

        try {
            const usuarioExiste = await verificarUsuario(IDUsuario);

            if (usuarioExiste) {
                const result = await obtenerInfoUsuario(IDUsuario);
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

                const user = await client.users.fetch(userID);
                user.send(mensaje).catch(console.error);
                message.channel.send(`Los Stats de ${nombreUsuario} fueron enviados al privado.`);

                // Verificar si el usuario tiene una MC (multicuenta)
                if (result.mc) {
                    const mcData = await obtenerInfoMC(result.mc);
                    const mcLastConnection = moment(mcData.TimeDis * 1000).tz('America/Lima').add({ hours: 20, days: -1 }).format('YYYY-MM-DD HH:mm:ss');

                    const mensajeMC = new MessageEmbed()
                        .setTitle(`🌟 Información de MC: ${mcData.Name} 🌟`)
                        .addFields(
                            { name: '🆔', value: result.mc, inline: true },
                            { name: '🌟 Puntos de Rol', value: mcData.PuntosDeRol, inline: true },
                            { name: '⏰ Horas Jugadas', value: mcData.HorasJugadas, inline: true },
                            { name: '🎮 Nivel', value: mcData.Level, inline: true },
                            { name: '💎 Nivel VIP', value: mcData.Vip, inline: true },
                            { name: '⛓ Tiempo de Jail', value: `${Math.round(mcData.Prison / 60)} min`, inline: true },
                            { name: '🚫 Fecha Antidm', value: mcData.TimerAntiDM ? moment.unix(mcData.TimerAntiDM).tz('Chile/Continental').add(19, 'hours').format('YYYY-MM-DD HH:mm:ss') : 'N/A', inline: true },
                            { name: '⛔ Fecha de Baneo', value: mcData.tBan ? moment.unix(mcData.tBan).tz('Chile/Continental').add(19, 'hours').format('YYYY-MM-DD HH:mm:ss') : 'N/A', inline: true },
                            { name: '🔨 Baneado por', value: mcData.tBanN || 'N/A', inline: true },
                            { name: '💬 Razón de Baneo', value: mcData.tBanR || 'N/A', inline: true },
                            { name: '⚠ Advertencias', value: mcData.Warn, inline: true },
                            { name: '💰 Coins', value: mcData.Crystal, inline: true },
                            { name: '🏦 Dinero en banco', value: mcData.Bank, inline: true },
                            { name: '💵 Dinero en mano', value: mcData.MoneyVR, inline: true },
                            { name: '💸 Dinero Gastado', value: mcData.DineroGastado, inline: true },
                            { name: '💳 Coins Gastados', value: mcData.CoinsGastados, inline: true },
                            { name: '⚔ PK faccion', value: mcData.PKFaccion ? moment.unix(mcData.PKFaccion).tz('Chile/Continental').add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : 'N/A', inline: true },
                            { name: '📡 Discord', value: mcData.Discord !== null ? 'Verificado' : 'No está verificado', inline: true },
                            { name: mcData.Online === 1 ? '🟢 Usuario En Línea' : '⚪ Última Conexión', value: mcData.Online === 1 ? '✅' : mcLastConnection, inline: true }
                        )
                        .setColor('#6633FF')
                        .setFooter('Gracias por utilizar el comando de estadísticas. 📊');

                    user.send(mensajeMC).catch(console.error);
                }

                // Establecer el tiempo del último uso del comando para el usuario en cooldown
                cooldowns.set(message.author.id, Date.now());
            } else {
                const mensaje = `El usuario <${nombreUsuario}> no existe en la base de datos.`;
                message.channel.send(mensaje);
            }
        } catch (error) {
            console.error('Error al obtener la información del usuario: ', error);
        }

        message.delete();
    }
};
