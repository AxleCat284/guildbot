const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const Discord = require('discord.js')
const config = require('../config.json')
const db = require('../stormdb.js')
const functions = require('../functions.js')
module.exports = {
    help: false,
    permissions: [{
        id: config.roles.adminRole,
        type: 1,
        permission: true
    }],
    data: new SlashCommandBuilder()
        .setName('emit')
        .setDefaultPermission(false)
        .setDescription(`Emit an event.`)
        .addSubcommand(command => command
            .setName('force-apply')
            .setDescription('Force a guild membership application')
            .addUserOption(option =>
                option
                .setName('user')
                .setDescription('The targeted user (mc acc MUST be linked).')
                .setRequired(true)
            )
        ),
    async execute(client, interaction) {
        let discordUser = interaction.options.getUser('user')
        let inGameName;
        if (db.get(`accountLinks`).get(`${discordUser.id}`).value() == undefined) {
            inGameName = undefined;
        } else {
            inGameName = db.get(`accountLinks`).get(`${discordUser.id}`).get(`name`).value()
        }
        if (inGameName == undefined) {
            return interaction.reply({
                content: "**There was an error while executing this command!**\n*You must enter a discord user with a valid linked minecraft account (see the **/link** command)*",
                ephemeral: true
            })
        } else {
            let member = await interaction.guild.members.fetch(discordUser)
            const logembed = new Discord.MessageEmbed()
                .setColor(config.embedcolour.c)
                .setTimestamp()
                .setAuthor(member.user.tag)
                .setThumbnail(member.user.displayAvatarURL())
                .addField('**Forced application**', `**Administrator:** ${interaction.user.tag}\n**User:** ${member.user.tag}\n**User's IGN:** ${inGameName}`)
            channel = client.channels.cache.get(config.channels.appLogChannelId)
            channel.send({
                embeds: [logembed]
            })

            const queueembed = new Discord.MessageEmbed()
                .setColor(config.embedcolour.c)
                .setTimestamp()
                .addField(`**${inGameName}**`, `\`\`/g invite ${inGameName}\`\``)
            let deletebutton = new Discord.MessageButton()
                .setStyle(4)
                //.setEmoji('885607339854528593')
                .setLabel('Invite sent -> Delete from queue')
                .setCustomId('delete_message')
            let row = new Discord.MessageActionRow()
                .addComponents(deletebutton)
            queuechannel = client.channels.cache.get(config.channels.queueChannelId)
            queuechannel.send({
                embeds: [queueembed],
                components: [row]
            })
            member.roles.add(config.roles.guildMemberRole)
            functions.statistics.increaseGuildApplicationCount()
            let sucessembed = new Discord.MessageEmbed()
                .setColor(config.embedcolour.a)
                .setTimestamp()
                .addField('Your application was forcefully accepted.', 'Your application was accepted by an administrator. All requirement checks were bypassed.')
                .addField("<:log_emoji:868054485933625346> Warning:", "Make sure to leave your current guild if you are in one, or we will not be able to send you an invitation.\nMake sure your guild invites are turned **on** in your privacy settings. You can view the settings inside the profile menu (Right click your head in slot 2 of your hotbar) from any lobby on the hypixel network.")
            interaction.channel.send({
                embeds: [sucessembed],
                components: []
            });
            interaction.channel.send(`<@&${config.roles.helpers[0]}> <@&${config.roles.helpers[1]}>`)
            interaction.reply({content:"Success.", ephemeral:true})
        }


    },
};