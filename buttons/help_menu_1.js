const Discord = require('discord.js')
const fs = require('fs')
const config = require('../config.json')

module.exports = {
    async execute(client, interaction) {
        let buttonFoward = new Discord.MessageButton()
            .setStyle(2)
            .setEmoji(config.emoji.arrowRight)
            .setLabel('')
            .setCustomId('help_menu_2')
        let buttonBackwards = new Discord.MessageButton()
            .setStyle(2)
            .setEmoji(config.emoji.arrowLeft)
            .setLabel('')
            .setCustomId('help_menu_0')
        let row = new Discord.MessageActionRow()
            .addComponents(buttonBackwards, buttonFoward)
        const embed = new Discord.MessageEmbed()
            .setColor(config.colours.secondary)
            .setTimestamp()
            .setFooter({text: 'Developed by @emmaexe#0859'})
            .setTitle("Commands:")
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            if (command.help) {embed.addField(`**/${command.data.name}**`, `${command.data.description}`)}
        }
        interaction.update({
            embeds: [embed],
            components: [row]
        });
    }
}