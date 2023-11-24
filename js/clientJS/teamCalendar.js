/**
 * @fileoverview This file contains the javascript code for the team calendar page
 */
const daysOfWeek = ["Filler", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let clipboard = null;
let trainingsToBeDefined = null;
let teamId = 0;

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
 * @param teamManagerId the id of the team manager
 * @param isAdmin
 * @returns {Promise<void>}
 */
async function generateCalendar(users, currentDate, sessionUser, teamId, teamManagerId, isAdmin) {
    const today = new Date();

    //Creates the header of the table
    const calHeader = $("#calHeader");
    calHeader.empty();

    daysOfWeek.forEach(function(day) {
        const dateStr = getDateFromDay(currentDate, day);
        const isToday = dateStr === formatDate(new Date());
        const headerClass = isToday ? "bg-turquoise" : "";
        const isHidden = day === 'Filler' ? "opacity-0" : "";

        // Create the <th> element
        let th = $("<th></th>", {
            "scope": "col",
            "class": "px-7 border-8 border-grey-level1 py-4 bg-grey-level2 " + headerClass + " " + isHidden,
            "html": day + "<br><span class='text-base mt-1 block font-normal'>" + dateStr + "</span>"
        });

        calHeader.append(th);
    });

    //Set the current Week text
    $("#currentWeekText").text("Week " + formatDate(getMondayOfWeek(currentDate)) + " - " + formatDate(getSundayOfCurrentWeek(currentDate)));

    //Load data from monday to sunday
    const teamData = await getDataFromTeam(getMondayOfWeek(currentDate), getSundayOfCurrentWeek(currentDate), teamId)

    //Sort users based on calendar order
    for (let x = 0; x < users.length; x++) {
        users[x].calendarorder = users.length - x
    }

    //Generate the rows for each user
    const calContainer = $("#calBody");
    calContainer.empty();
    const numRows = users.length;
    const numCols = 8;

    //Data to iterate over
    let data = {
        actionIcons: [
            { href: "#", iconClass: "ri-edit-line" },
            { href: "#", iconClass: "ri-clipboard-line" },
            { href: "#", iconClass: "ri-file-copy-2-line" }
        ],
        statusImgSrc: "images/ok.png",
        statusAltText: ""
    };

    for (let i = 0; i < numRows; i++) {
        // Generate the <tr> element
        let tr = $("<tr></tr>", { "class": "border-b-8 border-grey-level1" });

        for (let j = 0; j < numCols; j++) {

            if (j === 0) {
                // Special Case: 1st column with username
                let userImage = users[i].thumbnail ? users[i].thumbnail : "/res/others/blank_profile_picture.png";

                let crownHtml = '';
                if (users[i].userid === teamManagerId) {
                    crownHtml = '<img src="/res/others/crown.png" alt="Team Manager" class="w-6">';
                }

                let tdUser = $("<td></td>", {
                    "scope": "row",
                    "class": "px-6 py-2 bg-grey-level2 h-[150px]",
                    "html": `<div class="flex items-center flex-col text-center">
                            <div class="flex flex-col items-center">
                                ${crownHtml}
                                <img src="${userImage}" alt="Picture of user ${users[i].username}" class="rounded-full w-16">
                            </div>
                            <h6 class="text-lg mt-2 font-montserrat text-white text-center font-bold">${users[i].username}</h6>
                         </div>`
                });

                tr.append(tdUser);
            } else {
                // All other columns
                let tdActions = $("<td></td>").addClass("px-3 py-4 bg-grey-level2");
                let divRelative = $("<div></div>").addClass("relative");
                let ulIcons = $("<ul></ul>").addClass("text-end");

                data.actionIcons.forEach(function (icon) {
                    let a = $("<a></a>").attr("href", icon.href);
                    let i = $("<i></i>").addClass(`${icon.iconClass} font-normal text-sm text-white`);
                    a.append(i); // Append the icon to the link
                    let li = $("<li></li>").append(a); // Append the link to the list item
                    ulIcons.append(li); // Append the list item to the unordered list
                });

                divRelative.append(ulIcons);

                // Overlay div for image
                let divImageOverlay = $("<div></div>").addClass("absolute w-[104px] h-[107px] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2");
                let img = $("<img>").attr({
                    "src": data.statusImgSrc,
                    "alt": data.statusAltText,
                    "class": "opacity-40"
                });
                divImageOverlay.append(img); // Append the image to the overlay div

                divRelative.append(divImageOverlay); // Append the overlay div to the relative div
                tdActions.append(divRelative); // Append the relative div to the td
                tr.append(tdActions);
            }
        }
        calContainer.append(tr);
    }
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
        dataType: "json",
        data: {newOrder},
        success: function () {
            displaySuccess("Order saved successfully!")
        }, error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
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
        } else if (presenceType === "3" || presenceType === "2") {
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
        } else if (elementWithUsername.state === 3 || elementWithUsername.state === 2) {
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
    return $.ajax({
        url: "/presence/getPresenceListFromTeam/" + teamId + "/" + epochFrom + "/" + epochUntil,
        type: "GET",
        dataType: "json",
        success: function (data) {
            return data;
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
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
                    '<i class="ri-close-line icon icon-red"></i>';
                if (data.comment) {
                    newHTML += `<p class="info-text">${data.comment}</p>`;
                } else {
                    newHTML += `<p class="info-text">Absent</p>`;
                }
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
        }, error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message)
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
        dataType: "json",
        success: function (data) {
            users = data;
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
        }
    });

    return users;
}

/**
 * Builds the next training table for a team
 * @param teamId id of the team
 */
