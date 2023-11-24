async function generateCalendar(users, currentDate, sessionUser, teamId, teamManagerId, isAdmin) {
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
                if (users[i].thumbnail) {
                    userImage.src = users[i].thumbnail
                } else {
                    userImage.src = "/res/others/blank_profile_picture.png"
                }
                userImage.classList.add('user-profile-img')

                if (users[i].userid === teamManagerId) {
                    const crownLink = document.createElement('a');
                    const crownSpan = document.createElement('span');
                    crownLink.appendChild(crownSpan);
                    crownSpan.classList.add('tooltiptext-below');
                    crownSpan.innerText = "Team Manager";
                    crownLink.classList.add('tooltip-below');

                    const crown = document.createElement('img');
                    crown.src = "/res/others/crown.png";
                    crown.classList.add('crown');
                    crownLink.appendChild(crown);

                    userNameDiv.appendChild(crownLink);
                }

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
                if (users[i].username === sessionUser || isAdmin) {
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
                if (users[i].username === sessionUser || isAdmin) {
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