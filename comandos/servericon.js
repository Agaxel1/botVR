const Discord = require('discord.js'); 
const client = new Discord.Client(); 
const { Client, MessageEmbed } = require('discord.js');
module.exports = {
name: "servericon", 
alias: ["svi"],
execute (client, message, args) {

const servericon = new Discord.MessageEmbed()

.setImage (message.guild.iconURL({dynamic: true, size : 1024 }))

.setColor("RANDOM") 
.setFooter(`Logo solicitado por: ${message.member.displayName}`);
message.channel.send(servericon)

}
}