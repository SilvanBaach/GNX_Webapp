/**
 * @fileoverview This file contains the javascript code for the team calendar page
 */
const daysOfWeek = ["","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Format a date object into a string with the format dd.mm.yyyy
 * @param date
 * @returns {string}
 */
function formatDate(date) {
    // get the day, month, and year of the date object
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

/**
 * Get the monday of the week of the given date
 * @param dateString the date as a string
 * @returns {Date} the monday of the week of the given date
 */
function getMondayOfWeek(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();

    const diff = date.getDate() - day + 1;

    return new Date(date.setDate(diff));
}

/**
 * Get the sunday of the week of the given date
 * @param dateString
 * @returns {Date} the sunday of the week of the given date
 */
function getSundayOfCurrentWeek(dateString) {
    const fDay = getMondayOfWeek(dateString);
    const lDay = new Date(fDay);
    lDay.setDate(lDay.getDate() + 6);

    return lDay
}

/**
 * Get the date of a given day in the week of the given date with the given offset
 * @param dateString the date as a string
 * @param offset how many days to add to the monday of the week of the given date
 * @returns {Date}  the date of the given day in the week of the given date with the given offset
 */
function getXDayOfWeek(dateString, offset) {
    const fDay = getMondayOfWeek(dateString);
    const lDay = new Date(fDay);
    lDay.setDate(lDay.getDate() + offset);
    lDay.setHours(23, 59, 59);

    return lDay
}

/**
 * Retunrs the date based on a week day (e.g. monday, tuesday, etc.) and the current week we are in
 * @param date the current week we are in
 * @param dayOfWeek the week day (e.g. monday, tuesday, etc.)
 * @returns {string} the date based on a week day (e.g. monday, tuesday, etc.) and the current week we are in
 */
function getDateFromDay(date, dayOfWeek) {
    if (dayOfWeek === "") return "";
    return formatDate(getXDayOfWeek(date, daysOfWeek.indexOf(dayOfWeek)-1));
}

/**
 * Main  function which generates and prints the calendar
 * @param users the users of the team for which a row is generated
 * @param currentDate the current date (is the start date of the calendar)
 * @param sessionUser the user who is currently logged in
 * @param teamId the id of the team
 * @returns {Promise<void>}
 */
async function generateCalendar(users, currentDate, sessionUser, teamId) {
    const calContainer = document.querySelector('.cal-container');
    const today = new Date();

    //Load data from monday to sunday
    const teamData = await getDataFromTeam(getMondayOfWeek(currentDate), getSundayOfCurrentWeek(currentDate), teamId)

    // Create the header of the calendar
    $(".cal-container").html(daysOfWeek.map(day => {
        const dateStr = getDateFromDay(currentDate, day);
        const isToday = dateStr === formatDate(new Date());
        const headerClass = isToday ? "grid-header-today" : "grid-header";
        return (
            `<div class="grid-item ${headerClass}">` +
            `<div class="header-content-container">` +
            `<p>${day}</p>` +
            `<p class="date">${dateStr}</p>` +
            `</div>` +
            `</div>`
        );
    }).join(""));


    const numRows = users.length;
    const numCols = 8;

    // Create grid layout with 8 columns and for each user a row
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const gridItem = document.createElement('div');
            const dateStr = getDateFromDay(currentDate, daysOfWeek[j]);
            const isToday = dateStr === formatDate(new Date());
            const headerClass = isToday ? "grid-item-today" : "grid-item";
            gridItem.classList.add('grid-item');
            gridItem.classList.add(headerClass);
            const jDayObj = new Date(getXDayOfWeek(currentDate, j - 1))

            // Add username to first column
            if (j === 0) {
                gridItem.innerText = users[i].username;
                gridItem.classList.add('grid-item-username');
            } else {
                let innerHTML =
                    '<div class="cell-content-container">' +
                    '<div class="edit-content-row">' +
                    `<input type="text" value="${users[i].username}" style="display: none" id="inputUsername"/>` +
                    `<input type="text" value="${formatDate(getXDayOfWeek(currentDate, j - 1))}" style="display: none" id="inputDate"/>`;
                if(users[i].username === sessionUser) {
                    if (jDayObj.getTime() >= today.getTime()) {
                        innerHTML +=
                            '<a class="edit">' +
                            '<i class="ri-edit-fill"></i>' +
                            '</a>';
                    }
                }
                innerHTML +=
                    '</div>' +
                    '<div class="content-row">' +
                    getDataFromDay(getXDayOfWeek(currentDate, j - 1), users[i].username, teamData) +
                    '</div>' +
                    '</div>';

                gridItem.innerHTML = innerHTML;
                // Add click event handler to edit link
                if(users[i].username === sessionUser && jDayObj.getTime() >= today.getTime()) {
                    const editLink = gridItem.querySelector('.edit');
                    editLink.addEventListener('click', function (e) {
                        const username = this.closest('.edit-content-row').querySelector("#inputUsername").value;
                        const date = this.closest('.edit-content-row').querySelector("#inputDate").value;
                        editDay(username, date, e);
                    });
                }

            }

            calContainer.appendChild(gridItem);
        }
    }


    $("#currentWeekText").text("Week " + formatDate(getMondayOfWeek(currentDate)) + " - " + formatDate(getSundayOfCurrentWeek(currentDate)));
}

