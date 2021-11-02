const Discord = require('discord.js')
const https = require('https')
require('dotenv').config()
const config = require('../config.json')

module.exports.run = async (client, button, config) => {
    let message = button.message
    let passedData = JSON.parse((message.content).replace("||", "").replace("||", ""))
    https.get(`https://api.hypixel.net/player?key=${process.env.APIKEY}&uuid=${passedData.uuid}`, (res) => {
        let strData = "";
        res.on('data', data_chunk => {
            strData += data_chunk;
        })
        res.on('end', () => {
            let data = JSON.parse(strData)
            //console.log(data)

            let mcVer = data.player.mcVersionRp
            let karma = data.player.karma
            let firstLogin = new Date(data.player.firstLogin)
            let lastLogin;
            if (data.player.lastLogin) {
                lastLogin = new Date(data.player.lastLogin)
            } else {
                lastLogin = undefined
            }
            let lastSeen;
            if (data.player.lastLogout) {
                lastSeen = new Date(data.player.lastLogout)
            } else {
                lastSeen = undefined
            }
            let name = data.player.displayname
            let exp = data.player.networkExp
            networkLevel = Math.round((Math.sqrt((2 * parseInt(exp)) + 30625) / 50) - 2.5)
            networkLevelRaw = (Math.sqrt((2 * parseInt(exp)) + 30625) / 50) - 2.5
            let rank = "";
            if (data.player.monthlyPackageRank == "SUPERSTAR") {rank="MVP++"} else if (data.player.newPackageRank == "MVP_PLUS") {rank="MVP+"} else if (data.player.newPackageRank == "MVP") {rank="MVP"} else if (data.player.newPackageRank == "VIP_PLUS") {rank="VIP+"} else if (data.player.newPackageRank == "VIP") {rank="VIP"} else if (data.player.newPackageRank == "MVP") {rank="MVP"}

            let embed = new Discord.MessageEmbed()
                .setColor(config.embedcolour.a)
                .setTimestamp()
                .setTitle(`**${rank}** ${name} - User data`)
                .setFooter(`uuid: ${passedData.uuid}`)
                .addField("Minecraft version: ", `${mcVer}`)
                .addField("Network level: ", `${networkLevel}`)
                //.addField("Network exp: ", `${exp}`)
                .addField("Karma: ", `${karma.toLocaleString("en")}`)
                let loginInline = false; if(lastLogin || lastSeen) loginInline = true;
                embed.addField("First login: ", `${firstLogin}`, loginInline)
                if (lastLogin) {embed.addField("Last login: ", `${lastLogin}`, true)}
                if (lastSeen) {embed.addField("Last seen: ", `${lastSeen}`, true)} 
            let memberButton = new Discord.MessageButton()
                .setStyle(1)
                .setLabel('Guild member data')
                .setCustomId('guildcommand_member')
            let userButton = new Discord.MessageButton()
                .setStyle(1)
                .setLabel('User data')
                .setCustomId('guildcommand_user')
                .setDisabled(true)
            let row = new Discord.MessageActionRow()
                .addComponents(memberButton, userButton)
            button.update({
                content: message.content,
                embeds: [embed],
                components: [row]
            })
        })
    }).on('error', (err) => {console.error(err); return button.reply({content: `**There was an error while executing this action!**\n*{${err}}*`, ephemeral: true})})
}