/**
 * @fileoverview This file contains the javascript code for the team calendar page
 */
const daysOfWeek = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let clipboard = null;

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
    let day = date.getDay();
    if (day === 0) {
        day = 7;
    }
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
    return formatDate(getXDayOfWeek(date, daysOfWeek.indexOf(dayOfWeek) - 1));
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
    $('.cal-container').empty();
    const today = new Date();

    //Load data from monday to sunday
    const teamData = await getDataFromTeam(getMondayOfWeek(currentDate), getSundayOfCurrentWeek(currentDate), teamId)

    // Create the header of the calendar
    $(".cal-header").html(daysOfWeek.map(day => {
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

    //Give correct calendarorder
    for (let x = 0; x < users.length; x++) {
        users[x].calendarorder = users.length - x
    }

    const numRows = users.length;
    const numCols = 8;

    // Create grid layout with 8 columns and for each user a row
    for (let i = 0; i < numRows; i++) {

        const rowContainer = document.createElement('div');
        rowContainer.classList.add('row-container');
        rowContainer.setAttribute('draggable', 'true');
        rowContainer.setAttribute('id', 'user-' + users[i].userid);
        rowContainer.setAttribute('teamid', teamId);
        rowContainer.addEventListener('dragstart', dragStart);
        rowContainer.addEventListener('dragover', dragOver);
        rowContainer.addEventListener('drop', drop);

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
                const userNameDiv = document.createElement('div');
                userNameDiv.classList.add('username-container')

                const userNameSpan = document.createElement('span');
                userNameSpan.innerText = users[i].username;
                userNameSpan.classList.add('username-span')

                const userImage = document.createElement('img')
                if (users[i].picture) {
                    userImage.src = users[i].picture
                } else {
                    userImage.src = "/res/others/blank_profile_picture.png"
                }
                userImage.classList.add('user-profile-img')

                userNameDiv.appendChild(userNameSpan);
                userNameDiv.appendChild(userImage);

                gridItem.appendChild(userNameDiv);
                gridItem.classList.add('grid-item-username');
            } else {
                let innerHTML =
                    '<div class="cell-content-container">' +
                    '<div class="edit-content-row">' +
                    `<input type="text" value="${users[i].username}" style="display: none" id="inputUsername"/>` +
                    `<input type="text" value="${formatDate(getXDayOfWeek(currentDate, j - 1))}" style="display: none" id="inputDate"/>`;
                if (users[i].username === sessionUser) {
                    innerHTML +=
                        '<a class="copy tooltip"><span class="tooltiptext">Copy</span>' +
                        '<i class="ri-file-copy-2-line"></i>' +
                        '</a>';

                    if (jDayObj.getTime() >= today.getTime()) {
                        innerHTML +=
                            '<a class="paste tooltip"><span class="tooltiptext">Paste</span>' +
                            '<i class="ri-clipboard-line"></i>' +
                            '</a>' +
                            '<a class="edit tooltip"><span class="tooltiptext">Edit</span>' +
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
                if (users[i].username === sessionUser) {
                    if (jDayObj.getTime() >= today.getTime()) {
                        const editLink = gridItem.querySelector('.edit');
                        editLink.addEventListener('click', function (e) {
                            const username = this.closest('.edit-content-row').querySelector("#inputUsername").value;
                            const date = this.closest('.edit-content-row').querySelector("#inputDate").value;
                            editDay(username, date, e, teamId);
                        });

                        const pasteLink = gridItem.querySelector('.paste');
                        pasteLink.addEventListener('click', function (e) {
                            const username = this.closest('.edit-content-row').querySelector("#inputUsername").value;
                            const date = this.closest('.edit-content-row').querySelector("#inputDate").value;
                            pasteDay(username, date);
                        });
                    }

                    const copyLink = gridItem.querySelector('.copy');
                    copyLink.addEventListener('click', function (e) {
                        const username = this.closest('.edit-content-row').querySelector("#inputUsername").value;
                        const date = this.closest('.edit-content-row').querySelector("#inputDate").value;
                        copyDay(username, date, teamId);
                    });
                }
            }

            rowContainer.appendChild(gridItem);
        }

        calContainer.appendChild(rowContainer);
    }

    $("#currentWeekText").text("Week " + formatDate(getMondayOfWeek(currentDate)) + " - " + formatDate(getSundayOfCurrentWeek(currentDate)));
}

let draggedRow = null;

function dragStart(event) {
    draggedRow = this;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', this.outerHTML);
}


function dragOver(event) {
    event.preventDefault();
    this.classList.add('drag-over');
}

async function drop(event) {
    event.preventDefault();
    if (this.classList.contains('row-container')) {
        $('.drag-over').removeClass('drag-over');

        if (draggedRow) {
            this.parentNode.insertBefore(draggedRow, this);

            // After updating DOM, calculate new order and save it
            const rows = Array.from(document.querySelectorAll('.row-container'));
            const newOrder = rows.map((row, index) => {
                // get the user id from the row id (remove 'user-' prefix)
                const userId = row.getAttribute('id').replace('user-', '');
                return {
                    userId: parseInt(userId),
                    order: rows.length - index,
                    teamId: parseInt(row.getAttribute('teamid'))
                };
            });

            await saveNewOrder(newOrder)
        }
    }
}

/**
 * This method updates the calendar order of a whole team
 * @param newOrder
 * @returns {Promise<void>}
 */
async function saveNewOrder(newOrder) {
    $.ajax({
        url: "/teammembership/updateCalendarOrder",
        type: "POST",
        data: {newOrder},
        success: function () {
            displaySuccess("Order saved successfully!")
        }, error: function () {
            displayError("Error saving Order! Please try again later.")
        }
    });
}


/**
 * This method copies a presence of a specific day
 * @param username the username of the user
 * @param date the date that should be copied
 * @param teamId the ID of the team
 * @returns {Promise<void>}
 */
async function copyDay(username, date, teamId) {
    clipboard = await getPresenceFromDateAndUsername(date, username, teamId);
    if (clipboard) {
        displaySuccess("Presence copied to clipboard");
    } else {
        displayError("No existing data found");
    }
}

/**
 * This method pastes the presence of a specific day
 * @param username the username of the user
 * @param date the date that should be pasted
 * @returns {Promise<void>}
 */
async function pasteDay(username, date) {
    if (clipboard) {
        saveDay(username, date, clipboard.state, clipboard.from, clipboard.until, clipboard.comment);
    } else {
        displayError("No data in clipboard");
    }
}

/**
 * This method returns the presence of a specific day and user
 * @param date the date
 * @param username the username
 * @param teamId the ID of the team
 * @returns {Promise<*>}
 */
async function getPresenceFromDateAndUsername(date, username, teamId) {
    const parts = date.split('.');
    const day = parseInt(parts[0], 10);
    const monthIndex = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const dateDat = new Date(year, monthIndex, day);
    const teamData = await getDataFromTeam(dateDat, dateDat, teamId)
    return teamData.find((element) => element.username === username);
}

/**
 * This method edits a presence of a specific day
 * @param username the username of the user
 * @param date the date that should be edited
 * @param e the event that triggered the edit
 * @param teamId the ID of the team
 */
async function editDay(username, date, e, teamId) {

    const elementWithUsername = await getPresenceFromDateAndUsername(date, username, teamId);

    //Configure Popup to edit day
    const popup = new Popup("popup-container-edit");
    popup.displayInputPopupCustom("/res/others/edit.png", "Edit Day", "Save", "btnSave", '' +
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
    $("#presenceType").change(function () {
        const presenceType = $(this).val();
        if (presenceType === "0") {
            //Add from until fields
            $("#sub-data-container").empty().html('' +
                '<label for="from" class="input-label">From</label>' +
                '<input type="time" id="from" class="input-field"/>' +
                '<label for="until" class="input-label">Until</label>' +
                '<input type="time" id="until" class="input-field" value="23:59"/>');
        } else if (presenceType === "3") {
            //Add comment field
            $("#sub-data-container").empty().html('' +
                '<label for="comment" class="input-label">Comment</label>' +
                '<input type="text" id="comment" class="input-field" maxlength="20"/>');
        } else {
            $("#sub-data-container").empty();
        }
    });

    //Add event listener to save button
    $("#btnSave").click(function (e) {
        //check if all fields are filled
        const presenceType = $("#presenceType").val();
        let from;
        let until;
        const comment = $("#comment").val();

        if (presenceType) {
            if (presenceType === "0") {
                from = $("#from").val();
                until = $("#until").val();
                if (!from || !until) {
                    displayError("Please fill out all fields!");
                    return;
                }
            }
        } else {
            displayError("Please fill out all fields!");
            return;
        }

        //Save data
        saveDay(username, date, presenceType, from, until, comment);

        popup.close(e);
    });

    if (elementWithUsername) {
        $('#presenceType').val(elementWithUsername.state).trigger('change');
        if (elementWithUsername.state === 0) {
            $("#from").val(elementWithUsername.from);
            $("#until").val(elementWithUsername.until);
        } else if (elementWithUsername.state === 3) {
            $("#comment").val(elementWithUsername.comment);
        }
    }

    popup.open(e);
}

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
function getDataFromDay(date, username, teamData) {
    const dateOrg = new Date(date);
    const epoch = Math.floor(new Date(dateOrg.getFullYear(), dateOrg.getMonth(), dateOrg.getDate()).getTime() / 1000);

    const data = teamData.find(record => record.date == epoch && record.username == username);
    let newHTML;
    if (data) {
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
                if (data.comment) {
                    newHTML += `<p class="info-text">${data.comment}</p>`;
                } else {
                    newHTML += `<p class="info-text">Unsure</p>`;
                }
                break;
        }
    } else {
        newHTML =
            '<i class="ri-subtract-line icon icon-grey"></i>' +
            '<p class="info-text">No data found</p>';
    }
    return newHTML;
}

/**
 * Saves presence data to the server
 * @param username username of the user
 * @param date date of the day
 * @param presenceType which type of presence should get stored
 * @param from start time of the presence
 * @param until end time of the presence
 * @param comment comment for the presence
 */
function saveDay(username, date, presenceType, from, until, comment) {
    //ajax call to save data
    $.ajax({
        url: "/presence/save",
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
        }, error: function () {
            displayError("Error saving data! Please try again later.")
        }
    });
}

/**
 * Gets all users from the database from one team
 * @returns {Promise<void>}
 */
async function getUsers(teamId) {
    let users;
    await $.ajax({
        url: "/user/getUserList/" + teamId,
        type: "GET",
        success: function (data) {
            users = data;
        },
        error: function (data) {
            console.log(data);
        }
    });

    return users;
}

/**
 * Builds the next training table for a team
 * @param teamId id of the team
 */
function buildNextTrainingTable(teamId) {
    const url = "/presence/nextTrainings/" + teamId;
    $.ajax({
        url: url,
        type: "GET",
        success: function (data) {
            const tableBody = $("#team-table tbody");
            tableBody.empty();

            if (data.length === 0) {
                const noDataText = $("<td></td>").attr('colspan', 5).addClass('no-data-found').text('NO DATA FOUND');
                const tr = $("<tr></tr>").append(noDataText);
                tableBody.append(tr);
            } else {
                data.forEach(function (training) {
                    const tr = $("<tr></tr>");
                    const tdDate = $("<td></td>").text(training.readable_date);
                    const tdFrom = $("<td></td>").text(training.starttime);
                    const tdUntil = $("<td></td>").text(training.endtime);
                    const tdDuration = $("<td></td>").text(training.duration);
                    const tdType = $("<td></td>");

                    const statusIndicator = $("<div></div>").addClass("status-indicator");
                    if (training.trainingtype === "sure") {
                        statusIndicator.addClass("status-green");
                    } else {
                        statusIndicator.addClass("status-orange");
                    }
                    tdType.append(statusIndicator)

                    tr.append(tdDate).append(tdFrom).append(tdUntil).append(tdDuration).append(tdType);
                    tableBody.append(tr);
                });
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

if (typeof process !== "undefined") {
    if (process.env.NODE_ENV.trim() === 'jest') {
        module.exports = {
            formatDate,
            getMondayOfWeek,
            getXDayOfWeek,
            getDateFromDay,
            getDataFromDay,
            getSundayOfCurrentWeek
        };
    }
}
