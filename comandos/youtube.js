const ytsr = require("ytsr");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "youtube",
  alias: ["yt"],
  async execute(client, message, args) {
    const query = args.join(" ");
    if (!query) return message.channel.send("**Por favor escriba qué video buscar**");

    const res = await ytsr(query).catch((e) => {
      return message.channel.send("No se encontró ningún resultado");
    });

    const video = res.items.filter((i) => i.type === "video")[0];
    if (!video) return message.channel.send("No se encontraron resultados");

    const embed = new MessageEmbed()
      .setTitle(video.title)
      .setImage(video.bestThumbnail.url)
      .setColor("RANDOM")
      .setDescription(`**[Ver](${video.url})**`)
      .setAuthor(video.author.name)
      .addField("Visualizaciones", video.views.toLocaleString(), true)
      .addField("Duración", video.duration, true);
message.delete()
    return message.channel.send(embed);
    
  },
};
