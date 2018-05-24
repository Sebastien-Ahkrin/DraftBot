const Discord = require('discord.js')
const rp = require('request-promise')
const fetch = require('node-fetch')
const is = require('@sindresorhus/is')
const config = require('../../../config/prod.json')

const Song = require('../../plugin/Song');
const MusicPlayer = require('../../plugin/MusicPlayer');

const emoji = ["1⃣","2⃣","3⃣","4⃣","5⃣"]
const emojiTxt = [":one:",":two:",":three:",":four:",":five:"]

let musics = new Map();
let guilds = {};
    
module.exports = ({ 
	message, args: [url]
}) => {
  if (!message.guild.available) return;

  if (!guilds[message.guild.id]) guilds[message.guild.id] = new MusicPlayer();

  let musicPlayer = guilds[message.guild.id];
  if(url !== null){
    url = message.content.split(/\s+/).slice(2).join(' ');
    if (url) {
      if (!url.startsWith('http')) {
        let keywords = encodeURIComponent(args.join(" ")).replace(/%20/g, "+");
        fetch(`https://www.googleapis.com/youtube/v3/search?order=viewCount&type=video&part=snippet&maxResults=5&key=${config.youtube_api}&q=${keywords}`)
        .then(res=> res.json())
        .then(data => {
          const videos = data.items;
          const author  = message.author.username + '#' + message.author.discriminator;
          let temp = new Map();
          let description = "Ajoutez une réaction à la musique de votre choix pour la lancer !\n";

          for(let i = 0; i < videos.length; i++){
            description += "\n"+emoji[i]+" | ["+videos[i].snippet.title+"](https://www.youtube.com/watch?v="+videos[i].id.videoId+")"
            temp.set(emojiTxt[i],videos[i].snippet.title+'§https://www.youtube.com/watch?v='+videos[i].id.videoId+"§"+author+"§"+videos[i].snippet.thumbnails.default.url);
            // title§url§author§image
          }

          const id = Math.floor(Math.random() * 3000 + 999)

          const embed = new Discord.RichEmbed()
          .setTitle("Liste des musiques disponibles ("+id+")")
          .setDescription(description)
          .setColor(0xcd6e57)

          musics.set(id,temp);

          message.reply({embed}).then(msg => {
            for(let j = 0; j < videos.length; j++){
              msg.react(emoji[j])
            }
          });
        });
      } else if (url.search('youtube.com')) {
        let playlist = url.match(/list=(\S+?)(&|\s|$|#)/);
        if (playlist) { //Playlist.
          Promise.all([getPlaylistName(), getPlaylistSongs([], null)])
          .then(results => addToQueue(results[0], results[1]))
          .catch(err => {
              console.log(err);
              message.channel.send(":no_entry_sign: | Impossible d'ajouter la playlist a la file d'attente. Réessayez plus tard.")
          });

          async function getPlaylistName() {  
              let options = {
                  url: `https://www.googleapis.com/youtube/v3/playlists?id=${playlist[1]}&part=snippet&key=${config.youtube_api}`
              }
              let body = await rp(options);
              let playlistTitle = JSON.parse(body).items[0].snippet.title;
              return playlistTitle;
          }
          async function getPlaylistSongs(playlistItems, pageToken) {
              pageToken = pageToken ?
                  `&pageToken=${pageToken}` :
                  '';

              let options = {
                  url: `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlist[1]}${pageToken}&part=snippet,contentDetails&fields=nextPageToken,items(snippet(title,resourceId/videoId,thumbnails),contentDetails)&maxResults=50&key=${config.youtube_api}`
              }

              let body = await rp(options);
              let playlist = JSON.parse(body);
              playlistItems = playlistItems.concat(playlist.items.filter(
                  item => item.snippet.title != 'Deleted video'));

              if (playlist.hasOwnProperty('nextPageToken')) { //More videos in playlist.
                  playlistItems = await getPlaylistSongs(playlistItems, playlist.nextPageToken);
              }

              return playlistItems;
          }
          async function addToQueue(playlistTitle, playlistItems) {
            let queueLength = musicPlayer.queue.length;
            const author  = message.author.username + '#' + message.author.discriminator;
            for (let i = 0; i < playlistItems.length; i++) {
                let song = new Song(
                    playlistItems[i].snippet.title,
                    `https://www.youtube.com/watch?v=${playlistItems[i].snippet.resourceId.videoId}`,
                    'youtube', author, "0:00", (playlistItems[i].snippet.thumbnails.medium.url || playlistItems[i].snippet.thumbnails.default.url));
                musicPlayer.queueSong(song, i + queueLength);
            }

            message.channel.send(":musical_note: | `"+playlistItems.length+"` pistes de `"+playlistTitle+"` viens d'être ajouté par `"+author+"`");

            if (musicPlayer.status != 'playing') {
                musicPlayer.playSong(message);
            }
          }
        } else if (url.search(/v=(\S+?)(&|\s|$|#)/)) { //Video.
          url = url.match(/v=(\S+?)(&|\s|$|#)/).subtring(2);
          fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&key=${config.youtube_api}&id=${url}`)
          .then(res=> res.json())
          .then(data => {
              const videos = data.items;
              const author  = message.author.username + '#' + message.author.discriminator;
              musicPlayer.queueSong(new Song(videos[i].snippet.title, "https://www.youtube.com/watch?v="+url, 'youtube', author, videos[i].snippet.thumbnails.default.url));
              message.channel.send(":musical_note: | La piste `"+videos[i].snippet.title+"` viens d'être ajouté par `"+author+"`");
              if (musicPlayer.status != 'playing') musicPlayer.playSong(message);
          });
        } else {
            message.channel.send(`:no_entry_sign: | Lien youtube invalide !`);
        }
      } else if (url.search('soundcloud.com')) { //Soundcloud.
          message.channel.send(":no_entry_sign: | Bientôt disponible !");
      } else {
          message.channel.send(":no_entry_sign: | Nous ne supportons uniquement Youtube pour l'instant");
      }
    }
  }else{
    message.channel.send(":no_entry_sign: | /play <url>|<recherche>");
  }
}
function timer() {
    for (let guildId in guilds) {
        let musicPlayer = guilds[guildId];
        if (musicPlayer.status == 'stopped' || musicPlayer.status == 'paused')
            musicPlayer.inactivityTimer -= 10;
        if (musicPlayer.inactivityTimer <= 0) {
            musicPlayer.voiceConnection.disconnect();
            musicPlayer.voiceConnection = null;
            musicPlayer.musicChannel.send(":musical_note: | J'ai quitté le salon par ce que je suis plus d'aucune utilité.");

            guild.changeStatus('offline');
        }
    }
}
setInterval(timer, 10000);