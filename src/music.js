const config = require('./config.json');
const tool = require('./tool.js');
const ytdl = require('ytdl-core');
const Song = require('./plugin/Song.js');
const MusicPlayer = require('./plugin/MusicPlayer.js');
const rp = require('request-promise');

let guilds = {};

/*function processCommand(msg) {
    if (!msg.guild.available) return;

    //Add guild to the guild list.
    if (!guilds[msg.guild.id])
        guilds[msg.guild.id] = new MusicPlayer();
    let guild = guilds[msg.guild.id];

    let musicCmd = msg.content.split(/\s+/)[1];
    if (musicCmd)
        musicCmd.toLowerCase();
    switch (musicCmd) {
        case 'skip':
            return guild.skipSong(msg);
        case 'pause':
            return guild.pauseSong();
        case 'resume':
            return guild.resumeSong();
        case 'queue':
            return guild.printQueue(msg);
        case 'np':
            return guild.nowPlaying(msg);
        case 'vol':
            return guild.setVolume(msg);
        case 'purge':
            return guild.purgeQueue(msg);

        case 'join':
            return guild.joinVc(msg);
        case 'leave':
            return guild.leaveVc(msg);
        default:
            msg.channel.send(`Please refer to ${tool.wrap('~help music')}.`);
    }
}*/

const processYoutube = {
    song(msg, musicPlayer, url) {
        let url = url.match(/v=(\S+?)(&|\s|$|#)/)[1].subtring(2);
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&key=AIzaSyBCM5Co5w7FN2ghRkUZO4cQ9JgH0K57dpo&id=${url}`)
        .then(res=> res.json())
        .then(data => {
            const videos = data.items;
            const author  = msg.author.username + '#' + msg.author.discriminator;
            musicPlayer.queueSong(new Song(videos[i].snippet.title, "https://www.youtube.com/watch?v="+url, 'youtube', author, videos[i].snippet.thumbnails.default.url));
            msg.channel.send(":musical_note: | La piste `"+videos[i].snippet.title+"` viens d'être ajouté par `"+author+"`");
            if (musicPlayer.status != 'playing') musicPlayer.playSong(msg);
        });
    },
    playlist(msg, guild, playlistId) {
        Promise.all([getPlaylistName(), getPlaylistSongs([], null)])
            .then(results => addToQueue(results[0], results[1]))
            .catch(err => {
                console.log(err);
                msg.channel.send(":no_entry_sign: | Impossible d'ajouter la playlist a la file d'attente. Réessayez plus tard.")
            });

        async function getPlaylistName() {  
            let options = {
                url: `https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}&part=snippet&key=AIzaSyBCM5Co5w7FN2ghRkUZO4cQ9JgH0K57dpo`
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
                url: `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}${pageToken}&part=snippet,contentDetails&fields=nextPageToken,items(snippet(title,resourceId/videoId,thumbnails),contentDetails)&maxResults=50&key=AIzaSyBCM5Co5w7FN2ghRkUZO4cQ9JgH0K57dpo`
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
            const author  = msg.author.username + '#' + msg.author.discriminator;
            for (let i = 0; i < playlistItems.length; i++) {
                let song = new Song(
                    playlistItems[i].snippet.title,
                    `https://www.youtube.com/watch?v=${playlistItems[i].snippet.resourceId.videoId}`,
                    'youtube', author, "0:00", (playlistItems[i].snippet.thumbnails.medium.url || playlistItems[i].snippet.thumbnails.default.url));
                musicPlayer.queueSong(song, i + queueLength);
            }

            msg.channel.send(":musical_note: | `"+playlistItems.length+"` pistes de `"+playlistTitle+"` viens d'être ajouté par `"+author+"`");

            if (musicPlayer.status != 'playing') {
                musicPlayer.playSong(msg);
            }
        }
    },
}

/*
Timer for inactivity. Leave voice channel after inactivity timer expires.
*/
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



