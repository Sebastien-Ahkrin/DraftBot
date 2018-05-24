const Discord = require('discord.js')
const embeds = require('../../embeds')

module.exports = ({ 
	message
}) => {
  message.reply(embeds.infos)
}