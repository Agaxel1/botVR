const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "avatar",
  alias: ["foto"],

execute (client, message, args){

 let usuario = message.mentions.members.first() || message.member;

 let embedavatar =new Discord.MessageEmbed()

 .setTitle(`Avatar de: **${usuario.user.username}**`)
 .setColor(0x0700FF)
 .setImage(usuario.user.displayAvatarURL({ size: 1024, dynamic: true }))
 .setFooter("Consultado por: "+message.member.displayName, message.author.displayAvatarURL())
 .setTimestamp();

 message.channel.send(embedavatar)
message.delete() 
 }

} 