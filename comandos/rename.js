const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "rename",
  
  async execute(client, message, args) {
    // Verifica si el usuario tiene permisos de administrador
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      return message.reply("No tienes permisos suficientes para utilizar este comando.");
    }

    // Verifica si se proporcionó un argumento
    if (args.length < 1) {
      return message.reply("Debes proporcionar el nuevo nombre del canal.");
    }

    // Obtiene el canal actual
    const channel = message.channel;

    try {
      // Cambia el nombre del canal
      await channel.setName(args.join(" "));
      message.reply(`El nombre del canal ha sido cambiado a "${args.join(" ")}".`);

    } catch (error) {
      console.error(error);
      message.reply("Ocurrió un error al cambiar el nombre del canal.");
    }
    message.delete()
  }   
};
