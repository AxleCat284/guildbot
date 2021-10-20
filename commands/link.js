const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')
const config = require('../config.json')
const https = require('https')
require('dotenv').config()
const db = require('../stormdb.js')

module.exports = {
    help: true,
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription(`Minecraft account linking system.`)
        .addSubcommand(subCommand => subCommand
            .setName('check')
            .setDescription('Check the status of someone\'s account link or your own.')
            .addUserOption(userOption => userOption
                .setName('user')
                .setDescription('Select the user.')
                .setRequired(true)
            )
        )
        .addSubcommand(subCommand => subCommand
            .setName('tutorial')
            .setDescription('Tutorial gif on how to link your minecraft account.')
        )
        .addSubcommand(subCommand => subCommand
            .setName('update')
            .setDescription('Update the link between your discord and minecraft accounts.')
            .addStringOption(stringOption => stringOption
                .setName('in-game-name')
                .setDescription('Your In-Game-Name.')
                .setRequired(true)
            )
        )

        ,
    async execute(client, interaction) {
        if (interaction.options.getSubcommand() == 'check') {
            let user = interaction.options.getUser('user')
            let userData;
            if (db.get(`accountLinks`).get(`${user.id}`).value() == undefined) {
                userData = undefined;
            } else {
                userData = db.get(`accountLinks`).get(`${user.id}`).get(`name`).value()
            }
            let embed = new Discord.MessageEmbed()
                .setColor(config.embedcolour.a)
                .setTimestamp()
                .setTitle(`${user.username}#${user.discriminator}`)
            if (userData == undefined) {
                embed.addField("This account is NOT linked!", `To link a minecraft account to a discord account, use the **/link update** command.`)
            } else {
                embed.addField("This account is linked!", `**Minecraft account:** ${userData}`)
            }
            interaction.reply({
                embeds: [embed],
                allowedMentions: {
                    repliedUser: false
                }
            })
        } else if (interaction.options.getSubcommand() == 'tutorial') {
            interaction.reply({
                files: [{
                    attachment: './discord_link_tutorial.gif',
                    name: 'tutorial.gif'
                }], allowedMentions: { repliedUser: false }
            })
        } else if (interaction.options.getSubcommand() == 'update') {
            let username = interaction.options.getString('in-game-name')
            const uuid_req = https.get(`https://api.mojang.com/users/profiles/minecraft/${username}`, (uuid_res) => {
                let uuid_data_raw = "";
                uuid_res.on('data', data_chunk => {
                    uuid_data_raw += data_chunk;
                })
                uuid_res.on('end', async () => {
                    let uuid_data = undefined;
                    try{uuid_data = JSON.parse(uuid_data_raw)}catch(err){}
                    if (uuid_data) {
                        const req = https.get(`https://api.hypixel.net/player?key=${process.env.APIKEY}&uuid=${uuid_data.id}`, (res) => {
                            let data_raw = "";
                            res.on('data', data_chunk => {
                                data_raw += data_chunk;
                            })
                            res.on('end', async () => {
                                data = JSON.parse(data_raw)
                                if (data.success == true) {
                                    let socialmediadata = undefined;
                                    try {
                                        socialmediadata = data.player.socialMedia.links.DISCORD
                                    } catch(err){}
                                    if (socialmediadata) {
                                        let discord = data.player.socialMedia.links.DISCORD
                                        if (discord == interaction.user.tag) {
                                            db.set(`accountLinks.${interaction.user.id}`, {
                                                name: uuid_data.name,
                                                uuid: uuid_data.id
                                            }).save();
                                            let logembed = new Discord.MessageEmbed()
                                                .setColor(config.embedcolour.b)
                                                .setTimestamp()
                                                .setTitle('<:log_emoji:868054485933625346> LOG')
                                                .addField(`**Account link successful.**`, `**Discord account tag:** ${interaction.user.tag}\n**Discord account ID:** ${interaction.user.id}\n**Minecraft account name:** ${uuid_data.name}\n**Minecraft account UUID:** ${uuid_data.id}\n`)
                                            let logchannel = client.channels.cache.get(config.channels.logChannelId)
                                            logchannel.send({
                                                embeds: [logembed]
                                            })
                                            let embed = new Discord.MessageEmbed()
                                                .setColor(config.embedcolour.a)
                                                .setTimestamp()
                                                .addField("Success.", `Successfully linked **${uuid_data.name}** to **<@${interaction.user.id}>**`)
                                            interaction.reply({embeds: [embed], allowedMentions: { repliedUser: false }})
                                        } else {
                                            let embed = new Discord.MessageEmbed()
                                                .setColor('RED')
                                                .setTimestamp()
                                                .setTitle('<:error_emoji:868054485946224680> An error has occurred.')
                                                .addField(`**This player\'s discord account does not match your discord account.**`, `**You need to set your discord account in the profile menu on Hypixel.**\nMake sure you entered your full discord tag (e.g. **Username#0001**).`)
                                            interaction.reply({embeds: [embed], allowedMentions: { repliedUser: false }})
                                            setTimeout(() => {interaction.deleteReply()}, 15000);
                                        }
                                    } else {
                                        //Throw error -> User has not set their DISCORD account in game
                                        let embed = new Discord.MessageEmbed()
                                                .setColor('RED')
                                                .setTimestamp()
                                                .setTitle('<:error_emoji:868054485946224680> An error has occurred.')
                                                .addField(`**This player\'s discord account does not match your discord account.**`, `**You need to set your discord account in the profile menu on Hypixel.**\nMake sure you entered your full discord tag (e.g. **Username#0001**).`)
                                        interaction.reply({embeds: [embed], allowedMentions: { repliedUser: false }})
                                        setTimeout(() => {interaction.deleteReply()}, 15000);
                                    }
                                } else {
                                    let embed = new Discord.MessageEmbed()
                                        .setColor('RED')
                                        .setTimestamp()
                                        .setTitle('<:error_emoji:868054485946224680> An error has occurred.')
                                        .addField(`**${data.cause}**`, `*This probably means the API key is invalid. Ping <@299265668522442752>.*`)
                                    interaction.reply({embeds: [embed], allowedMentions: { repliedUser: false }})
                                    setTimeout(() => {interaction.deleteReply()}, 15000);
                                    let logembed = new Discord.MessageEmbed()
                                        .setColor('RED')
                                        .setTimestamp()
                                        .setTitle('<:error_emoji:868054485946224680> ERROR')
                                        .addField(`**Cause: **`, `A player ran a bot command and the Hypixel API key provided by the config file was invalid.`)
                                    let logchannel = client.channels.cache.get(config.channels.logChannelId)
                                    logchannel.send({
                                        content: "<@299265668522442752> <@299265668522442752> <@299265668522442752>", 
                                        embeds: [logembed]
                                    })
                                }
    
                            })
                        }).on("error", (err) => {
                            console.error(err.message);
                        });
    
    
                    } else {
                        let embed = new Discord.MessageEmbed()
                            .setColor('RED')
                            .setTimestamp()
                            .setTitle('<:error_emoji:868054485946224680> An error has occurred.')
                            .addField(`**A Mojang API error occurred**`, `*This probably means the username you entered does not exist.*`)
                            try{embed.addField(`**Additional info available: ${uuid_data.error}**`, `**${uuid_data.errorMessage}**`)}catch(err){}
                        interaction.reply({embeds: [embed], allowedMentions: { repliedUser: false }})
                        setTimeout(() => {interaction.deleteReply()}, 15000);
                    }
                })
            }).on("error", (err) => {
                console.error(err.message);
            });
        }
    },
};