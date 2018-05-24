const moment = require('../../plugin/moment')
const request = require('request')
const Discord = require('discord.js')
const config = require('../../../config/prod.json')

moment.locale("FR_fr");

module.exports = ({ 
	message, args
}) => {

let user = args.join(" ")

var options = {
  method: "GET",
  url: `https://fortnite.y3n.co/v2/player/${user}`,
  headers: {
    'User-Agent': 'nodejs request',
    'X-Key': config.fortnite_key
  }
}

request(options, (error, response, body) => {
  if (!error && response.statusCode == 200) {
    var stats = JSON.parse(body);
    console.log(stats.br.stats.pc);

    const embed = new Discord.RichEmbed()
    .setAuthor(`Statistiques fortnite de ${stats.displayName}`,message.author.displayAvatarURL)
    .setDescription(`Voici les statistiques du joueur ${stats.displayName} sur le jeu [fortnite](https://www.epicgames.com/fortnite/fr/home).`)
    .setColor(0xcd6e57)
    .addField("Victoires Solo", stats.br.stats.pc.solo.wins, true)
    .addField("Victoires Duo", stats.br.stats.pc.duo.wins, true)
    .addField("Victoires Section", stats.br.stats.pc.squad.wins, true)
    .addField("Kills Solo", stats.br.stats.pc.solo.kills, true)
    .addField("Kills Duo", stats.br.stats.pc.duo.kills, true)
    .addField("Kills Section", stats.br.stats.pc.squad.kills, true)
    .addField("Morts Solo", stats.br.stats.pc.solo.deaths, true)
    .addField("Morts Duo", stats.br.stats.pc.duo.deaths, true)
    .addField("Morts Section", stats.br.stats.pc.squad.deaths, true)
    .addField("Dernière partie Solo",moment(stats.br.stats.pc.solo.lastMatch).fromNow(), true)
    .addField("Dernière partie Duo", moment(stats.br.stats.pc.duo.lastMatch).fromNow(), true)
    .addField("Dernière partie Section", moment(stats.br.stats.pc.squad.lastMatch).fromNow(), true)
    .setTimestamp(message.createdAt)
    .setFooter("DraftMan | Développeur FrontEnd & Graphiste", "https://www.draftman.fr/images/favicon.png")

    message.reply({embed})
  }else{
  	message.channel.send(`:no_entry_sign: | Le pseudo ${user} n'existe pas !`)
  }
})
}
