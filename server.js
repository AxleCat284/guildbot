require('dotenv').config()
const logging = require('./consoleFormatting.js'); logging.log(); logging.warn(); logging.error(); logging.info(); //console.log('log'); console.warn('warn'); console.error('error'); console.info('info'); //For testing
const fs = require('fs');
const mongo = require('mongodb')
const MongoClient = new mongo.MongoClient(process.env.MONGO_URL)
const functions = require('./functions.js')
const https = require('https')
const schedule = require('node-schedule');

const Discord = require("discord.js")
const allIntents = new Discord.Intents(32767); const client = new Discord.Client({ intents: allIntents }); //Uses all intents. The bot runs in a single server so it does not matter.

const config = require('./config.json')

client.on('error', async (err) => {
    const channel = await client.channels.cache.get(config.channels.logChannelId)
    const embed = new Discord.MessageEmbed()
        .setTitle(`${config.emoji.error} A DiscordAPIError has occurred.`)
        .addField('**Cause: **', `\`\`${err.message}\`\``)
    channel.send({embeds:[embed]})
})

//client.on('debug', async (debug) => {console.info(debug)}) //Uncomment for debugging.

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await MongoClient.connect();
    const db = MongoClient.db();
    db.collection('starboard').findOne({}, async function (err, res) {
        if (err) throw err;
        if (res != undefined) {
            db.collection('starboard').drop().then(() => MongoClient.close())
        }
    })
    if (client.user.id == "886676473019269160") {
        console.log(`Test user detected, setting presence to OFFLINE.`)
        client.user.setPresence({ status: 'invisible' })
    } else {
        guild = await client.guilds.fetch(config.discordGuildId)
        client.user.setActivity(`over ${guild.name}`, {type: "WATCHING"})
    }
    client.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {const command = require(`./commands/${file}`); client.commands.set(command.data.name, command);}
    const deployCommands = require(`./slashCommands.js`);
    deployCommands.deploy(client, client.user.id, config.discordGuildId)
    functions.checkForUpdates(client)
    functions.leaderboardDataUpdate(client)
})

client.on('interactionCreate', async (interaction) => {
	if (interaction.isButton()) {
        functions.statistics.increaseButtonCount()
        try {
            let interactionFile = require(`./buttons/${interaction.customId}.js`);
            interactionFile.execute(client, interaction)
        } catch (err) {
            return console.error(err);
        }
    } else if (interaction.isSelectMenu()) {
        functions.statistics.increaseSelectMenuCount()
        try {
            let interactionFile = require(`./menu/${interaction.customId}.js`);
            interactionFile.execute(client, interaction)
        } catch (err) {
            return console.error(err);
        }
    } else if (interaction.isCommand()) {
        functions.statistics.increaseCommandCount()
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        let now = Date.now()
        const qfilter = {
            guildid: interaction.guild.id,
            command: interaction.commandName
        }
        if (command.cooldown) {
            await MongoClient.connect()
            const db = MongoClient.db()
            await db.collection('cooldown').findOne(qfilter, async function (err, res) {
                if (err) throw err;
                let nextAvailable;
                if (res != null) {
                    nextAvailable = res.value;
                }
                if (nextAvailable == undefined) nextAvailable = 0;
                if (nextAvailable - now > 0) {
                    await interaction.reply({
                        content: `**Command on cooldown! Please wait *${(nextAvailable-now)/1000}* more seconds.**`,
                        ephemeral: true
                    });
                } else {
                    try {
                        await command.execute(client, interaction);
                        const db = MongoClient.db()
                        db.collection('cooldown').findOne(qfilter, async function (err, res) {
                            if (err) throw err;
                            if (res == null) {
                                db.collection('cooldown').insertOne({
                                    guildid: interaction.guild.id,
                                    command: interaction.commandName,
                                    value: now + command.cooldown
                                }, function (err, res) {
                                    if (err) throw err;
                                    MongoClient.close()
                                    return;
                                })
                            } else {
                                await db.collection('cooldown').updateOne(qfilter, {
                                    $set: {
                                        value: now + command.cooldown
                                    }
                                })
                                MongoClient.close()
                                return;
                            }
                        })        
                    } catch (error) {
                        console.error(error);
                        return interaction.reply({
                            content: '**There was an error while executing this command!**\n*No more info is available.*',
                            ephemeral: true
                        });
                    }
                }
            })
        } else {
            try {
                await command.execute(client, interaction);
            } catch (error) {
                console.error(error);
                return interaction.reply({
                    content: '**There was an error while executing this command!**\n*No more info is available.*',
                    ephemeral: true
                });
            }
        }
    }
});

