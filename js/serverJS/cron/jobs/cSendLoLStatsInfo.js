/**
 * This Job is responsible for sending the LoL Stats Info
 */
const leagueRouter = require('../../../../routes/leagueRouter');
const {pool} = require('../../../serverJS/database/dbConfig.js');
const {getMatchHistory} = require("../../../../routes/leagueRouter");
const discordBot = require('../../discordBot');

class cSendLoLStatsInfo {
    discordChannelId = 0;
    teamId = 0;
    roleId = 0;

    /**
     * Sets the discord channel id
     * @param discordChannelId
     */
     setDiscordChannelId(discordChannelId){
        this.discordChannelId = discordChannelId;
    }

    /**
     * Sets the team id
     * @param teamId
     */
    setTeamId(teamId){
        this.teamId = teamId;
    }

    /**
     * Sets the role id which gets pinged by the message
     * @param roleId
     */
    setRoleId(roleId){
        this.roleId = roleId;
    }

    /**
     * This function is responsible for running the job
     */
    async execute() {
        console.log("Sending weekly LoL games report...");

        const users = await this.getUsers();
        const currentWeek = this.getCurrentWeek();
        let dataPromises = users.rows.map(user => {
            return this.fetchMatchHistory(user.riotgames).then(response => {
                return {user: user.username, data: response};
            });
        });

        Promise.all(dataPromises).then(completedData => {
            this.sendMessageToChannel(completedData, currentWeek);
        }).catch(error => {
            console.error("Error in the cSendLolStatsInfo cron:", error);
        });
    }

    /**
     * Prepares the message and sends it to the channel
     * @param data
     * @param currentWeek
     */
    sendMessageToChannel(data, currentWeek){
        let message = `🔥 **Week ${currentWeek} LoL Stats Report** 🔥\n\n`;
        data.forEach(user => {
            if(user.data === 'Invalid Riot ID'){
                message += `${user.user}: :exclamation: **${user.data}**\n`;
            }else{
                message += `${user.user}: ${user.data} games\n`;
            }
        });

        message += `\nKeep it up <@&${this.roleId}>! :muscle:`;

        discordBot.sendMessageToChannel(this.discordChannelId, message);
    }

    /**
     * Fetches the match history of a user
     * @param riotId
     */
    fetchMatchHistory(riotId){
        return new Promise((resolve, reject) => {
            leagueRouter.getAccountInfo(riotId).then(async response => {
                if (response.isValid === 'false') {
                    resolve('Invalid Riot ID');
                } else {
                    const result = await leagueRouter.getMatchHistory(riotId.split('#')[0], riotId.split('#')[1], 7)
                    resolve(result.length);
                }
            });
        });
    }

    /**
     * Returns the current week (KW)
     */
    getCurrentWeek(){
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
        return  Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    /**
     * This function is responsible for getting all the users from a team
     * @returns {Promise<QueryResult<any>>}
     */
    getUsers(){
        return pool.query(`SELECT account.id, username, riotgames FROM account
                                            LEFT JOIN teammembership ON teammembership.account_fk = account.id
                                            WHERE teammembership.team_fk=$1 AND teammembership.coach=0`, [this.teamId]   );
    }
}

module.exports = cSendLoLStatsInfo;