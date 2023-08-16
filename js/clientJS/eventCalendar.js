let currentMonth;
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let createNewPopup;
let editPopup;
let currentlyClickedDate;

/**
 * Main function for setting up the event calendar
 */
function setupEventCalendar() {
    currentMonth = new Date();
    displayCurrentMonth();
    $("#nextMonth").click(function () {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        displayCurrentMonth();
    });

    $("#lastMonth").click(function () {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        displayCurrentMonth();
    });

    $("#today").click(function () {
        currentMonth = new Date();
        displayCurrentMonth();
    });

    buildCalHeader();

    getCalendarData().then(async data => {
        await generateMonthView(data);
        setupCreateNewPopup();
    })
}

/**
 * Displays the current month in the event calendar
 */
function displayCurrentMonth() {
    let monthIndex = currentMonth.getMonth();
    let year = currentMonth.getFullYear();
    let monthName = monthNames[monthIndex];
    $("#currentMonthText").text(monthName + " " + year);

    getCalendarData().then(data => {
        generateMonthView(data);
    })
}

/**
 * Builds the header for the event calendar
 */
function buildCalHeader() {
    $(".cal-header").html(daysOfWeek.map(day => {
        return (
            `<div class="grid-header">` +
            `<div class="header-content-container">` +
            `<p>${day}</p>` +
            `</div>` +
            `</div>`
        );
    }).join(""));
}

/**
 * Builds the month view for the event calendar
 */
function generateMonthView(calendarData) {
    const calContainer = document.querySelector('.cal-container');
    $('.cal-container').empty();

    //Define all necessary date variables
    const firstDay = (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 6) % 7;
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonthIndex = today.getMonth();
    const currentYear = today.getFullYear();
    const monthIndex = currentMonth.getMonth();
    const year = currentMonth.getFullYear();

    let dayCounter = 1;
    let leadingDaysCounter = prevMonthLastDay - firstDay + 1;
    let nextMonthCounter = 1;

    const numRows = 5;
    const numCols = 7;

    // Create grid layout
    for (let i = 0; i < numRows; i++) {
        const rowContainer = document.createElement('div');
        rowContainer.classList.add('row-container');

        for (let j = 0; j < numCols; j++) {
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');

            let dayNumber;
            let eventMonth;
            let eventYear;
            let isCurrentMonth = true;

            if (i === 0 && j < firstDay) {
                // Leading days from the previous month
                eventMonth = monthIndex - 1;
                eventYear = (eventMonth < 0) ? year - 1 : year;
                dayNumber = leadingDaysCounter++;
                gridItem.classList.add('other-month');
                isCurrentMonth = false;
            } else if (dayCounter > lastDay) {
                // Trailing days from the next month
                eventMonth = monthIndex + 1;
                eventYear = (eventMonth > 11) ? year + 1 : year;
                dayNumber = nextMonthCounter++;
                gridItem.classList.add('other-month');
                isCurrentMonth = false;
            } else {
                // Days of the current month
                eventMonth = monthIndex;
                eventYear = year;
                dayNumber = dayCounter++;
                isCurrentMonth = true;
            }

            if (dayNumber === currentDay && monthIndex === currentMonthIndex && year === currentYear) {
                gridItem.classList.add('is-today');
            }

            const dayEvents = calendarData.filter(event =>
                new Date(event.startdate).getDate() === dayNumber &&
                new Date(event.startdate).getMonth() === eventMonth &&
                new Date(event.startdate).getFullYear() === eventYear
            );

            const strips = dayEvents.map(event => {
                let iconHTML = "";
                if (event.icon && event.icon.length > 5) {
                    iconHTML = `<img src="${event.icon}" class="strip-icon" alt="calendar icon"/>`;
                }

                return (
                    `<a id="colorStrip" class="color-link" 
                        data-text="${event.text}"
                        data-startdate="${event.startdate}"
                        data-enddate="${event.enddate}"
                        data-id="${event.id}"
                    >
                        <div class="color-strip" style="background-color:${event.color}">               
                            ${iconHTML}
                            <p class="strip-text">${event.text}</p>
                        </div>                      
                    </a>`
                );
            }).join('');

            const createNewLinkHTML = isCurrentMonth ?
                '<a class="new tooltip"><span class="tooltiptext">Create new</span><i class="ri-add-fill"></i></a>' :
                '';

            gridItem.innerHTML =
                '<div class="date-container">' +
                `<p class="date-number">${dayNumber}</p>` +
                '<a class="new tooltip"><span class="tooltiptext">Create new</span>' +
                createNewLinkHTML +
                '</a>' +
                '</div>' +
                `<div class="strip-container">${strips}</div>`;

            rowContainer.appendChild(gridItem);

            const createNewLink = gridItem.querySelector('.new');
            createNewLink.addEventListener('click', function(e) {
                e.preventDefault();
                currentlyClickedDate = new Date(year, monthIndex, dayNumber);

                $("#calendarSelect").val("");
                $("#text").val('').prop("disabled", true);
                $("#starttime").val('').prop("disabled", true);
                $("#endtime").val('').prop("disabled", true);
                $("#allDay").prop("checked", false).prop("disabled", true);
                $("#timeFields").show();
                $("#dateFields").hide();

                let tmpDate = new Date(currentlyClickedDate);
                tmpDate.setDate(tmpDate.getDate() + 1);
                $("#startdate").val(tmpDate.toISOString().slice(0, 10));
                $("#enddate").val(tmpDate.toISOString().slice(0, 10));

                createNewPopup.open(e);
            });
        }

        calContainer.appendChild(rowContainer);
    }

    setupEditPopup();
}

