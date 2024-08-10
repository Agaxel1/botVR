const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database');
const AsciiTable = require('ascii-table');

// Función para ejecutar consultas a la base de datos
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

// Función para obtener el nombre del negocio según la tabla
function obtenerNombreNegocio(tabla) {
    switch (tabla) {
        case 'GasStations':
            return 'Gasolinera';
        case 'Shop24':
            return 'Tienda 24/7';
        case 'Salon':
            return 'Concesionaria';
        case 'GlobalInfo':
            return 'GlobalInfo';
        default:
            return 'Desconocido';
    }
}

// Función para obtener información de negocios
async function obtenerNegocios(usuarioID, tabla, nombreUsuario, userID, client, message) {
    let idField = 'Number'; // Por defecto, asume que el campo es 'Number'
    let Name = '';

    if (tabla === 'GlobalInfo') {
        Name = ',Info,PassiveEarnings';
    }
    if (tabla === 'GasStations') {
        idField = 'ID';
    }
    let impuestoRate = 1;

    switch (tabla) {
        case 'Shop24':
            impuestoRate = 1 / 274;
            break;
        case 'GasStations':
            impuestoRate = 1 / 315;
            break;
        case 'GlobalInfo':
            impuestoRate = 1 / 225;
            break;
        case 'Salon':
            impuestoRate = 1 / 385;
            break;
    }

    const query = `SELECT Money * ${impuestoRate} AS Impuesto, ${idField} AS NumeroNeg${Name} FROM ${tabla} WHERE Owner = ?`;
    const result = await executeQuery(query, [usuarioID]);

    const table = new AsciiTable(`Negocios de ${nombreUsuario}`);
    if (tabla === 'GlobalInfo') {
        table.setHeading('Numero', 'Negocio', 'Impuesto', 'Ganancias');
    } else {
        table.setHeading('Numero', 'Negocio', 'Impuesto');
    }
    result.forEach(neg => {
        let negocioName = obtenerNombreNegocio(tabla);
        if (tabla === 'GlobalInfo') {
            negocioName = neg.Info;
            Ganancia = neg.PassiveEarnings;
        }
        if (tabla === 'GlobalInfo') {
            table.addRow(neg.NumeroNeg, negocioName, `${Math.round(neg.Impuesto)} días`, `$${Ganancia}`);
        } else {
            table.addRow(neg.NumeroNeg, negocioName, `${Math.round(neg.Impuesto)} días`);
        }
    });

    if (result.length > 0) {
        const tableString = table.toString();
        const lines = tableString.split('\n');
        const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
        const topLine = '─'.repeat(maxLength);

        let remainingLines = lines;
        while (remainingLines.length > 0) {
            let messageLines = [];
            let messageLength = 0;

            while (remainingLines.length > 0 && messageLength + remainingLines[0].length < 2000) {
                messageLength += remainingLines[0].length;
                messageLines.push(remainingLines.shift());
            }

            const mensaje = new MessageEmbed()
                .setDescription(`\`\`\`${topLine}\n${messageLines.join('\n')}\n${topLine}\`\`\``)
                .setColor('#0099ff');

            const user = await client.users.fetch(userID);
            user.send(mensaje).catch(console.error);
        }
    }
}

