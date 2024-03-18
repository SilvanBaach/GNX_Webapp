/**
 * This Files is responsible for managing all cron jobs
 */
const cSendLoLStatsInfo = require("./jobs/cSendLoLStatsInfo");

let availableCronJobs = [{name: 'cSendLoLStatsInfo', task: null}];

/**
 * This function is responsible for registering all cron jobs
 */
function registerCronJobs(){
    const lol = new cSendLoLStatsInfo();
    lol.setDiscordChannelId(1215383342950912000);
    lol.runJob();
}

module.exports = {registerCronJobs};