const { MessageEmbed } = require('discord.js');
const connection = require('./database');
async function executeQuery(query, params) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
module.exports = {
  name: 'lstaff',
  description: 'Lista de los miembros con sus roles del servidor.',
  async execute(client, message, args) {
    // Suponiendo que executeQuery es una función que ejecuta una consulta SQL y devuelve los resultados

    const userID = message.author.id; // ID del usuario que está intentando ejecutar el comando

    const sqlGetUserPermissions = "SELECT Admin FROM PlayaRP WHERE Discord = ?";
    const resultGetUserPermissions = await executeQuery(sqlGetUserPermissions, [userID]);

    if (resultGetUserPermissions.length === 0) {
      // El usuario no existe en la base de datos
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }

    const userPermissionLevel = resultGetUserPermissions[0].Admin;

    if (userPermissionLevel <= 6) {
      // El nivel de permiso del usuario no es mayor a 8
      message.channel.send('No tienes permiso para usar este comando.');
      return;
    }
    if (!message.guild) {
      return message.reply('Este comando solo puede ejecutarse en un servidor (guild).');
    }

    const excludedIDs = ['1126539503058821190', '1072720693181034607', '1121986703117271140', '992461967149252708', '1196864475492520049', '1195425558151045140'];

    const staffRoles = [
      { id: '929898747155054687', name: 'Dueños' },
      { id: '1244210022574198795', name: 'Bot oficial' },
      { id: '1244209403897577525', name: 'Encargados de Staff' },
      { id: '1244208061346873416', name: 'Control Faccionario' },
      { id: '1244210413529464936', name: 'Administradores' },
      { id: '1244210451471138837', name: 'Moderadores' },
      { id: '1244210506189901874', name: 'Ayudantes' },
      { id: '1244210536728625162', name: 'Asistentes' },
    ];

    const embed = new MessageEmbed()
      .setTitle('LISTA DE LOS STAFF ACTUALES')
      .setColor('#FF0000')
      .setFooter(`Última actualización: ${getCurrentDate()}`);

    const mentionedMembers = new Set();

    await Promise.all(
      staffRoles.map(async (staffRole) => {
        const role = message.guild.roles.cache.get(staffRole.id);
        if (role) {
          const membersWithRole = role.members.array();
          if (membersWithRole.length > 0) {
            const sortedMembers = membersWithRole
              .filter((member) => !mentionedMembers.has(member.id) && !excludedIDs.includes(member.id))
              .sort((a, b) => a.user.tag.localeCompare(b.user.tag))
              .map((member) => {
                mentionedMembers.add(member.id);
                return `• ${member}`;
              })
              .join('\n');

            if (sortedMembers) {
              embed.addField(`➢ ${staffRole.name}`, sortedMembers, false);
              embed.addField('\u200B', '\u200B');
            }
          }
        }
      })
    );

    embed.addField('Equipo administrativo', `Conteo: ${mentionedMembers.size}`, false)
.setFooter('Vida Rol - Compras', 'https://i.postimg.cc/pXHF5Mbp/Logo-Oficial-1.png')
              .setThumbnail('https://i.postimg.cc/BZm1Rvf8/Vida-Rol-Large.png');
    message.channel.send(embed);
  },
};

function getCurrentDate() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}