// Función para obtener información de casas
async function obtenerCasas(usuarioID, nombreUsuario, userID, client, message) {
    const query = `SELECT Number, Money / 103 AS Impuesto, Prise FROM House WHERE Owner = ?`;
    const result = await executeQuery(query, [usuarioID]);

    const table = new AsciiTable(`Casas de ${nombreUsuario}`);
    table.setHeading('Numero', 'Impuestos', 'Precio');

    result.forEach(neg => {
        table.addRow(neg.Number, `${Math.round(neg.Impuesto)} días`, `$${neg.Prise}`);
    });

    if (result.length > 0) {
        const tableString = table.toString();
        const lines = tableString.split('\n');
        const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
        const topLine = '─'.repeat(maxLength);

        let remainingLines = lines;
        while (remainingLines.length > 0) {
            let messageLines = [];
            let messageLength = 0;

            while (remainingLines.length > 0 && messageLength + remainingLines[0].length < 2000) {
                messageLength += remainingLines[0].length;
                messageLines.push(remainingLines.shift());
            }

            const mensaje = new MessageEmbed()
                .setDescription(`\`\`\`${topLine}\n${messageLines.join('\n')}\n${topLine}\`\`\``)
                .setColor('#0099ff');

            const user = await client.users.fetch(userID);
            user.send(mensaje).catch(console.error);
        }
    }
}

// Función para obtener información de la multicuenta
async function obtenerInfoMC(mcID) {
    const query = 'SELECT ID, Name FROM PlayaRP WHERE ID = ?';
    const result = await executeQuery(query, [mcID]);
    return result[0];
}
// Declara una variable global para rastrear el estado del comando

