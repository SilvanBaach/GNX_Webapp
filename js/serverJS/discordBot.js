/**
 * Method which returns the amount of discord members
 * @param guildId
 * @param client
 * @returns {Promise<string[]>}
 */
const getCurrentDiscordMembers = async (guildId, client) => {
    let guild = client.guilds.cache.get(guildId);
    if (!guild) throw new Error('Invalid Guild ID or the bot is not a member of the guild.');

    let members = await guild.members.fetch();
    return members.map(member => member.user.tag);
}

module.exports = {getCurrentDiscordMembers}

