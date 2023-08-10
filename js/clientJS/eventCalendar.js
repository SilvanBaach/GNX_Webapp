let currentMonth;
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
                '</div>' +
                `<div class="strip-container">${strips}</div>`;

            rowContainer.appendChild(gridItem);
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