module.exports = {
    name: "impuestos",
    aliases: [],

    async execute(client, message, args) {


        // Suponiendo que executeQuery es una función que ejecuta una consulta SQL y devuelve los resultados

        const userID = message.author.id; // ID del usuario que está intentando ejecutar el comando

        const sqlGetUserPermissions = "SELECT ID, Name, MC FROM PlayaRP WHERE Discord = ?";
        const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

        if (resultGetUserPermissions.length === 0) {
            // El usuario no existe en la base de datos
            message.channel.send('El usuario no tiene esta cuenta verificada.');
            return;
        }
        const IDMC = resultGetUserPermissions[0].MC;
        const mcData = await obtenerInfoMC(IDMC);
        const playaRPUserID = resultGetUserPermissions[0].ID;
        const nombreUsuario = resultGetUserPermissions[0].Name;
        const playaRPUserID2 = mcData ? mcData.ID : 0;
        const nombreUsuario2 = mcData ? mcData.Name : "N/A";

        ///////////////////////////////// Consulta para obtener los autos del usuario /////////////////////////////////
        const carQuery = 'SELECT Car.Model, Car.Money/73 AS Impuesto, car_table.carname, Car.Number AS NumeroAuto FROM Car LEFT JOIN car_table ON Car.Model = car_table.vehicleid WHERE Car.Owner = ?';
        const carResult = await executeQuery(carQuery, [playaRPUserID]);

        // Crear la tabla
        const table = new AsciiTable(`Autos de ${nombreUsuario}`);
        table.setHeading('#Auto', 'ID Modelo', 'Modelo', 'Impuesto');

        // Agregar cada auto a la tabla
        carResult.forEach(car => {
            const vehicleName = car.carname ? car.carname : 'Desconocido';
            table.addRow(car.NumeroAuto, car.Model, vehicleName, `${Math.round(car.Impuesto)} días`);
        });


        if (carResult.length > 0) {

            // Convertir la tabla a string y dividirla en líneas
            const tableString = table.toString();
            const lines = tableString.split('\n');
            const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
            const topLine = '─'.repeat(maxLength);

            let remainingLines = lines;
            while (remainingLines.length > 0) {
                let messageLines = [];
                let messageLength = 0;

                while (remainingLines.length > 0 && messageLength + remainingLines[0].length < 2000) {
                    messageLength += remainingLines[0].length;
                    messageLines.push(remainingLines.shift());
                }

                const mensaje = new MessageEmbed()
                    .setDescription(`\`\`\`${topLine}\n${messageLines.join('\n')}\n${topLine}\`\`\``)
                    .setColor('#0099ff');

                // Enviar el mensaje Embed al canal directo del usuario
                const user = await client.users.fetch(userID);
                user.send(mensaje).catch(console.error);
                message.channel.send(`Los impuestos de ${nombreUsuario} fueron enviados al privado.`);
            }
        } else {
            // Si no hay registros, puedes enviar un mensaje indicando que no hay datos
            message.channel.send('No tiene autos.');
        }

        /////////////////////////////// Consulta para obtener los negocios del usuario /////////////////////////////////
        // Dentro de la función execute, donde se llama a obtenerNegocios
        await obtenerNegocios(playaRPUserID, 'GasStations', nombreUsuario, userID, client, message);
        await obtenerNegocios(playaRPUserID, 'Shop24', nombreUsuario, userID, client, message);
        await obtenerNegocios(playaRPUserID, 'Salon', nombreUsuario, userID, client, message);
        await obtenerNegocios(playaRPUserID, 'GlobalInfo', nombreUsuario, userID, client, message);
        await obtenerCasas(playaRPUserID, nombreUsuario, userID, client, message);

        if (playaRPUserID2 !== 0) {
            ///////////////////////////////// Consulta para obtener los autos del usuario /////////////////////////////////
            const carQuery2 = 'SELECT Car.Model, Car.Money/73 AS Impuesto, car_table.carname, Car.Number AS NumeroAuto FROM Car LEFT JOIN car_table ON Car.Model = car_table.vehicleid WHERE Car.Owner = ?';
            const carResult2 = await executeQuery(carQuery2, [playaRPUserID2]);

            // Crear la tabla
            const table2 = new AsciiTable(`Autos de ${nombreUsuario2}`);
            table2.setHeading('#Auto', 'ID Modelo', 'Modelo', 'Impuesto');

            // Agregar cada auto a la tabla
            carResult2.forEach(car => {
                const vehicleName = car.carname ? car.carname : 'Desconocido';
                table2.addRow(car.NumeroAuto, car.Model, vehicleName, `${Math.round(car.Impuesto)} días`);
            });


            if (carResult2.length > 0) {

                // Convertir la tabla a string y dividirla en líneas
                const table2String = table2.toString();
                const lines = table2String.split('\n');
                const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);
                const topLine = '─'.repeat(maxLength);

                let remainingLines = lines;
                while (remainingLines.length > 0) {
                    let messageLines = [];
                    let messageLength = 0;

                    while (remainingLines.length > 0 && messageLength + remainingLines[0].length < 2000) {
                        messageLength += remainingLines[0].length;
                        messageLines.push(remainingLines.shift());
                    }

                    const mensaje = new MessageEmbed()
                        .setDescription(`\`\`\`${topLine}\n${messageLines.join('\n')}\n${topLine}\`\`\``)
                        .setColor('#0099ff');

                    // Enviar el mensaje Embed al canal directo del usuario
                    const user = await client.users.fetch(userID);
                    user.send(mensaje).catch(console.error);
                    message.channel.send(`Los impuestos de ${nombreUsuario2} fueron enviados al privado.`);
                }
            } else {
                // Si no hay registros, puedes enviar un mensaje indicando que no hay datos
                message.channel.send('No tiene autos.');
            }

            /////////////////////////////// Consulta para obtener los negocios del usuario /////////////////////////////////
            // Dentro de la función execute, donde se llama a obtenerNegocios
            await obtenerNegocios(playaRPUserID2, 'GasStations', nombreUsuario2, userID, client, message);
            await obtenerNegocios(playaRPUserID2, 'Shop24', nombreUsuario2, userID, client, message);
            await obtenerNegocios(playaRPUserID2, 'Salon', nombreUsuario2, userID, client, message);
            await obtenerNegocios(playaRPUserID2, 'GlobalInfo', nombreUsuario2, userID, client, message);
            await obtenerCasas(playaRPUserID2, nombreUsuario2, userID, client, message);
        }
        try {

        } catch (error) {
            console.error('Error al actualizar los impuestos:', error);
            message.channel.send('Ocurrió un error al actualizar los impuestos.');
        }


        // Eliminar el mensaje del comando
        message.delete();
    }
};
