const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "userinfo",
  alias: ["info"],

execute (client, message, args){

 let estados = {
   "online": "Conectado",
   "idle": "Ausente",
   "dnd": "No molestar",
   "offline":"Desconectado",
  };

 const member = message.mentions.members.first() || message.member;

 function formatDate (template, date){
 var tiempo = 'YYYY:MM:DD:HH:mm:ss'.split(':')
 date = new Date(date || Date.now() - new Date().getTimezoneOffset() * 6e4)
 return date.toISOString().split(/[-:.TZ]/).reduce(function (template,item, i) {

 }, template)
 }

 const embedinfo = new Discord.MessageEmbed()

 .setTitle("**Info del Usuario**")
 .setAuthor(message.member.displayName, message.author.displayAvatarURL())
 .setColor("0x7FFF00")
 .addField("**Nombre:**", `${member.user.tag}`)
 .addField("**ID:**", `${member.user.id}`)
 .addField("**Apodo del usuario:**", `${member.nickname !== null ? `${member.nickname}`: 'ninguno'}`)
 .addField(`**Roles:**`, member.roles.cache.map(roles => `\`${roles.name}\``).join(`, `))
 .addField("**Nitro:**", member.premiumSince ? 'Con Nitro' : 'Sin Nitro')
 .addField("Estado:", estados[member.user.presence.status])
 .setThumbnail(member.user.displayAvatarURL( {format: 'png', dynamic: 'true'} ))
 .setFooter("Consultado por: "+message.member.displayName, message.author.displayAvatarURL())
 .setTimestamp();

message.channel.send(embedinfo)
message.delete() 
 }

}