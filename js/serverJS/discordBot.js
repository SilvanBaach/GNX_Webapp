/**
 * Method which returns the amount of discord members
 * @param guildId
 * @param client
 * @returns
 */
const getCurrentDiscordMembers = async (guildId, client) => {
    let guild = client.guilds.cache.get(guildId);
    if (!guild) throw new Error('Invalid Guild ID or the bot is not a member of the guild.');

    let onlineMembers;
    await guild.members.fetch().then(members => {
        onlineMembers = members.filter((member) => !member.user?.bot && member.presence?.status.length > 2).map((member) => member).length;
    })

    return {
        onlineMembers: onlineMembers,
        totalMembers: guild.memberCount
    };
};


module.exports = {getCurrentDiscordMembers}

