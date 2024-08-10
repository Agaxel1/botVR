const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "hackban",
  alias: ["hb"],

async execute (client, message, args){

   if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send(new Discord.MessageEmbed()
        .setTitle('**No tienes permiso para usar esto**') 
        .setColor('RANDOM'))//verificamos que tenga permisos para banear usuarios, si no los tiene retorna en este mensaje
let id = args.join(" ") //definimos args.join() con id
if (!id) return message.channel.send("Necesitas colocar la id.")//si no ah puesto la ID retorna 

let member = await client.users.fetch(id)
message.guild.members.ban(member.id) 
message.channel.send(new Discord.MessageEmbed()
        .setColor('PURPLE')
        .setTitle(`Usuario Baneado`)
        .addField('Usuario:', `${member.tag}`)
        .addField('ID del Usuario:', `${member.id}`)
        .addField('Moderador:', `${message.author.username}`)
        .addField('MOD ID:',`${message.author.id}`)
        .setTimestamp()
        .setFooter(`CreatedBy: ${message.author.username}`, `${message.author.displayAvatarURL({dynamic : true})}`))//y el embed confirmando que el usuario paso a mejor vida
}
}