/*function editDay(username, date, e){

    //Configure Popup to edit day
    const popup = new Popup("popup-container-edit");
    popup.displayInputPopupCustom("/res/edit.png", "Edit Day", "Save", "btnSave", '' +
        '<label for="presenceType" class="input-label">Presence Type</label>' +
        '<select id="presenceType" class="input-field">' +
            '<option value="" disabled selected>Select Presence Type</option>' +
            '<option value="0">Present</option>' +
            '<option value="1">Open</option>' +
            '<option value="2">Absent</option>' +
            '<option value="3">Unsure</option>' +
        '</select>' +
        '<div class="sub-data-container" id="sub-data-container">' +
        '</div>'
    );

    //Add event listener to select box
    $("#presenceType").change(function(){
        const presenceType = $(this).val();
        if(presenceType === "0"){
            //Add from until fields
            $("#sub-data-container").empty().html('' +
                '<label for="from" class="input-label">From</label>' +
                '<input type="time" id="from" class="input-field"/>' +
                '<label for="until" class="input-label">Until</label>' +
                '<input type="time" id="until" class="input-field"/>');
        }else if(presenceType === "3"){
            //Add comment field
            $("#sub-data-container").empty().html('' +
                '<label for="comment" class="input-label">Comment</label>' +
                '<input type="text" id="comment" class="input-field"/>');
        }else{
            $("#sub-data-container").empty();
        }
    });

    //Add event listener to save button
    $("#btnSave").click(function(e){
        //check if all fields are filled
        const presenceType = $("#presenceType").val();
        let from;
        let until;
        const comment = $("#comment").val();

        if(presenceType){
            if (presenceType === "0") {
                from = $("#from").val();
                until = $("#until").val();
                if (!from || !until) {
                    displayError("Please fill all fields!");
                    return;
                }
            }
        }else{
            displayError("Please fill all fields!");
            return;
        }

        //Save data
        saveDay(username, date, presenceType, from, until, comment);

        popup.close(e);
    });

    popup.open(e);
}*/

/**
 * Loads all existing presence data from a team in a given time period
 * @param from start of time period
 * @param until end of time period
 * @param teamId id of the team
 * @returns {Promise<*>}
 */
async function getDataFromTeam(from, until, teamId) {
    const dateFrom = new Date(from);
    const dateUntil = new Date(until);

    //Convert the dates into epoch time
    const epochFrom = Math.floor(new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate()).getTime() / 1000);
    const epochUntil = Math.floor(new Date(dateUntil.getFullYear(), dateUntil.getMonth(), dateUntil.getDate()).getTime() / 1000);

    //Get data from server
    return await $.ajax({
        url: "/presence/getPresenceListFromTeam/" + teamId + "/" + epochFrom + "/" + epochUntil,
        type: "GET",
        success: function (data) {
            return data;
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/**
 * Returns correct innerHTML for a day for a user based on the presence state
 * @param date date of the day
 * @param username username of the user
 * @param teamData data of the team
 * @returns {string} innerHTML
 */
function getDataFromDay(date, username, teamData){
    const dateOrg = new Date(date);
    const epoch = Math.floor(new Date(dateOrg.getFullYear(), dateOrg.getMonth(), dateOrg.getDate()).getTime() / 1000);

    const data = teamData.find(record => record.date == epoch && record.username == username);
    let newHTML;
    if(data){
        switch (data.state) {
            case 0:
                newHTML =
                    '<i class="ri-check-fill icon icon-green"></i>' +
                    `<p class="info-text">${data.from} - ${data.until}</p>`;
                break;
            case 1:
                newHTML =
                    '<i class="ri-check-fill icon icon-green"></i>' +
                    `<p class="info-text">Open</p>`;
                break;
            case 2:
                newHTML =
                    '<i class="ri-close-line icon icon-red"></i>' +
                    `<p class="info-text">Absent</p>`;
                break;
            case 3:
                newHTML =
                    '<i class="ri-question-mark icon icon-orange"></i>';
                if(data.comment){
                    newHTML += `<p class="info-text">Comment: ${data.comment}</p>`;
                }else{
                    newHTML += `<p class="info-text">Unsure</p>`;
                }
                break;
        }
    }else {
        newHTML =
            '<i class="ri-subtract-line icon icon-grey"></i>' +
            '<p class="info-text">No data found</p>';
    }
    return newHTML;
}

/*function saveDay(username, date, presenceType, from, until, comment){
    //ajax call to save data
    $.ajax({
        url: "/savepresence",
        type: "POST",
        data: {
            username: username,
            date: date,
            state: presenceType,
            from: from,
            until: until,
            comment: comment
        },
        success: function () {
            displaySuccess("Data saved successfully!")
            const parts = date.split('.');
            const day = parseInt(parts[0], 10);
            const monthIndex = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const dateDat = new Date(year, monthIndex, day);
            buildCalendar(dateDat);
        },error: function () {
            displayError("Error saving data! Please try again later.")
        }
    });
}*/