/**
 * Gets the calendar data from the database of the current month
 */
function getCalendarData(){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/calendar/getCalendarData',
            type: 'GET',
            data: {
                date: currentMonth
            },
            dataType: 'json',
            success: function (data) {
                resolve(data);
            },
            error: function (data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                reject(data);
            }
        });
    });
}

/**
 * Sets up the create new popup
 */
function setupCreateNewPopup(){
    createNewPopup = new Popup("popupContainerCreateNew");

    getCalendarOptions().then(function (options) {
        createNewPopup.displayInputPopupCustom("/res/others/plus.png", "Create new Appointment", "Create", "btnCreateNewAppointment",
            '<label for="calendar" class="input-label">Calendar</label>' +
            '<select id="calendarSelect" class="input-field">' +
            '<option value="" disabled selected>Select a Calendar</option>' +
            options +
            '</select>' +
            '<label for="text" class="input-label">Text</label>' +
            '<input type="text" id="text" class="input-field"/>' +
            '<label for="allDay" class="input-label">All Day</label>' +
            '<input type="checkbox" id="allDay" class="input-checkbox input-field"/>' +
            '<div id="timeFields" class="popup-flexbox" style="margin-top: 0">' +
            '<label for="starttime" class="input-label">Start Time</label>' +
            '<input type="time" id="starttime" class="input-field"/>' +
            '<label for="endtime" class="input-label">End Time</label>' +
            '<input type="time" id="endtime" class="input-field"/>' +
            '</div>' +
            '<div id="dateFields" class="popup-flexbox" style="display:none;  margin-top: 0">' +
            '<label for="startdate" class="input-label">Start Date</label>' +
            '<input type="date" id="startdate" class="input-field"/>' +
            '<label for="enddate" class="input-label">End Date</label>' +
            '<input type="date" id="enddate" class="input-field"/>' +
            '</div>'
        )

        $("#allDay").change(function () {
            if ($(this).prop("checked")) {
                $("#timeFields").hide();
                $("#dateFields").show();
            } else {
                $("#timeFields").show();
                $("#dateFields").hide();
            }
        });

        $("#calendarSelect").change(function () {
            $("#text").prop("disabled", false);
            $("#starttime").prop("disabled", false);
            $("#endtime").prop("disabled", false);
            $("#allDay").prop("disabled", false)
        });

        $("#btnCreateNewAppointment").click(function () {
           if ($("#calendarSelect").val() === "") {
               displayError("Please select a calendar!");
               return;
           }

           if ($("#text").val() === "") {
               displayError("Please enter a text!");
               return;
           }

           if ($("#starttime").val() === "" && $("#startdate").val() === "") {
               displayError("Please enter a Start Time/Date!");
               return;
           }

           if ($("#endtime").val() === "" && $("#enddate").val() === "") {
               displayError("Please enter an End Time/Date!");
               return;
           }

           if ($("#starttime").val() > $("#endtime").val()) {
               displayError("Starttime must be before endtime!");
               return;
           }

              if ($("#startdate").val() > $("#enddate").val()) {
                displayError("Startdate must be before Enddate!");
                return;
              }

           insertNewAppointment($("#calendarSelect").val(), $("#text").val(), $("#starttime").val(), $("#endtime").val(), $("#startdate").val(), $("#enddate").val(), $("#allDay").prop("checked"));

           createNewPopup.close();
        });
    });
}

