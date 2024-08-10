const { Client, MessageEmbed } = require('discord.js');
const connection = require('./database'); // Asegúrate de importar correctamente tu módulo de conexión a la base de datos

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
    name: 'verificacion',
    alias: ['verificación'],

    async execute(client, message, args) {
        // ID del canal permitido para el comando
        const allowedChannelId = '1245548682393288734';
        const logChannelId = '1244345659465793546';

        // Verificar si el comando se ejecuta en el canal permitido
        if (message.channel.id !== allowedChannelId) {
            message.delete();
            return message.author.send('Este comando solo se puede usar en el canal designado.');
        }

        if (args.length < 3) {
            message.delete();
            return message.author.send('Por favor, proporciona los argumentos necesarios: `!verificacion Nombre_Apellido ID Codigo`');
        }

        const name = args[0];
        const id = args[1];
        const code = args[2];

        console.log(`Arguments received: Name=${name}, ID=${id}, Code=${code}`);

        // Verificar si el usuario ya está verificado
        const selectVerifiedSql = 'SELECT Discord FROM PlayaRP WHERE Discord = ?';
        try {
            const verifiedResults = await executeQuery(selectVerifiedSql, [message.author.id]);

            if (verifiedResults.length > 0) {
                message.delete();
                // El usuario ya está verificado
                return message.author.send('Ya estás verificado.');
            }
        } catch (error) {
            console.error('Error al verificar la verificación del usuario:', error);
            return message.author.send('Hubo un error al verificar tu estado de verificación. Por favor, inténtalo de nuevo más tarde.');
        }

        // Si el usuario no está verificado, continuar con el proceso de verificación
        const selectSql = 'SELECT * FROM PlayaRP WHERE Name = ? AND ID = ? AND Code = ?';
        try {
            const results = await executeQuery(selectSql, [name, id, code]);

            if (results.length > 0) {
                const role1 = message.guild.roles.cache.get('1244206977588924476');
                const role2 = message.guild.roles.cache.get('1244213637158011031');
                const role3 = message.guild.roles.cache.get('1244214044244705370');
                const member = message.guild.members.cache.get(message.author.id);

                if (role1 && role2 && role3 && member) {
                    await member.roles.add(role1);
                    await member.roles.add(role2);
                    await member.roles.add(role3);

                    // Cambiar el apodo del usuario
                    const newNickname = `${name} [${id}]`;
                    await member.setNickname(newNickname);

                    // Enviar mensaje directo al usuario
                    await message.author.send('Verificación exitosa. Se te ha otorgado el rol y se ha cambiado tu apodo.');

                    // Enviar mensaje de verificación al canal de registro y al privado del usuario
                    const logMessage = `Usuario verificado: ${message.author.tag}\nNombre: ${name}\nID: ${id}\nCódigo: ${code}`;
                    const logChannel = client.channels.cache.get(logChannelId);
                    if (logChannel) {
                        await logChannel.send(logMessage);
                    }
                    await message.author.send(logMessage);

                    // Actualizar la base de datos con el ID de Discord del usuario
                    const updateSql = 'UPDATE PlayaRP SET Discord = ? WHERE ID = ?';
                    try {
                        await executeQuery(updateSql, [message.author.id, id]);
                        console.log(`Successfully updated Discord ID for user ${message.author.id}`);
                    } catch (error) {
                        console.error('Error al ejecutar la consulta de actualización:', error);
                        await message.author.send('Hubo un error al actualizar tu información en la base de datos.');
                    }
                } else {
                    await message.author.send('Hubo un problema al otorgarte el rol. Por favor, contacta a un administrador.');
                }
            } else {
                await message.author.send('La información proporcionada es incorrecta. Por favor, verifica tus datos y vuelve a intentarlo.');
            }
        } catch (error) {
            console.error('Error al ejecutar la consulta:', error);
            await message.author.send('Hubo un error al verificar tu información. Por favor, inténtalo de nuevo más tarde.');
        }
        message.delete();
    }
};
