const Discord = require('discord.js')
const fetch = require('node-fetch')
const config = require('../config.json')

module.exports = {
    async execute(client, interaction) {
        let message = interaction.message
        let passedData = JSON.parse((message.content).replace("||", "").replace("||", ""))
        let hGuild;
        let data = await fetch(`https://api.hypixel.net/guild?key=${process.env.APIKEY}&id=${config.hypixelGuildId}`)
        try{hGuild = await data.json()}catch(err){console.error(err)}
        if (hGuild.success) {
            hGuild.guild.members.forEach(async member => {
                if (member.uuid != passedData.uuid) return;
                let nameData = await fetch(`https://minecraft-api.com/api/pseudo/${member.uuid}/json`)
                let mun = undefined;
                try{mun = await nameData.json()}catch(err){console.error}
                if (mun) {
                    dates = Object.keys(member.expHistory)
                    let dateField = ``
                    dates.forEach((date) => {
                        dateField += `**${date} - **${member.expHistory[date].toLocaleString("en")} exp\n`
                    })
                    let strData = await fetch(`https://api.hypixel.net/player?key=${process.env.APIKEY}&uuid=${passedData.uuid}`)
                    let data = await strData.json()
                    let rank = "";
                    if (data.player.monthlyPackageRank == "SUPERSTAR") {rank="MVP++"} else if (data.player.newPackageRank == "MVP_PLUS") {rank="MVP+"} else if (data.player.newPackageRank == "MVP") {rank="MVP"} else if (data.player.newPackageRank == "VIP_PLUS") {rank="VIP+"} else if (data.player.newPackageRank == "VIP") {rank="VIP"} else if (data.player.newPackageRank == "MVP") {rank="MVP"}
                    let embed = new Discord.MessageEmbed()
                        .setColor(config.colours.main)
                        .setTimestamp()
                        .setTitle(`**${rank}** ${mun.pseudo} - Guild member data`)
                        .setFooter(`uuid: ${passedData.uuid}`)
                        .addField("Rank", `${member.rank}`)
                        .addField("Joined guild", `${new Date(member.joined)}`)
                        .addField("Exp history", dateField)
                    let memberButton = new Discord.MessageButton()
                        .setStyle(2)
                        .setLabel('Guild member data')
                        .setCustomId('guildcommand_member')
                        .setDisabled(true)
                    let userButton = new Discord.MessageButton()
                        .setStyle(2)
                        .setLabel('User data')
                        .setCustomId('guildcommand_user')
                    let row = new Discord.MessageActionRow()
                        .addComponents(memberButton, userButton)
                    await interaction.update({
                        content: message.content,
                        embeds: [embed],
                        components: [row]
                    })
                }
            })
        }
    }
}