client.on('guildMemberAdd', async (member) => {
    if (member.guild.id == config.discordGuildId) {
        let num = member.guild.memberCount;
        member.guild.channels.cache.get(config.channels.memberCount.discord).setName(`📊Members: ${num}📊`);
    }
});

client.on('guildMemberRemove', async (member) => {
    if (member.guild.id == config.discordGuildId) {
        let num = member.guild.memberCount;
        member.guild.channels.cache.get(config.channels.memberCount.discord).setName(`📊Members: ${num}📊`);
    }
});

client.on('messageCreate', async (message) => {
    if (message.guild.id != config.discordGuildId) return;
    if (message.channel.type == 'GUILD_TEXT' && message.channel.name.startsWith('ticket-') && !message.author.bot) {
        await MongoClient.connect()
        let db = MongoClient.db()
        db.collection('tickets').findOne({ sid: 'ticket_introduction_message', discord_id: message.author.id }, async function(err, res){
            if (err) throw err;
            if (res == undefined) {
                await db.collection('tickets').insertOne({ sid: 'ticket_introduction_message', discord_id: message.author.id })
                const embed = new Discord.MessageEmbed()
                    .setTitle(`**Hello ${message.author.tag}, welcome to ${message.guild.name}!**`)
                    .setDescription(`I see it is your first time opening a ticket here. If you are here to apply for guild membership, **please do not bother the staff unless you have a problem**.\nThis process is completely automated and handled by me.\nIf you wish to apply you must do the following:\n\`\`\`• Log on to the hypixel network and set your discord account in the social menu (/link tutorial for more information on how to do that.)\n• Use the /link update command so I can confirm you are the owner of that minecraft account. (Make sure you use my /link command not the commands of other bots)\n• Use the /apply command to submit your application. \n\`\`\`If your application is accepted, you will be placed in an invite queue, and **a member of the staff team will invite you when they are online**.`)
                    .setFooter(`You are seeing this message because it is your first time opening a ticket. This message will not be repeated.`)
                    .setTimestamp()
                await message.reply({
                    embeds: [embed],
                    ephemeral: true
                }).then(async () => {
                    await MongoClient.close()
                })
            }
        })
    }
})

client.on('channelCreate', async (channel) => {
    if (channel.type == 'GUILD_TEXT' && channel.name.startsWith('ticket-')) {
        setTimeout(() => {
            channel.setParent(config.channels.ticketCategoryId, { lockPermissions: false })
            let embed = new Discord.MessageEmbed()
                .setColor(config.colours.main)
                .setTitle('**A staff member will be here to help you soon.**')
                .setTimestamp()
            let nomembershipembed = new Discord.MessageEmbed()
                .setColor(config.colours.main)
                .setTitle('**A staff member will be here to help you soon.**')
                .setDescription(`**Looking to join the guild?**\n[Guild forums post](${config.url.forums_post})\n*To apply, run the **/apply** command in a ticket.*\n**Applied and accepted?**\nAn invite will be sent to you when a staff member is online.\n**You aren\'t online?**\nAn offline invite will be sent. This means the next time you next log in, you will have 5 minutes to join the guild before the invite expires.`)
                .setTimestamp()
            let linkingEmbed = new Discord.MessageEmbed()
                .setColor(config.colours.main)
                .setTitle('**Before applying, please link your account!**')
                .setDescription('If you are here to apply for guild membership:\nBefore you may apply, you must link your minecraft account to your discord account. Press the button to learn more.')
                .setTimestamp()
            let linkHelpButton = new Discord.MessageButton()
                .setStyle(1)
                .setEmoji('ℹ️')
                .setLabel('Learn more.')
                .setCustomId('link_help_button')
            let row = new Discord.MessageActionRow()
                .addComponents(linkHelpButton)
            channel.messages.fetch().then(async messages => {
                let id = await messages.find(m => /\<\@[0123456789]*\>/.test(m.content)).content.replace(/[^0123456789]/g, '')
                let member = await channel.guild.members.fetch(id)
                if (member) {
                    if (member.roles.cache.has(config.roles.guildMemberRole)) {
                        channel.send({embeds: [embed]})
                    } else {
                        channel.send({embeds: [nomembershipembed, linkingEmbed], components:[row]})
                    }        
                } else {
                    channel.send({embeds: [nomembershipembed, linkingEmbed], components:[row]})
                }
            }).catch(console.error);
        }, 1000);
    }
})

