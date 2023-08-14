let currentMonth;
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let createNewPopup;
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

    setupCreateNewPopup();

    getCalendarData().then(data => {
        generateMonthView(data);
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

            if (i === 0 && j < firstDay) {
                // Leading days from the previous month
                dayNumber = leadingDaysCounter++;
                gridItem.classList.add('other-month');
            } else if (dayCounter > lastDay) {
                // Trailing days from the next month
                dayNumber = nextMonthCounter++;
                gridItem.classList.add('other-month');
            } else {
                // Days of the current month
                dayNumber = dayCounter++;
            }

            if (dayNumber === currentDay && monthIndex === currentMonthIndex && year === currentYear) {
                gridItem.classList.add('is-today');
            }

            const dayEvents = calendarData.filter(event => new Date(event.startdate).getDate() === dayNumber && new Date(event.startdate).getMonth() === monthIndex);

            const strips = dayEvents.map(event => {
                let iconHTML = "";
                if (event.icon && event.icon.length > 5) {
                    iconHTML = `<img src="${event.icon}" class="strip-icon" alt="calendar icon"/>`;
                }

                return (
                    `<div class="color-strip" style="background-color:${event.color}">
                        ${iconHTML}
                        <p class="strip-text">${event.text}</p>
                    </div>`
                );
            }).join('');


            gridItem.innerHTML =
                '<div class="date-container">' +
                `<p class="date-number">${dayNumber}</p>` +
                '<a class="new tooltip"><span class="tooltiptext">Create new</span>' +
                '<i class="ri-add-fill"></i></a>' +
                '</div>' +
                `<div class="strip-container">${strips}</div>`;

            rowContainer.appendChild(gridItem);

            const createNewLink = gridItem.querySelector('.new');
            createNewLink.addEventListener('click', function(e) {
                e.preventDefault();
                $("#calendarSelect").val("");
                $("#text").val('').prop("disabled", true);
                $("#starttime").val('').prop("disabled", true);
                $("#endtime").val('').prop("disabled", true);
                createNewPopup.open(e);
                currentlyClickedDate = new Date(year, monthIndex, dayNumber);
            });
        }

        calContainer.appendChild(rowContainer);
    }
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
            '<label for="starttime" class="input-label">Starttime</label>' +
            '<input type="time" id="starttime" class="input-field"/>' +
            '<label for="endtime" class="input-label">Endtime</label>' +
            '<input type="time" id="endtime" class="input-field"/>'
        )

        $("#calendarSelect").change(function () {
            $("#text").prop("disabled", false);
            $("#starttime").prop("disabled", false);
            $("#endtime").prop("disabled", false);
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

           if ($("#starttime").val() === "") {
               displayError("Please enter a starttime!");
               return;
           }

           if ($("#endtime").val() === "") {
               displayError("Please enter an endtime!");
               return;
           }

           if ($("#starttime").val() > $("#endtime").val()) {
               displayError("Starttime must be before endtime!");
               return;
           }

           insertNewAppointment($("#calendarSelect").val(), $("#text").val(), $("#starttime").val(), $("#endtime").val());

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
 */
function insertNewAppointment(calendarId, text, starttime, endtime){
    $.ajax({
        url: '/calendar/insertNewAppointment',
        type: 'POST',
        dataType: 'json',
        data: {
            calendarId: calendarId,
            text: text,
            starttime: starttime,
            endtime: endtime,
            date: currentlyClickedDate
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