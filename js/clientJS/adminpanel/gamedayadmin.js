let currentDate;
let monday;
let sunday;

/**
 * This function is responsible for loading the page
 */
function initPage(){
    currentDate = new Date();
    displayWeek();
}

/**
 * This function display the gamedays in the table
 */
function displayGamedays(gamedays) {
    let tableBody = $('#gamedaysData');
    tableBody.empty();

    if (!gamedays.length) {
        tableBody.append(`<tr><td colspan="6" class="text-center text-md font-bold text-btn-grey">NO GAMEDAYS FOUND</td></tr>`);
    } else {
        gamedays.forEach(function(gameday){
            const formattedDate = new Date(gameday.date).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');

            const tdResult = $("<td></td>")
            if (gameday.result === null) {
                gameday.result = "Not reported";
                tdResult.addClass("text-error");
            }

            const tr = $("<tr></tr>");
            const tdDate = $("<td></td>").text(formattedDate)
            const tdTitle = $("<td></td>").text(gameday.title);
            const tdTeam = $("<td></td>").text(gameday.team)
            tdResult.text(gameday.result)
            const tdButton = $("<td></td>");
            const details = $("<a href='#' id='showDetails'><i class='ri-eye-line ri-lg text-turquoise'></i></a>").click(function(){
                $('#gamedayDetails').removeClass('hidden');
                displayDetails(gameday);
            });
            const complete = $("<a href='#' id='complete'><i class='ri-check-line ri-xl text-success ml-2'></i></a>").click(function(){
                if (gameday.result !== "Not reported"){
                    updateGamedayStatus(gameday.gamedayreportid);
                    gameday.status = 1;
                    displayDetails(gameday);
                } else {
                    displayError("You cannot complete a gameday without a reported result!");
                }
            });
            if(!gameday.status){
                tdButton.append(details).append(complete);
            }else{
                const completed = $("<span></span>").text("Completed").addClass("text-success ml-4");
                tdButton.append(details).append(completed);
            }

            tr.append(tdDate).append(tdTitle).append(tdTeam).append(tdResult).append(tdButton);
            tableBody.append(tr);
        });
    }
}

/**
 * Updates the status of a gameday
 * @param gamedayreportid
 */
function updateGamedayStatus(gamedayreportid){
    $.ajax({
        type: 'POST',
        url: '/gameday/updateStatus',
        data: {
            gamedayreportid: gamedayreportid
        },
        success: function(response) {
            displaySuccess(response.message);
            loadData();
        },
        error: function(response) {
            displayError(response.responseJSON.message);
        }
    });
}

/**
 * Displays the details of a gameday
 * @param gameday
 */
function displayDetails(gameday) {
    delete gameday.gamedayid;
    //delete gameday.gamedayreportid;

    let detailsSection = $('#gamedayDetails');
    detailsSection.empty();

    const detailsTable = $('<table class="table-auto w-full bg-grey-level2 mt-4 overflow-x-auto"></table>');

    // Create table header with gameday title
    const thead = $('<thead></thead>');
    const trHead = $('<tr></tr>');
    const th = $('<th colspan="2" class="text-left pb-4 font-montserrat font-bold text-almost-white text-lg"></th>').text(`Details for Gameday ${gameday.title}`);
    trHead.append(th);
    thead.append(trHead);
    detailsTable.append(thead);

    const tbody = $('<tbody class="text-almost-white font-montserrat"></tbody>');

    let customClass;
    for (const [key, value] of Object.entries(gameday)) {
        const tr = $('<tr></tr>');
        const tdKey = $('<td class="font-bold w-48"></td>').text(key.charAt(0).toUpperCase() + key.slice(1));
        let displayValue = value;
        if (key === 'date' || (key === 'reportdate' && displayValue)) {
            displayValue = new Date(value).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
        }

        if(key === 'status'){
            displayValue = displayValue ? 'Completed' : 'Not completed';
            customClass = displayValue === 'Completed' ? 'text-success' : 'text-error';
        }

        if (!displayValue){
            displayValue = "-";
        }

        if(key === 'result' && displayValue === 'Not reported'){
            customClass = 'text-error';
        }

        const tdValue = $('<td class="break-words py-1"></td>').text(displayValue).addClass(customClass);
        customClass = '';

        if(key !== 'gamedayreportid'){
            tr.append(tdKey).append(tdValue);
            tbody.append(tr);
        }
    }

    detailsTable.append(tbody);
    detailsSection.append(detailsTable);
}

/**
 * Loads all gamedays for the current week
 */
function loadData(){
    $.ajax({
        url: '/gameday/getResults',
        type: 'GET',
        data: {
            monday: monday,
            sunday: sunday
        },
        success: function (data) {
            displayGamedays(data);
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message);
        }
    });
}

/**
 * This function displays the current week text
 */
function displayWeek(){
    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() ? currentDate.getDay() - 1 : 6)); // Monday
    monday = currentDate.toLocaleDateString('de-CH');
    currentDate.setDate(currentDate.getDate() + 6); // Sunday
    sunday = currentDate.toLocaleDateString('de-CH');

    $('#currentWeekText').text(`Week ${monday} - ${sunday}`);
    loadData();
}

/**
 * This function displays the next week
 */
function nextWeek(){
    currentDate.setDate(currentDate.getDate() + 7);
    displayWeek();
}

/**
 * This function displays the last week

 */
function lastWeek(){
    currentDate.setDate(currentDate.getDate() - 7);
    displayWeek();
}

/**
 * This function displays the current week
 */
function today(){
    currentDate = new Date();
    displayWeek();
}