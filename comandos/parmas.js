const { MessageEmbed } = require("discord.js");
const AsciiTable = require("ascii-table");

module.exports = {
  name: "parmas",
  alias: ["pweapons"],
  execute(client, message, args) {
    // Datos de las armas
    const weapons = [
      { nombre: "Katana", precio: 5 },
      { nombre: "Motosierra", precio: 50 },
      { nombre: "Granada de Gas", precio: 10 },
      { nombre: "Molotov", precio: 15 },
      { nombre: "Escopeta", precio: 20 },
      { nombre: "Franchi SPAS 12", precio: 75 },
      { nombre: "Mac-10", precio: 50 },
      { nombre: "HK MP5", precio: 50 },
      { nombre: "Colt M4", precio: 100 },
      { nombre: "M72", precio: 200 },
      { nombre: "US army m24 (Franco)", precio: 300 },
      { nombre: "RPG", precio: 900 },
      { nombre: "Lanza Misiles", precio: 900 },
      { nombre: "M134 Minigun", precio: 1000 },
      { nombre: "CAlibre 85 (RPG)", precio: 10 },
    ];

    // Crear la tabla ASCII
    const table = new AsciiTable("Lista de Armas");
    table.setHeading("Arma", "Precio (coins)");
    table.setBorder("|", "-", "+", "+");

    weapons.forEach((weapon) => {
      table.addRow(weapon.nombre, weapon.precio);
    });

    // Crear y enviar el mensaje con la tabla ASCII
    const embed = new MessageEmbed()
      .setTitle("Lista de Armas")
      .setDescription("```\n" + table.toString() + "```")
      .setColor("RANDOM");

    message.channel.send(embed);
    message.delete()
  },
};


