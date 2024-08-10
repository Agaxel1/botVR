const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "dueño",
  aliases: [],

  async execute(client, message, commandArgs) {
    // Verificar que el comando se usa en un canal de texto
    if (!message.guild) {
      message.channel.send('Este comando solo puede ser usado en un servidor.');
      return;
    }

    // Capturar los argumentos del comando
    const args = message.content.split(' ').slice(1);
    const mensajeUsuario = args.join(' ');

    if (!mensajeUsuario) {
      message.channel.send('Por favor, proporciona el mensaje de la solicitud/queja.');
      return;
    }

    // Obtener información del usuario que usó el comando
    const usuario = message.author;
    const usuarioTag = `${usuario.username}#${usuario.discriminator}`;
    const nombreEnServidor = message.member ? message.member.displayName : usuario.username;

    // Crear el embed con la información
    const embed = new MessageEmbed()
      .setColor('#ff0000')
      .setTitle('Solicitud/Queja')
      .addField('Usuario', usuarioTag, true)
      .addField('Nombre en el Servidor', nombreEnServidor, true)
      .setDescription(mensajeUsuario)
      .setTimestamp()
      .setFooter('Vida rol - La mejor calidad de rol.', 'https://i.postimg.cc/02qLcC28/Logo-Oficial-1.webp')
			.setThumbnail('https://i.postimg.cc/BZm1Rvf8/Vida-Rol-Large.png')
			.setColor("#00FFF5");

      const userIDs = ['773614753473363999', '719761300472856608', '653794458974027776']; 

    // Enviar el mensaje privado a cada usuario
    for (const id of userIDs) {
      try {
        const user = await client.users.fetch(id);
        if (user) {
          await user.send(embed);
        } else {
          console.error(`No se pudo encontrar al usuario con ID: ${id}`);
        }
      } catch (error) {
        console.error(`Error al enviar el mensaje al usuario con ID: ${id}`, error);
      }
    }

    // Confirmar al usuario que su solicitud/queja ha sido enviada
    message.channel.send('Tu solicitud/queja ha sido enviada a los dueños.');
      message.delete()
  }
};