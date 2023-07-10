function getNextTrainings(teamId) {
    const url = "/presence/nextTrainings/" + teamId;
    $.ajax({
        url: url,
        type: "GET",
        success: function (data) {
            const tableBody = $("#training-column tbody");
            tableBody.empty();

            const firstTwoTrainings = data.slice(0, 4); // Extract first two elements from the data array

            if (firstTwoTrainings.length === 0) {
                const noDataText = $("<td></td>").attr('colspan', 4).addClass('no-data-found').text('NO DATA FOUND');
                const tr = $("<tr></tr>").append(noDataText);
                tableBody.append(tr);
            } else {
                firstTwoTrainings.forEach(function (training) {
                    const tr = $("<tr></tr>");
                    const tdDate = $("<td></td>").text(training.readable_date);
                    const tdFrom = $("<td></td>").text(training.starttime);
                    const tdUntil = $("<td></td>").text(training.endtime);
                    const tdType = $("<td></td>");

                    const statusIndicator = $("<div></div>").addClass("status-indicator");
                    if (training.trainingtype === "sure") {
                        statusIndicator.addClass("status-green");
                    } else {
                        statusIndicator.addClass("status-orange");
                    }
                    tdType.append(statusIndicator)

                    tr.append(tdDate).append(tdFrom).append(tdUntil).append(tdType);
                    tableBody.append(tr);
                });
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/**
 * Setup of the Swiper picture gallery
 * @returns {Swiper}
 */
function setupSwiper() {
    const swiper = new Swiper('.swiper', {
        // Optional parameters
        direction: 'horizontal',
        loop: true,

        // Navigation arrows
        pagination: {
            el: '.swiper-pagination',
        },

        autoplay: {
            delay: 3500, // time delay between slides change
            disableOnInteraction: false, // continue autoplay after user interactions
        }
    });

    return swiper;
}

/**
 * Loads the Discord Member Count
 */
function loadDiscordMembers() {
    $.ajax({
        url: '/discordbot/discord-members',
        type: "GET",
        success: function (data) {
            const online = $("#onlineMembers");
            const totalMembers = $("#totalMembers")

            online.text(data.members.onlineMembers + " online")
            totalMembers.text(data.members.totalMembers + " members");
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/**
 * Loads the Webapp Member Count
 */
function loadWebappMembers() {
    $.ajax({
        url: '/user/getWebappMemberCount',
        type: "GET",
        success: function (data) {
            const online = $("#onlineMembersW");
            const totalMembers = $("#totalMembersW")

            online.text(data.onlineMembers + " online")
            totalMembers.text(data.totalMembers + " members");
        },
        error: function (data) {
            console.log(data);
        }
    });
}