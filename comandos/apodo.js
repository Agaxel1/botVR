const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "apodo",
  alias: [],

execute (client, message, args){

  if(!message.guild.me.hasPermission('MANAGE_NICKNAMES')) return message.channel.send("No tengo el permiso para gestionar apodos!")

  if(!message.member.hasPermission('MANAGE_NICKNAMES')) return message.channel.send("No tienes el permiso para gestionar apodos!")

  const persona = message.mentions.members.first()
  if(!persona) return message.channel.send("Debes mencionar a alguien!")

 const apodo = args.slice(1).join(" ")
 if(!apodo) return message.channel.send("Debes decir el nuevo apodo!")

 persona.setNickname(apodo)

 message.channel.send(`**${persona.user.tag}** ahora se llama **${apodo}**`)

message.delete() 
 }

}