const Discord = require('discord.js')
const config = require('../config.json')
const pkg = require('../package.json')

module.exports = { 
    async execute(client, interaction) {
        let buttonFoward = new Discord.MessageButton()
            .setStyle(2)
            .setEmoji('▶️')
            .setLabel('')
            .setCustomId('help_menu_fowards')
            .setDisabled(true)
        let buttonBackwards = new Discord.MessageButton()
            .setStyle(2)
            .setEmoji('◀️')
            .setLabel('')
            .setCustomId('help_menu_1')
        let row = new Discord.MessageActionRow()
            .addComponents(buttonBackwards, buttonFoward)
        const embed = new Discord.MessageEmbed()
            .setColor(config.colours.secondary)
            .setTimestamp()
            .setTitle("Found a bug? Have a feature request? Need help?")
            .setDescription(`${config.emoji.github} [GitHub](https://github.com/MCUniversity/guildbot)`)
            .setFooter(`Developed by ${pkg.author}>`)
        interaction.update({
            embeds: [embed],
            components: [row]
        });
    }
}