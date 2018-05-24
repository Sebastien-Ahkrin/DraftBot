const Discord = require('discord.js')

const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Ventredi", "Samedi"];
const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet Août", "Septembre", "Octobre", "Novembre", "Décembre"]

module.exports = ({ 
	message, args : [content]
}) => {

  if(!message.content.includes("§")){
    return message.reply(":no_entry_sign: | !say <title>**§**<content>**§**<link(optional)>");
  }
  const msg = content.split("§");
  if (msg.length !== 2 || msg.length !== 3) {
    return message.reply(":no_entry_sign: | !say <title>**§**<content>**§**<link(optional)>");
  }

  const date = message.createdAt;
  const embed = new Discord.RichEmbed()
  .setTitle(":newspaper: " + msg[0])
  .setColor(0xcd6e57)
  .setFooter("DraftMan | Développeur FrontEnd & Graphiste", "https://www.draftman.fr/images/favicon.png")
  .addField("[" + days[date.getDay()] + " " + date.getDate() + " " + months[date.getMonth()] + "]", msg[1], true);
  if (msg.length === 3) {
    embed.setURL(msg[2]);
  }
  message.channel.send({ embed });
  message.delete();
}
