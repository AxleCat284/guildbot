const Discord = require('discord.js')

module.exports.run = async (client, menu, config) => {
    let user = await menu.clicker.member
    if (!menu.values[0]) {
        //return menu.reply.send(`No options selected. Nothing happened`, true)
        menu.reply.defer()
    } else {
        let addedCounter = 0
        let removedCounter = 0
        for (let i = 0;i<menu.values.length;i++) {
            let menuValue = menu.values[i]
            if (menuValue == 'rr_pink') {
                if (user.roles.cache.has("803510606442790924")) {
                    await user.roles.remove("803510606442790924")
                    removedCounter++;
                } else {
                    await user.roles.add("803510606442790924")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_purple') {
                if (user.roles.cache.has("776010567169081355")) {
                    await user.roles.remove("776010567169081355")
                    removedCounter++;
                } else {
                    await user.roles.add("776010567169081355")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_blue') {
                if (user.roles.cache.has("776010569097412610")) {
                    await user.roles.remove("776010569097412610")
                    removedCounter++;
                } else {
                    await user.roles.add("776010569097412610")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_aqua') {
                if (user.roles.cache.has("886304682958520411")) {
                    await user.roles.remove("886304682958520411")
                    removedCounter++;
                } else {
                    await user.roles.add("886304682958520411")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_green') {
                if (user.roles.cache.has("886305205099057172")) {
                    await user.roles.remove("886305205099057172")
                    removedCounter++;
                } else {
                    await user.roles.add("886305205099057172")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_yellow') {
                if (user.roles.cache.has("886305199096991834")) {
                    await user.roles.remove("886305199096991834")
                    removedCounter++;
                } else {
                    await user.roles.add("886305199096991834")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_orange') {
                if (user.roles.cache.has("776010572458229761")) {
                    await user.roles.remove("776010572458229761")
                    removedCounter++;
                } else {
                    await user.roles.add("776010572458229761")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_red') {
                if (user.roles.cache.has("886309224659955732")) {
                    await user.roles.remove("886309224659955732")
                    removedCounter++;
                } else {
                    await user.roles.add("886309224659955732")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_cancel') {
        
            } else if (menuValue == 'rr_lightpink') {
                if (user.roles.cache.has("868184957309313114")) {
                    await user.roles.remove("868184957309313114")
                    removedCounter++;
                } else {
                    await user.roles.add("868184957309313114")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_lightpurple') {
                if (user.roles.cache.has("868184920479137863")) {
                    await user.roles.remove("868184920479137863")
                    removedCounter++;
                } else {
                    await user.roles.add("868184920479137863")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_lightblue') {
                if (user.roles.cache.has("886305200485314621")) {
                    await user.roles.remove("886305200485314621")
                    removedCounter++;
                } else {
                    await user.roles.add("886305200485314621")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_ultralightblue') {
                if (user.roles.cache.has("886956920567656468")) {
                    await user.roles.remove("886956920567656468")
                    removedCounter++;
                } else {
                    await user.roles.add("886956920567656468")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_lightaqua') {
                if (user.roles.cache.has("886305202196598794")) {
                    await user.roles.remove("886305202196598794")
                    removedCounter++;
                } else {
                    await user.roles.add("886305202196598794")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_lightgreen') {
                if (user.roles.cache.has("886305202947358770")) {
                    await user.roles.remove("886305202947358770")
                    removedCounter++;
                } else {
                    await user.roles.add("886305202947358770")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_lightyellow') {
                if (user.roles.cache.has("886305203714940958")) {
                    await user.roles.remove("886305203714940958")
                    removedCounter++;
                } else {
                    await user.roles.add("886305203714940958")
                    addedCounter++;
                }
            } else if (menuValue == 'rr_lightred') {
                if (user.roles.cache.has("886314183329722390")) {
                    await user.roles.remove("886314183329722390")
                    removedCounter++;
                } else {
                    await user.roles.add("886314183329722390")
                    addedCounter++;
                }
            }
        }
        menu.reply.send(`<:plus:886704907799896085> Applied - **${addedCounter}** roles\n<:minus:886704907841835109> Removed - **${removedCounter}** roles.`, true)
    }
}