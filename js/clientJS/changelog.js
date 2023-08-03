const date = new Date();

/**
 * Builds the changelog table
 */
function buildLogTable(){
    loadData($('#levelFilter').val(),$('#userFilter').val()).then((data) => {
        const tableBody = $("#logTableData");
        tableBody.empty();

        data.forEach(function(log) {
            const tr = $("<tr></tr>");

            if (log.level === 1) tr.addClass('warn');
            else if (log.level === 2) tr.addClass('error');

            if (log.user === 'System' && log.level !== 1 && log.level !== 2) tr.addClass('system');

            const tdDate = $("<td></td>").text(log.date);
            const tdMessage = $("<td></td>").text(log.message);
            const tdUser = $("<td></td>").text(log.user);
            const tdLevel = $("<td></td>").text(getLevelText(log.level));

            tr.append(tdDate).append(tdMessage).append(tdUser).append(tdLevel);
            tableBody.append(tr);
        });
    });

    loadActionCount().then((data) => {
        let day = ('0' + date.getDate()).slice(-2);
        let month = ('0' + (date.getMonth() + 1)).slice(-2);  // Remember to +1 for getMonth()!
        let year = date.getFullYear();

        $('#currentDate').text(`${day}.${month}.${year} - ${data[0].count} total actions`);
    });
}

/**
 * Loads the data for the changelog table
 */
function loadData(level, userId){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/logs/getLogs',
            type: "GET",
            data: {
                date: date,
                level: level,
                userId: userId
            },
            dataType: "json",
            success: function (data) {
                resolve(data);
            },
            error: function (data) {
                console.log(data);
                reject(data);
            }
        });
    });
}

/**
 * Returns the log level as text
 * @param level
 * @returns {string}
 */
function getLevelText(level) {
    const levelMap = ['INFO', 'WARN', 'ERROR'];
    return levelMap[level];
}

/**
 * Loads the next day
 */
function nextDay(){
    date.setDate(date.getDate() + 1);
    buildLogTable();
}

/**
 * Loads the previous day
 */
function previousDay(){
    date.setDate(date.getDate() - 1);
    buildLogTable();
}

/**
 * Loads the action count for the current day
 */
function loadActionCount(){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/logs/getActionCount',
            type: "GET",
            data: {
                date: date
            },
            dataType: "json",
            success: function (data) {
                resolve(data);
            },
            error: function (data) {
                console.log(data);
                reject(data);
            }
        });
    });
}

/**
 * Loads the users for the user filter
 */
function loadUserData(){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/user/getUsers',
            type: "GET",
            data: {
                minimalData: true
            },
            dataType: "json",
            success: function (data) {
                resolve(data);
            },
            error: function (data) {
                console.log(data);
                reject(data);
            }
        });
    });
}

function buildUserFilter(){
    loadUserData().then((data) => {
        const userFilter = $('#userFilter');
        userFilter.empty();

        const option = $('<option></option>').attr('value', -2).text('All users');
        userFilter.append(option);

        const option2 = $('<option></option>').attr('value', -1).text('System');
        userFilter.append(option2);

        data.forEach(function(user) {
            const option = $('<option></option>').attr('value', user.id).text(user.username);
            userFilter.append(option);
        });
    });
}