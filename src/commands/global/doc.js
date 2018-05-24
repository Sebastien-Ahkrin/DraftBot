const is = require('@sindresorhus/is')
const embeds = require('../../embeds')

const documentationLinks = new Map()
documentationLinks.set('NodeJS', new Map([
  ['assert', 'https://nodejs.org/api/assert.html'],
  ['buffer', 'https://nodejs.org/api/buffer.html'],
  ['addons', 'https://nodejs.org/api/addons.html'],
  ['async_hooks', 'https://nodejs.org/api/async_hooks.html'],
  ['n-api', 'https://nodejs.org/api/n-api.html'],
  ['child_process', 'https://nodejs.org/api/child_process.html'],
  ['cluster', 'https://nodejs.org/api/cluster.html'],
  ['cli', 'https://nodejs.org/api/cli.html'],
  ['console', 'https://nodejs.org/api/console.html'],
  ['crypto', 'https://nodejs.org/api/crypto.html'],
  ['debugger', 'https://nodejs.org/api/debugger.html'],
  ['deprecations', 'https://nodejs.org/api/deprecations.html'],
  ['dns', 'https://nodejs.org/api/dns.html'],
  ['esm', 'https://nodejs.org/api/esm.html'],
  ['errors', 'https://nodejs.org/api/errors.html'],
  ['events', 'https://nodejs.org/api/events.html'],
  ['fs', 'https://nodejs.org/api/fs.html'],
  ['globals', 'https://nodejs.org/api/globals.html'],
  ['http', 'https://nodejs.org/api/http.html'],
  ['http2', 'https://nodejs.org/api/http2.html'],
  ['https', 'https://nodejs.org/api/https.html'],
  ['inspector', 'https://nodejs.org/api/inspector.html'],
  ['intl', 'https://nodejs.org/api/intl.html'],
  ['modules', 'https://nodejs.org/api/modules.html'],
  ['net', 'https://nodejs.org/api/net.html'],
  ['os', 'https://nodejs.org/api/os.html'],
  ['path', 'https://nodejs.org/api/path.html'],
  ['perf_hooks', 'https://nodejs.org/api/perf_hooks.html'],
  ['process', 'https://nodejs.org/api/process.html'],
  ['querystring', 'https://nodejs.org/api/querystring.html'],
  ['readline', 'https://nodejs.org/api/readline.html'],
  ['repl', 'https://nodejs.org/api/repl.html'],
  ['stream', 'https://nodejs.org/api/stream.html'],
  ['string_decoder', 'https://nodejs.org/api/string_decoder.html'],
  ['timers', 'https://nodejs.org/api/timers.html'],
  ['tls', 'https://nodejs.org/api/tls.html'],
  ['tracing', 'https://nodejs.org/api/tracing.html'],
  ['tty', 'https://nodejs.org/api/tty.html'],
  ['dgram', 'https://nodejs.org/api/dgram.html'],
  ['url', 'https://nodejs.org/api/url.html'],
  ['util', 'https://nodejs.org/api/util.html'],
  ['vm', 'https://nodejs.org/api/vm.html'],
  ['zlib', 'https://nodejs.org/api/zlib.html'],
  ['event-loop', 'https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/'],
  ['guides', 'https://nodejs.org/en/docs/guides/']
]))

documentationLinks.set('JS', new Map([
  ['array', 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array'],
  ['map', 'https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Map']
]))

documentationLinks.set('Discord.Js', new Map([
  ['Attachment', 'https://discord.js.org/#/docs/main/stable/class/Attachment'],
  ['CategoryChannel', 'https://discord.js.org/#/docs/main/stable/class/CategoryChannel'],
  ['Channel', 'https://discord.js.org/#/docs/main/stable/class/Channel'],
  ['Client', 'https://discord.js.org/#/docs/main/stable/class/Client'],
  ['ClientUser', 'https://discord.js.org/#/docs/main/stable/class/ClientUser'],
  ['ClientUserChannelOverride', 'https://discord.js.org/#/docs/main/stable/class/ClientUserChannelOverride'],
  ['ClientUserGuildSettings', 'https://discord.js.org/#/docs/main/stable/class/ClientUserGuildSettings'],
  ['ClientUserSettings', 'https://discord.js.org/#/docs/main/stable/class/ClientUserSettings'],
  ['Collection', 'https://discord.js.org/#/docs/main/stable/class/Collection'],
  ['Collector', 'https://discord.js.org/#/docs/main/stable/class/Collector'],
  ['DiscordApiError', 'https://discord.js.org/#/docs/main/stable/class/DiscordAPIError'],
  ['DMChannel', 'https://discord.js.org/#/docs/main/stable/class/DMChannel'],
  ['Emoji', 'https://discord.js.org/#/docs/main/stable/class/Emoji'],
  ['Game', 'https://discord.js.org/#/docs/main/stable/class/Game'],
  ['GroupDMChannel', 'https://discord.js.org/#/docs/main/stable/class/GroupDMChannel'],
  ['Guild', 'https://discord.js.org/#/docs/main/stable/class/Guild'],
  ['GuildAuditLogs', 'https://discord.js.org/#/docs/main/stable/class/GuildAuditLogs'],
  ['GuildAuditLogsEntry', 'https://discord.js.org/#/docs/main/stable/class/GuildAuditLogsEntry'],
  ['GuildChannel', 'https://discord.js.org/#/docs/main/stable/class/GuildChannel'],
  ['GuildMember', 'https://discord.js.org/#/docs/main/stable/class/GuildMember'],
  ['Invite', 'https://discord.js.org/#/docs/main/stable/class/Invite'],
  ['Message', 'https://discord.js.org/#/docs/main/stable/class/Message']
]));

module.exports = ({
  message, args: [namespace, docName]
}) => {
  if (is(namespace) !== 'string') {
    return message.channel.send(`:no_entry_sign: | Le nom de la documentation est invalide!\nExemple: /doc \`${[...documentationLinks.keys()].join('\`, \`')}\``)
  }
  namespace = namespace.toLowerCase()

  const results = Array.from(documentationLinks.keys()).filter((key) => (
    key.toLowerCase() === namespace
  ))

  if (!(results.length >= 1)) {
    return message.channel.send(`:no_entry_sign: | La documentation ${namespace} n'existe pas. Les documentations existantes sont : \n\`${[...documentationLinks.keys()].join('\`, \`')}\``)
  }

  if (is(docName) !== 'string') {
    const base = [];
    for (let i = 0; i < [...documentationLinks.get(namespace).keys()].length; i++) {
      let name = [...documentationLinks.get(namespace).keys()][i];
      base.push(`[${name}](${documentationLinks.get(namespace).get(name)})`)
    };
    return message.channel.send(embeds.doc(docName,base));
  }
  docName = docName.toLowerCase()
  if (!documentationLinks.get(namespace).has(docName)) {
    return message.channel.send(`La documentation de ${namespace} ne possède pas de liens pour ${docName}.`)
  }
  return message.channel.send(`:no_entry_sign: | ERROR`)
}