/**
 * Asynchronously retrieves all the available calendars from the database
 * @returns {string}
 */
async function getCalendarOptions() {
    let options = "";

    try {
        let response = await fetch('/calendar/getCalendarDefinitionsWithWriteAccess');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let calendarDefinitions = await response.json();

        for (let x = 0; x < calendarDefinitions.length; x++) {
            options += `<option value="${calendarDefinitions[x].id}">${calendarDefinitions[x].displayname}</option>`;
        }

    } catch (error) {
        console.log('Fetch error: ', error);
    }

    return options;
}

/**
 * Inserts a new appointment into the database
 * @param calendarId
 * @param text
 * @param starttime
 * @param endtime
 * @param startdate
 * @param enddate
 * @param allDay
 */
function insertNewAppointment(calendarId, text, starttime, endtime, startdate, enddate, allDay){
    $.ajax({
        url: '/calendar/insertNewAppointment',
        type: 'POST',
        dataType: 'json',
        data: {
            calendarId: calendarId,
            text: text,
            starttime: starttime,
            endtime: endtime,
            date: currentlyClickedDate,
            startdate: startdate,
            enddate: enddate,
            allDay: allDay
        },
        success: function (data) {
            displaySuccess(data.message);
            getCalendarData().then(function (data) {
                generateMonthView(data)
            });
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message)
        }
    });
}

/**
 * Sets up the edit popup
 */
function setupEditPopup(){
    editPopup = new Popup("popupContainerEdit");

    editPopup.displayInputPopupCustom2Btn("/res/others/edit.png", "Edit Appointment","Delete", "btnDeleteAppointment", "Update", "btnUpdateAppointment",
            '<input type="hidden" id="appointmentIdEdit"/>' +
            '<input type="hidden" id="appointmentFullDateEdit"/>' +
            '<label for="textEdit" class="input-label">Text</label>' +
            '<input type="text" id="textEdit" class="input-field"/>' +
            '<label for="starttimeEdit" class="input-label">Starttime</label>' +
            '<input type="time" id="starttimeEdit" class="input-field"/>' +
            '<label for="endtimeEdit" class="input-label">Endtime</label>' +
            '<input type="time" id="endtimeEdit" class="input-field"/>'
    )

    $(".color-link").click(function (e) {
        const startDate = new Date($(this).attr("data-startdate"))
        const endDate = new Date($(this).attr("data-enddate"))

        const startTime = startDate.getHours().toString().padStart(2, '0') + ":" + startDate.getMinutes().toString().padStart(2, '0');
        const endTime = endDate.getHours().toString().padStart(2, '0') + ":" + endDate.getMinutes().toString().padStart(2, '0');

        $("#textEdit").val($(this).attr("data-text"));
        $("#starttimeEdit").val(startTime);
        $("#endtimeEdit").val(endTime);
        $("#appointmentIdEdit").val($(this).attr("data-id"));
        $("#appointmentFullDateEdit").val($(this).attr("data-startdate"));
        editPopup.open(e)
    });

    $("#btnDeleteAppointment").click(function () {
        deleteAppointment($("#appointmentIdEdit").val());
        editPopup.close();
    });

    $("#btnUpdateAppointment").click(function () {
        const data = {
            id: $("#appointmentIdEdit").val(),
            text: $("#textEdit").val(),
            starttime: $("#starttimeEdit").val(),
            endtime: $("#endtimeEdit").val(),
            date: $("#appointmentFullDateEdit").val()
        }
        updateAppointment(data);
        editPopup.close();
    });
}

/**
 * Deletes an appointment from the database
 */
function deleteAppointment(id){
    $.ajax({
        url: '/calendar/deleteAppointment',
        type: 'POST',
        dataType: 'json',
        data: {
            id: id,
        },
        success: function (data) {
            displaySuccess(data.message);
            getCalendarData().then(function (data) {
                generateMonthView(data)
            });
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message)
        }
    });
}

/**
 * Updates an appointment in the database
 */
function updateAppointment(data){
    $.ajax({
        url: '/calendar/updateAppointment',
        type: 'POST',
        dataType: 'json',
        data: {
            id: data.id,
            text: data.text,
            starttime: data.starttime,
            endtime: data.endtime,
            date: data.date
        },
        success: function (data) {
            displaySuccess(data.message);
            getCalendarData().then(function (data) {
                generateMonthView(data)
            });
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message)
        }
    });
}