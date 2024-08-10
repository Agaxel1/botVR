const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "clear",
  alias: ["purge"],

execute (client, message, args){

  const cantidad = args.join(" ");

 var perms = message.member.hasPermission("MANAGE_MESSAGES")
 if(!perms) return message.channel.send("Necesitas un permiso **Superior** al mio!")

  if(!cantidad) return message .channel.send("Debes escribir una cantidad del 1 al 100!")

if (cantidad === '0') return message.channel.send("Debes escribir un numero mayor a 0 y menor a 100!")

 message.delete()
 message.channel.bulkDelete(cantidad).then(()=> {
   message.channel.send(`**${cantidad}** mensajes borrados correctamente!`)
  })

 }

}
