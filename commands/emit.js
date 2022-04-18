const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const Discord = require('discord.js')
const config = require('../config.json')
require('dotenv').config()
const mongo = require('mongodb')
const MongoClient = new mongo.MongoClient(process.env.MONGO_URL)
const functions = require('../functions.js')

let permissions = undefined
let setDef = true

if (config.permissions.emit != undefined) {
    permissions = config.permissions.emit
    setDef = false
}

module.exports = {
    help: false,
    permissions: permissions,
    data: new SlashCommandBuilder()
        .setName('emit')
        .setDefaultPermission(setDef)
        .setDescription(`Emit an event.`)
        .addSubcommand(command => command
            .setName('force-apply')
            .setDescription('Force a guild membership application')
            .addUserOption(option =>
                option
                .setName('target')
                .setDescription('The targeted user (mc acc MUST be linked).')
                .setRequired(true)
            )
        )
        .addSubcommand(command => command
            .setName('message')
            .setDescription('Make the bot send a message')
            .addStringOption(option =>
                option
                .setName('text')
                .setDescription('Type in the text that you want the bot to send.')
                .setRequired(true)
            )
        ),
    async execute(client, interaction) {
        if (interaction.options.getSubcommand() == 'force-apply') {
            let discordUser = interaction.options.getUser('target')
            await MongoClient.connect()
            const db = MongoClient.db()
            db.collection("minecraft-accounts").findOne({ discord_id: discordUser.id }, async function (err, res) {
                if (err) throw err;
                let inGameName;
                if (res == undefined) {
                    inGameName = undefined;
                } else {
                    inGameName = res.minecraft_name
                }
                if (inGameName == undefined) {
                    return interaction.reply({
                        content: "**There was an error while executing this command!**\n*You must enter a discord user with a valid linked minecraft account (see the **/link** command)*",
                        ephemeral: true
                    })
                } else {
                    let member = await interaction.guild.members.fetch(discordUser)
                    const logembed = new Discord.MessageEmbed()
                        .setColor(config.colours.secondary)
                        .setTimestamp()
                        .setAuthor(member.user.tag)
                        .setThumbnail(member.user.displayAvatarURL())
                        .addField('**Forced application**', `**Administrator:** ${interaction.user.tag}\n**User:** ${member.user.tag}\n**User's IGN:** ${inGameName}`)
                    channel = await client.channels.fetch(config.channels.appChannelId)
                    await channel.send({
                        embeds: [logembed]
                    })

                    const queueembed = new Discord.MessageEmbed()
                        .setColor(config.colours.secondary)
                        .setTimestamp()
                        .addField(`**${inGameName}**`, `\`\`/g invite ${inGameName}\`\``)
                    let deletebutton = new Discord.MessageButton()
                        .setStyle(4)
                        //.setEmoji('885607339854528593')
                        .setLabel('Invite sent -> Delete from queue')
                        .setCustomId('delete_message')
                    let row = new Discord.MessageActionRow()
                        .addComponents(deletebutton)
                    queuechannel = await client.channels.fetch(config.channels.queueChannelId)
                    await queuechannel.send({
                        embeds: [queueembed],
                        components: [row]
                    })
                    member.roles.add(config.roles.guildMemberRole)
                    functions.statistics.increaseGuildApplicationCount()
                    let sucessembed = new Discord.MessageEmbed()
                        .setColor(config.colours.main)
                        .setTimestamp()
                        .addField('Your application was forcefully accepted.', 'Your application was accepted by an administrator. All requirement checks were bypassed.')
                        .addField(`${config.emoji.log} Warning:`, "Make sure to leave your current guild if you are in one, or we will not be able to send you an invitation.\nMake sure your guild invites are turned **on** in your privacy settings. You can view the settings inside the profile menu (Right click your head in slot 2 of your hotbar) from any lobby on the hypixel network.")
                    await interaction.channel.send({
                        embeds: [sucessembed],
                        components: []
                    });
                    let helperPing=""
                    for (let i = 0;i<config.roles.helperRole.length;i++) {
                        helperPing+=`<@&${config.roles.helperRole[i]}>`
                    }
                    if (helperPing!="") {
                        await interaction.channel.send(helperPing)
                    }
                    await interaction.reply({
                        content: "Success.",
                        ephemeral: true
                    })
                }
                MongoClient.close()
            })
        } else if (interaction.options.getSubcommand() == 'message') {
            let text = interaction.options.getString('text').replaceAll('\\n', '\n')
            interaction.channel.send(text)
            interaction.reply({
                content: "Success.",
                ephemeral: true
            })
        }
    },
};