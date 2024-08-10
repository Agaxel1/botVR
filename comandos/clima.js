const Discord = require('discord.js');
const client = new Discord.Client();
const { Client, MessageEmbed } = require('discord.js');
const db = require('megadb');

const weather = require("weather-js");

    module.exports = {
    name: "clima",
    aliase: [],

async execute(client, message, args, color){
    weather.find({search: args.join(' '), degreeType: 'C'}, function(err, result) {
  
    if (args.length < 1) return message.channel.send("¡Debes ingresar una localización válida!")
                  
    var current = result[0].current;
    var location = result[0].location;
      
    const embed = new Discord.MessageEmbed()

    .setDescription("`" + current.skytext + "`")
    .setAuthor(`Estado climático en ${current.observationpoint}`)
    .setThumbnail(current.imageUrl)
    .setColor("RANDOM")
    .addField("Zona Horaria", `GMT${location.timezone}`, false)
    .addField("Temperatura", `${current.temperature} Grados ${location.degreetype}`, false)
    .addField("Viento", current.windspeed, false)
    .addField("Humedad", `${current.humidity}%`, false)
    .addField("Fecha", current.day + " " + current.date, false)
    .setTimestamp ()
    message.channel.send(embed)
    message.delete()
}
                 )
}
}
