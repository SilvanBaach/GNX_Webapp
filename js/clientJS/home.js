function getNextTrainings(teamId) {
    const url = "/presence/nextTrainings/" + teamId;
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
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
                    if (training.trainingtype === "fixed") {
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
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
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
        dataType: "json",
        success: function (data) {
            const online = $("#onlineMembers");
            const totalMembers = $("#totalMembers")

            online.text(data.members.onlineMembers + " online")
            totalMembers.text(data.members.totalMembers + " members");
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
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
        dataType: "json",
        success: function (data) {
            const online = $("#onlineMembersW");
            const totalMembers = $("#totalMembersW")

            online.text(data.onlineMembers + " online")
            totalMembers.text(data.totalMembers + " members");
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
        }
    });
}

/**
 * Setup of the Discord Popup
 * Only opens if the user has not set a discord tag yet
 */
function setupDiscordPopup(discordTag) {
    if (!discordTag) {
        const insertDiscordNamePopup = new Popup("popup-containerEnterDiscord");

        insertDiscordNamePopup.displayInputPopupCustom("/res/others/plus.png", "Setup your connection to Discord", "Save", "btnSaveDiscord",
            '<label for="discord" class="input-label">Discordname</label>' +
            '<input type="text" id="discord" class="input-field"/>'
        )

        $('#btnSaveDiscord').click(function () {
            $.ajax({
                url: '/user/setDiscordTag',
                type: "POST",
                data: {
                    discord: $('#discord').val()
                },
                dataType: "json",
                success: function (data) {
                    displaySuccess('Your connection with discord has been established successfully!');
                    displayInfo('You can manage your discord notifications in your profile settings')
                },
                error: function (data) {
                    if (data.responseJSON && data.responseJSON.redirect) {
                        window.location.href = data.responseJSON.redirect;
                    }
                }
            })

          insertDiscordNamePopup.close();
        })

        insertDiscordNamePopup.open();
    }
}