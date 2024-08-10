 const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');


module.exports = {
  name: "server", //Aquí ponemos el nombre del comando
  alias: ["serverinfo"], //Aquí un alias, esto será como un segundo nombre del comando, si no quieren ponerle alias tenéis que quitarle las " " y dejarlo así: alias: [],

execute (client, message, args){


    let user = message.mentions.members.first() || message.author

  

  const embed = new Discord.MessageEmbed()

  .setTitle("*Información*")
  .setThumbnail(message.guild.iconURL())
  .setAuthor(message.guild.name, message.guild.iconURL())
  .addField("**Id**", message.guild.id)
  .addField("**Día de creación**", message.guild.createdAt)
  .addField("**Región**", message.guild.region)
  .addField("**Dueño**", message.guild.owner)
  .addField("**Miembros**", message.guild.memberCount, true)
  .addField("**Bots**", message.guild.members.cache.filter(m => m.user.bot).size)
  .addField("**Emojis**", message.guild.emojis.cache.size)
  .addField("**Boosts**", message.guild.premiumSubscriptionCount.toString())
  .addField("**Nivel de verificación**", message.guild.verificationLevel)
  .addField("**Roles**", message.guild.roles.cache.size, true)

  message.channel.send(embed)


  


 }

} 
