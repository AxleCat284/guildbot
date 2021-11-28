const Discord = require('discord.js')
const {
    MessageButton,
    MessageActionRow
} = require('discord.js');
const db = require('../stormdb.js')

module.exports.run = async (client, button, config) => {
    let buttonFoward = new MessageButton()
        .setStyle(2)
        .setEmoji('▶️')
        .setLabel('')
        .setCustomId('help_menu_1')
    let buttonBackwards = new MessageButton()
        .setStyle(2)
        .setEmoji('◀️')
        .setLabel('')
        .setCustomId('help_menu_backwards')
        .setDisabled(true)
    let row = new MessageActionRow()
        .addComponents(buttonBackwards, buttonFoward)

    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);
    const embed = new Discord.MessageEmbed()
        .setColor(config.embedcolour.b)
        .setTimestamp()
        .setTitle(`**GuildBot v${config.version}**`)
        .addField("Uptime", `:clock2: ${days}d ${hours}h ${minutes}m ${seconds}s`, true)
        .addField("Servers", `:shield: ${client.guilds.cache.size}`, true)
        .addField("Channels", `:file_folder: ${client.channels.cache.size}`, true)
        .addField("Users", `:bust_in_silhouette: ${client.users.cache.size}`, true)
        .addField("Emoji", `<:KannaSip:889543061821063189> ${client.emojis.cache.size}`, true)
        .addField("Commands ran", `<:slash:913172347639435285> ${db.get(`stat`).get(`countCommands`).value()}`, true)
        .addField("Buttons pressed", `<:button:913172562001928193> ${db.get(`stat`).get(`countButtons`).value()}`, true)
        .addField("Select menu's used", `<:dropdown_select:914106174754947113> ${db.get(`stat`).get(`countSelectMenu`).value()}`, true)
        .addField("Guild Applications Submitted", `:pencil: ${db.get(`stat`).get(`countGuildApplications`).value()}`, true)
        .addField("Bot repository", `<:github:888155742719328276> [GitHub](https://github.com/MCUniversity/guildbot)`, true)
        .addField("Bot library", "[**Discord.js v13**](https://discord.js.org/#/docs/main/)", true)
        .addField("Created on", `${client.user.createdAt}`)
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter('Developed by @MCUniversity#0859')
    button.update({
        embeds: [embed],
        components: [row]
    });
}