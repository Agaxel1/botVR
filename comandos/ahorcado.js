const  Death = require("death-games");
const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const db = require('megadb');
const disbut = require('discord-buttons');

module.exports = {
	name: 'ahorcado', //Aquí ponemos el nombre del comando
	alias: ['ahc'], //Aquí un alias, esto será como un segundo nombre del comando, si no quieren ponerle alias tenéis que quitarle las " " y dejarlo así: alias: [],

	async execute(client, message, args) {

let  author = [message.author.id]
let  menciones = message.mentions.users.map(x  =>  x.id);
let  jugadores = author.concat(menciones); //Un array donde el primer elemento es el autor del mensaje, los demás los usuarios mencionados

if(!menciones.length) return  message.channel.send("Tienes que mencionar mínimo a una persona!")
if(menciones.includes(message.author.id)) return message.channel.send("No te puedes mencionar a ti mismo!")
if(message.mentions.users.map(x => x.bot).some(x => x)) return message.channel.send("No puedes mencionar a un bot!")
//*Nota:* El elemento 0 del array jugadores es el que elige la frase!

  const  canal = await  message.author.createDM() //Puedes definir un canal a donde se le preguntará la palabra al usuario

canal.send("Elige tu palabra")

let  palabra;
await  canal.awaitMessages(m  =>  m.author.id == message.author.id && m.content.replace(/[^A-Za-z0-9ñ ]/g,"").length,
{max:  1, time:  20000, errors:["time"]}).then(collected  => {
palabra = collected.first().content.replace(/[^A-Za-z0-9ñ ]/g,"")
}).catch(() =>  canal.send("Tiempo agotado!"))
if(!palabra) return

const  ahorcado = new  Death.Hangman(palabra, {jugadores:  jugadores, lowerCase:  true, vidas: 7})

ahorcado.on("end", game  => {

if(game.winned){ //Si el juego ha terminado y se ha descubierto toda la frase

message.channel.send("El juego ha finalizado! La frase era: **"+game.palabra+"**\n"+
"Descubierto por: **"+client.users.cache.get(game.turno).tag+"**\n\n```"+game.ascii.join(" ")+"```")
return;

}else{ //Si ha terminado pero no han descubierto la frase

message.channel.send("Han perdido! La frase era: **"+game.palabra+"**\n"+
"Último error: **"+client.users.cache.get(game.turno).tag+"**\n\n```\n"+game.ascii.join(" ")+"```")

}

})

message.channel.send(message.author.toString()+" ha elegido su palabra!\n\n"+
"```\n"+ahorcado.game.ascii.join(" ")+"```**Empieza "+client.users.cache.get(ahorcado.game.turno).tag+"**")

const  colector = message.channel.createMessageCollector(msg  =>  msg.author.id == ahorcado.game.turno && /[A-Za-z0-9ñ]/.test(msg.content) && msg.content.length == 1);

colector.on('collect', msg  => {

let encontrado = ahorcado.find(msg.content) //Usamos el método find() para encontrar una letra en la frase, éste retorna true si se encuentra, false si no

if(ahorcado.game.ended){
colector.stop()
return;
}

if(!encontrado) message.channel.send("Vaya! Parece que la letra "+msg.content+" no se encontraba en la frase!\nLetras incorrectas: **["+ahorcado.game.letrasIncorrectas.join(", ")+"]**")

message.channel.send("```\n"+ahorcado.game.ascii.join(" ")+"\n```**Turno de "+client.users.cache.get(ahorcado.game.turno).tag+"**\nIntentos restantes: **"+ahorcado.game.vidas+"**")

})}
}
