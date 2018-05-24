const embeds = require('../../embeds')

module.exports = ({ message }) => {
  message.channel.send(embeds.help)
}
