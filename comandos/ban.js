const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "ban",
  alias: ["banear"],

execute (client, message, args){
  
const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
if(member == 823923578084130886) return message.reply("No puedo banearme.")

  if(!message.guild.me.hasPermission("BAN_MEMBERS")) return message.channel.send("No tengo suficientes permisos!")

  let user = message.mentions.members.first();

  let banReason = args.join(' ').slice(22);

  if(!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send("No tienes suficientes permisos!")

  if(!user) return message.channel.send("Debes mencionar a alguien!")

  if (message.member.roles.highest.comparePositionTo(user.roles.highest) <=0) return message.channel.send("No puedes banear a una persona de igual o mayor rango que tu!")

  if(user === message.author) return message.channel.send("No te puedes banear a ti mismo!")

  if(!banReason) return message.channel.send("Debes escribir una razon!")

  user.ban({ reason: banReason})

  message.channel.send(`El usuario **${user}** fue baneado por **${banReason}**\nModerador: **${message.author}**`)
message.delete() 
 }

}