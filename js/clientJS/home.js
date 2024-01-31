/**
 * Displays the next 4 trainings of the team
 * @param teamId
 */
function getNextTrainings(teamId) {
    const url = "/presence/nextTrainings/" + teamId;
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (data) {
            const tableBody = $("#nextTrainingList");
            tableBody.empty();

            const firstFourTrainings = data.slice(0, 4);

            if (firstFourTrainings.length === 0) {
                tableBody.append('<li class="text-md font-bold text-btn-grey">NO DATA FOUND</li>')
            }else{
                firstFourTrainings.forEach(function (training) {
                    let firstDotIndex = training.readable_date.indexOf('.');
                    let secondDotIndex = training.readable_date.indexOf('.', firstDotIndex + 1);
                    const li = $("<li></li>").text(training.readable_date.substring(0, secondDotIndex) + " @ " + training.starttime + " - " + training.endtime);
                    tableBody.append(li);
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

/**
 * Displays the latest 4 patchnotes
 */
function displayPatchNotes() {
    $.ajax({
        url: '/patchnotes/latest',
        type: "GET",
        dataType: "json",
        success: function (data) {
            $('#patchNotesContainer').empty();

            data.forEach(function(patchNote) {
                const formattedDate = new Date(patchNote.date).toLocaleDateString(); // Format the date
                const patchNoteHtml = `
                        <ul class="mb-4">
                            <li>
                                <p class="font-bold">${formattedDate} - ${patchNote.version}</p>
                                <p>${patchNote.text.replace(/\n/g, '<br>')}</p>
                            </li>
                        </ul>
                `;
                $('#patchNotesContainer').append(patchNoteHtml);
            });
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
        }
    });
}

/**
 * Generates a new coupon code
 */
function generateNewCouponCode() {
    $.ajax({
        url: '/wooCommerce/generateCouponCode',
        type: "POST",
        dataType: "json",
        success: function (data) {
            displaySuccess('Your coupon code has been generated successfully!');
            $('#couponCode').text(data.couponCode);
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
        }
    })
}

/**
 * Displays the latest coupon code
 */
function displayLatestCouponCode(){
    $.ajax({
        url: '/wooCommerce/getLatestCouponCode',
        type: "GET",
        dataType: "json",
        success: function (data) {
            $('#couponCode').text(data.couponCode);
        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
        }
    })
}

/**
 * Setup of the Link Shop Popup
 */
function setupLinkShopPopup(){
    const shopPopup = new Popup("popup-container-linkshop");

    let renderedHtml = '';
    $.when(
        fetchEntryField('text', 'usernameShop', 'usernameShop', 'w-52', ''),
        fetchEntryField('password', 'passwordShop', 'passwordShop', 'w-52', '')
    ).then(function(field1, field2) {
        renderedHtml += `<label for="usernameShop" class="input-label">Username</label>`
        renderedHtml += field1[0];
        renderedHtml += `<label for="passwordShop" class="input-label">Password</label>`
        renderedHtml += field2[0];

        shopPopup.displayInputPopupCustom("/res/others/plus.png", "Link your shop account", "Link", "btnLinkShop", renderedHtml);
    });

    $("#linkShop").click(function (e) {
        $("#usernameShop").val('');
        $("#passwordShop").val('');
        shopPopup.open(e);
    });

    $(document).on('click', '#btnLinkShop', function() {
        const username = $('#usernameShop').val();
        const password = $('#passwordShop').val();

        $.ajax({
            url: '/wooCommerce/linkShop',
            method: 'POST',
            data: {
                username: username,
                password: password
            },
            success: function(response) {
                if (response.success) {
                    displaySuccess(response.message);
                }else{
                    displayError(response.message);
                }

            },
            error: function(data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                displayError(data.responseJSON.message);
            }
        }).then(function() {
            $.ajax({
                url: '/wooCommerce/updateSubscriptions',
                type: "GET",
                dataType: "json",
                success: function (data) {
                    setTimeout(function() {
                        window.location.reload();
                    }, 2000);
                },
                error: function (data) {
                    if (data.responseJSON && data.responseJSON.redirect) {
                        window.location.href = data.responseJSON.redirect;
                    }
                }
            })
        });
    });
}