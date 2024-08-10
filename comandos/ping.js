const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: "ping",
  alias: [],


async execute (client, message, args){

const embed = new Discord.MessageEmbed()

.setTitle("Escaneo de ping | Finalizado")
.setDescription(`:ballot_box_with_check: | Servidor funcionando correctamente\n\n :satellite: | Ping del bot: **${client.ws.ping}**`)
.setColor("RANDOM")
message.channel.send(':satellite: | Escaneando ping').then(msg => {

setTimeout(() => {
msg.edit(embed);
}, 3000);
})

}
}