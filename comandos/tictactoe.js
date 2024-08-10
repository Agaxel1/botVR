const TicTacToe = require('discord-tictactoe') //requerimos el tictactoe 
const Discord = require('discord.js'); //Definimos Discord 
const game = new TicTacToe({ language: 'es' }) //Definimos Game y el lenguaje del juego por sus iniciales.

module.exports = {
name: "tictactoe", 
alias: ["ttt"],

async execute (client, message, args) { //EL async es necesario, o por lo menos a mi, si no lo pongo me tira errom

game.handleMessage(message); //Empezamos el juego, por medio de un mensaje.
} 
}