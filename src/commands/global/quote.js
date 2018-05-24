const Discord = require('discord.js')

module.exports = ({
	message, args: [id]
}) => {
	search(message, id)
}

const search = async (message, id) => {
    const promises = message.guild.channels.array()
        .filter(({ type }) => type == "text")
        .map(channel => channel.fetchMessage(id))
        .map(promise => promise.catch(() => null))

    const messages = (await Promise.all(promises))
        .filter(message => message)
        .map(({ content, createdAt, author, channel }) => {
            const embed = new Discord.RichEmbed()
                .setAuthor(`${message.author.username} cite:`, message.author.displayAvatarURL)
                .setColor(0xcd6e57)
                .setDescription(content)
                .setTimestamp(createdAt)
                .setFooter(`${author.username} dans #${channel.name}`, author.displayAvatarURL)

            return embed
        })
        .map(embed => message.channel.send({ embed }))

    return Promise.all(messages)
}
