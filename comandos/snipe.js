const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "snipe",
  alias: ["pls snipe"],

execute (client, message, args){

 const channel = message.mentions.channels.first() || message.channel;

 const msg = client.snipes.get(channel.id)

 if(!msg){
   message.channel.send("No se ha borrado ningún mensaje!")
 } else {
   const embed = new Discord.MessageEmbed()


   .setTitle("Snipe")
   .setAuthor(`Mensaje borrado de ${msg.delete.tag}`, msg.delete.displayAvatarURL())
   .addField("El mensaje se borro en el canal de", `<#${msg.canal.id}>`)
   .setDescription(msg.content)
   .setColor("0xFF0000")
   .setFooter("Consultado por: "+message.member.displayName, message.author.displayAvatarURL())

   message.channel.send(embed)
 }
message.delete() 
 }

}