function buildNextTrainingTable(teamId) {
    return new Promise((resolve, reject) => {
        const url = "/presence/nextTrainings/" + teamId;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
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
                        const typeDiv = $("<div></div>").addClass("type-div");
                        const typeText = $("<p></p>").text(' - ' + training.trainingtype).addClass("type-text");

                        const statusIndicator = $("<div></div>").addClass("status-indicator");
                        if (training.trainingtype === "fixed") {
                            statusIndicator.addClass("status-green");
                        } else {
                            statusIndicator.addClass("status-orange");
                        }
                        typeDiv.append(statusIndicator).append(typeText);
                        tdType.append(typeDiv);

                        tr.append(tdDate).append(tdFrom).append(tdUntil).append(tdDuration).append(tdType);
                        tableBody.append(tr);
                    });
                }

                resolve(); // Resolve the promise when successful
            },
            error: function (data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                console.log(data);
                reject(data); // Reject the promise if there's an error
            }
        });
    });
}


/**
 * Setup of the define training time popup
 */
function setupDefTrainingTimePopup(id) {
    teamId = id;
    const defTrainingTimePopup = new Popup("popup-containerDefTrainingTime");

    defTrainingTimePopup.displayInputPopupCustom("/res/others/edit.png", "Define Training Time", "Confirm", "btnDefineTrainingTime",
        '<label for="training" class="input-label">Choose Training</label>' +
        '<select id="training" class="input-field">' +
        '<option value="" disabled selected>Select a Training</option>' +
        getTrainingOptions(teamId, function (options) {
            $('#training').html('<option value="" disabled selected>Select a Training</option>' + options);
        }) +
        '</select>' +
        '<label for="from" class="input-label">From</label>' +
        `<input type="time" id="from" class="input-field"/>` +
        '<label for="until" class="input-label">Until</label>' +
        `<input type="time" id="until" class="input-field"/>` +
        `<div id="delTrainingDiv"><button id="btnDeleteTraining" class="default red">Delete</button></div>`
    )

    $('#manageLink').click(function (e) {
        $("#training").val("");
        $("#from").val("").prop("disabled", true);
        $("#until").val("").prop("disabled", true);
        $("#delTrainingDiv").hide();
        defTrainingTimePopup.open(e);
    });

    $('#training').change(function () {
        const selectedTrainingEpochDate = $(this).val();
        const fixedTrainingId = $(this).find(":selected").data("secondvalue");

        if (fixedTrainingId > 0){
            $("#delTrainingDiv").show();
        }else{
            $("#delTrainingDiv").hide();
        }

        if (selectedTrainingEpochDate != "") {
            const selectedTraining = trainingsToBeDefined.find(training => training.epochdate == selectedTrainingEpochDate);

            if (selectedTraining) {
                $("#from").prop("disabled", false).val(selectedTraining.starttime);
                $("#until").prop("disabled", false).val(selectedTraining.endtime);
            } else {
                $("#from").prop("disabled", true);
                $("#until").prop("disabled", true);
            }
        } else {
            $("#from").prop("disabled", true);
            $("#until").prop("disabled", true);
        }
    });

    $('#btnDefineTrainingTime').click(function () {
        if (!$("#training").val()) {
            displayError("Please select a training!");
            return;
        }
        if ($("#from").val() == "") {
            displayError("Please select a start time!");
            return;
        }
        if ($("#until").val() == "") {
            displayError("Please select an end time!");
            return;
        }

        if ($("#from").val() >= $("#until").val()) {
            displayError("Start time must be before end time!");
            return;
        }

        const fixedTrainingId = $("#training").find(":selected").data("secondvalue");

        let action = "create";
        if (fixedTrainingId > 0) {
            action = "update";
        }

        const data = {
            epochdate: $("#training").val(),
            starttime: $("#from").val(),
            endtime: $("#until").val(),
            id: fixedTrainingId,
            team_fk: teamId
        }

        crudFixedTraining(data, action)

        defTrainingTimePopup.close();
    });

    $("#btnDeleteTraining").click(function () {
        const data = {
            id: $("#training").find(":selected").data("secondvalue")
        }

        crudFixedTraining(data, "delete")

        defTrainingTimePopup.close();
    });
}

/**
 * Returns all training options
 * @returns {string}
 */
function getTrainingOptions(teamId, callback) {
    let options = "";

    $.ajax({
        url: "/training/getTrainingsToBeDefined",
        data: {teamId: teamId},
        type: "GET",
        dataType: "json",
        success: function (data) {
            trainingsToBeDefined = data;

            for (let x = 0; x < data.length; x++) {
                const dateParts = data[x].readable_date.split(".");
                const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

                // Get the localized weekday name
                const weekday = date.toLocaleString('en-US', { weekday: 'long' });

                if (data[x].playercount == -1) {
                    options += `<option value="${data[x].epochdate}" data-secondvalue="${data[x].fixedtrainings_id}">${weekday}, ${data[x].readable_date} - fixed (${data[x].starttime} - ${data[x].endtime})</option>`;
                } else {
                    options += `<option value="${data[x].epochdate}" data-secondvalue="${data[x].fixedtrainings_id}">${weekday}, ${data[x].readable_date} - proposed (${data[x].playercount} player(s) available)</option>`;
                }
            }

            callback(options);
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            console.log(data);
        }
    });
}

/**
 * CRUD on fixed training
 * @param data
 * @param action
 */
function crudFixedTraining(data, action){
    data.action = action;

    $.ajax({
        url: "/training/crud",
        data: data,
        type: "POST",
        dataType: "json",
        success: function (data) {
            displaySuccess(data.message);
            setupDefTrainingTimePopup(teamId)
            buildNextTrainingTable(teamId)
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message);
        }
    });
}
