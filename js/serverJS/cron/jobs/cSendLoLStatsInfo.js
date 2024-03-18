/**
 * This Job is responsible for sending the LoL Stats Info
 */
const leagueRouter = require('../../../../routes/leagueRouter');

class cSendLoLStatsInfo {
    discordChannelId = 0;

    /**
     * Sets the discord channel id
     * @param discordChannelId
     */
     setDiscordChannelId(discordChannelId){
        this.discordChannelId = discordChannelId;
    }

    /**
     * This function is responsible for running the job
     */
    runJob(){
        console.log("Sending weekly LoL games report...");
        //leagueRouter.getMatchHistory()
    }
}

module.exports = cSendLoLStatsInfo;