client.on('messageReactionAdd', async (messageReaction, user) => {
    message = messageReaction.message;
    if (messageReaction.emoji.name == "⭐" && message.guild.id == config.discordGuildId && message.author.id != client.user.id && messageReaction.count >= config.starboard.minimumCount) {
        message.react(`${config.emoji.star}`)
        let embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag.toString(), message.author.displayAvatarURL())
            .setFooter(`${messageReaction.count}⭐`)
            .setTimestamp()
        desc = `**[Jump to message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})**\n`
        if (message.content) {desc+=message.content}
        embed.setDescription(desc)
        if (message.attachments) {
            let attachment = await message.attachments.find(att => att.contentType.startsWith("image/"))
            if (attachment) {
                embed.setImage(attachment.url)
            }
        }
        await MongoClient.connect()
        const db = MongoClient.db()
        let qfilter = {messageid: message.id}
        db.collection('starboard').findOne(qfilter, async function (err, res) {
            if (res == undefined) {
                let starboard = await client.channels.fetch(config.channels.starboardChannelId)
                starboard.send({embeds: [embed]}).then(async (msg) => {
                    db.collection('starboard').insertOne({messageid: message.id, starboardid: msg.id}, function(err, res) {
                        if (err) throw err;
                        MongoClient.close()
                    })
                })
            } else {
                let starboard = await client.channels.fetch(config.channels.starboardChannelId)
                try {
                    starboard.messages.fetch(res.starboardid).then(async (message) => {
                        message.edit({embeds: [embed]})
                    })
                } catch (err) {
                    console.error(err)
                }
                MongoClient.close()
            }
        })
    }
})

client.on('messageReactionRemove', async (messageReaction, user) => {
    message = messageReaction.message;
    if (messageReaction.emoji.name == "⭐" && message.guild.id == config.discordGuildId && message.author.id != client.user.id && messageReaction.count >= config.starboard.minimumCount) {
        let embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag.toString(), message.author.displayAvatarURL())
            .setFooter(`${messageReaction.count}⭐`)
            .setTimestamp()
        desc = `**[Jump to message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})**\n`
        if (message.content) {desc+=message.content}
        embed.setDescription(desc)
        if (message.attachments) {
            let attachment = await message.attachments.find(att => att.contentType.startsWith("image/"))
            if (attachment) {
                embed.setImage(attachment.url)
            }
        }
        await MongoClient.connect()
        const db = MongoClient.db()
        let qfilter = {messageid: message.id}
        db.collection('starboard').findOne(qfilter, async function (err, res) {
            if (err) throw err;
            if (res == undefined) {
                let starboard = await client.channels.fetch(config.channels.starboardChannelId)
                starboard.send({embeds: [embed]}).then(async (msg) => {
                    db.collection('starboard').insertOne({messageid: message.id, starboardid: msg.id}, function(err, res) {
                        if (err) throw err;
                        MongoClient.close()
                    })
                })
            } else {
                let starboard = await client.channels.fetch(config.channels.starboardChannelId)
                try {
                    starboard.messages.fetch(res.starboardid).then(async (message) => {
                        message.edit({embeds: [embed]})
                    })
                } catch (err) {
                    console.error(err)
                }
                MongoClient.close()
            }
        })
    }
})


client.login(process.env.TOKEN)

const leaderboardDataUpdateJob = schedule.scheduleJob(config.scheduledEvents.leaderboardDataUpdate, function(){functions.leaderboardDataUpdate(client)});