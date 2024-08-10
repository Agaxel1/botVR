const { Client, MessageEmbed } = require('discord.js');

module.exports = {
  name: 'addroles',
  alias: ['addrolesall', 'addr'],
  description: 'Agrega dos roles a todos los miembros del servidor',
  
  async execute(client, message, args) {
    // Verifica si el usuario tiene permisos de administrador
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      return message.channel.send('¡No tienes permisos para usar este comando!');
    }

    const roleId1 = '1244213637158011031'; // Reemplaza con el ID del primer rol
    const roleId2 = '1244206977588924476'; // Reemplaza con el ID del segundo rol

    // Confirmación
    const confirmEmbed = new MessageEmbed()
      .setColor('#FF0000')
      .setTitle('⚠️ Confirmación necesaria')
      .setDescription('¿Estás seguro de que quieres agregar los roles a todos los miembros? Esta acción puede llevar tiempo.\n\nEscribe `confirmar` para proceder.');

    await message.channel.send(confirmEmbed);

    // Espera la confirmación del usuario
    const filter = response => response.author.id === message.author.id && response.content.toLowerCase() === 'confirmar';
    const collector = message.channel.createMessageCollector(filter, { time: 15000, max: 1 });

    collector.on('collect', async () => {
      try {
        const members = await message.guild.members.fetch();

        for (const member of members.values()) {
          if (!member.roles.cache.has(roleId1)) {
            await member.roles.add(roleId1);
          }

          if (!member.roles.cache.has(roleId2)) {
            await member.roles.add(roleId2);
          }
        }

        // Mensaje de confirmación
        const successEmbed = new MessageEmbed()
          .setColor('#00FF00')
          .setTitle('✅ Roles agregados')
          .setDescription('Los roles han sido agregados con éxito a todos los miembros.');
        await message.channel.send(successEmbed);
      } catch (error) {
        console.error('Error al agregar roles a los miembros:', error);
        const errorEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('❌ Error')
          .setDescription('Ocurrió un error al intentar agregar los roles.');
        await message.channel.send(errorEmbed);
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        const timeoutEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('⌛ Tiempo agotado')
          .setDescription('No se recibió confirmación. La acción de agregar roles ha sido cancelada.');
        message.channel.send(timeoutEmbed);
      }
    });
  },
};
