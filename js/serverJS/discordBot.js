const util = require("util");
const {pool} = require("./database/dbConfig");
const {logMessage, LogLevel} = require("./logger");

let guildId;
let client;

function setupDiscordBot(pGuildId,pClient){
    guildId = pGuildId;
    client = pClient;
}

/**
 * Method which returns the amount of discord members
 * @returns
 */
const getCurrentDiscordMembers = async () => {
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

/**
 * Method which sends a direct message to a specific user
 * @param discordUsername
 * @param message
 * @returns
 */
const sendMessageToUser = async (discordUsername, message) => {
    let guild;
    let user;

    try {
        guild = client.guilds.cache.get(guildId);
        if (!guild) throw new Error('Invalid Guild ID or the bot is not a member of the guild.');

        const members = await guild.members.fetch();
        user = members.find(member => member.user.username === discordUsername);

        if (!user) throw new Error('User not found');

        await user.send(message);
    } catch (error) {
        console.error(error);
        logMessage(`Error sending message to user ${discordUsername}. Error Message: ${error}`, LogLevel.ERROR, error)
    }
};

/**
 * This function sends a message to all users who don't have inserted their training data
 * It triggers if the user has the notification setting enabled and no training data is found for the next 3 days
 */
async function sendTrainingDataReminders() {
    const query = util.promisify(pool.query).bind(pool);
    const result = await query(`WITH prep AS( SELECT discord, username, count(presence.id) AS presenceCount FROM account
                                                LEFT JOIN presence ON presence.account_fk = account.id
                                                WHERE (presence.date IS NULL) OR (to_timestamp(presence.date) > NOW() AND to_timestamp(presence.date) < NOW() + INTERVAL \'5 days\') AND  trainingdatareminder = 1
                                                GROUP BY discord, username)
                                SELECT discord, username FROM prep WHERE presencecount < 5 AND discord IS NOT NULL`);

    if (result.rows.length > 0) {
        result.rows.forEach((row) => {
            sendMessageToUser(row.discord,`Hey there, ${row.username} 👋
            
We noticed that your training data for the next 5 days hasn't been logged yet! 📝

:point_right: Please visit https://webapp.teamgenetix.ch and insert your training data

:point_right: If you don't want to receive these messages anymore, you can disable them via Settings > Manage Notifications

Thank you and keep up the great work with your training! 💪

Your Team Genetix Bot 🤖
            `)
        });

        logMessage(`Sent training data reminders to ${result.rows.length} users`, LogLevel.INFO, null)
    }else{
        logMessage(`No users found for training data reminder`, LogLevel.INFO, null)
    }
}

/**
 * This function sends a welcome message to a new user
 */
function sendWelcomeMessage(discordUsername){
    sendMessageToUser(discordUsername, `Hey there, ${discordUsername} 👋

You have successfully linked your Discord account with your Team Genetix Webapp account! 🎉

Your Team Genetix Bot 🤖`)
}

module.exports = {
    getCurrentDiscordMembers,
    sendMessageToUser,
    sendTrainingDataReminders,
    setupDiscordBot,
    sendWelcomeMessage
};

