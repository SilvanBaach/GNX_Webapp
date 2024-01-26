/**
 * Checks if the password is secure enough
 * @param password
 * @returns {boolean}
 */
function isPasswordSecure(password) {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
}

/**
 * Setup of the settings page
 */
function setupSettingsPage() {
    $("#deleteUser").click(function () {
        displayError("Sorry, this feature is not available yet!");
    });

    $('#updateBtn').click(function (e) {
        e.preventDefault();
        const formData = {
            fullName: $('#fullname').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            username: $('#username').val(),
            street: $('#street').val(),
            city: $('#city').val(),
            zip: $('#zipcode').val(),
            steam: $('#steam').val(),
            origin: $('#origin').val(),
            riotgames: $('#riotgames').val(),
            discord: $('#discord').val(),
            trainingdatareminder: $('#dcNotiYes').is(':checked') ? 1 : 0
        };

        if (formData.fullName === "" || formData.email === "" || formData.username === "") {
            displayError("Please fill out all required fields!");
        } else {
            updateUserInfo(formData);
        }
    });

    $('#linkedAccountsForm').submit(function (e) {
        e.preventDefault();
        const formData = {
            steam: $('#steam').val(),
            origin: $('#origin').val(),
            riotgames: $('#riotgames').val(),
            discord: $('#discord').val()
        };

        updateUserInfo(formData);
    });
}

/**
 * Updates the user information for personal information and address
 * @param formData
 */
function updateUserInfo(formData) {
    $.ajax({
        url: '/user/updateUser/-1',
        method: 'POST',
        dataType: "json",
        data: formData,
        success: function (response) {
            displaySuccess(response.message);
            checkLinkedAccounts(formData.discord, formData.steam, formData.origin, formData.riotgames)

            if (formData.username !== $('#usernameBig').text()) {
                $('#usernameBig').text(formData.username);
            }

        },
        error: function (data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message);
        }
    });
}

/**
 * Setup of the password reset popup
 */
function setupPWResetPopup(){
    const pwResetPopup = new Popup("popup-containerResetPassword");

    let renderedHtml = '';
    $.when(
        fetchEntryField('password', 'password1', 'password1', 'w-52', ''),
        fetchEntryField('password', 'password2', 'password2', 'w-52', '')
    ).then(function(field1, field2) {
        renderedHtml += `<label for="password1" class="input-label">New Password</label>`
        renderedHtml += field1[0];
        renderedHtml += `<label for="password2" class="input-label">Confirm Password</label>`
        renderedHtml += field2[0];

        pwResetPopup.displayInputPopupCustom("/res/others/plus.png", "Set new Password", "Confirm", "btnResetPassword", renderedHtml);
    });

    $("#resetPassword").click(function (e) {
        $('#password1').val('');
        $('#password2').val('');
        pwResetPopup.open(e)
    });

    $(document).on('click', '#btnResetPassword', function() {
        const password1 = $('#password1').val();
        const password2 = $('#password2').val();

        if (password1 !== password2) {
            displayError("Passwords do not match!");
            return;
        }
        if (!isPasswordSecure(password1)) {
            displayError("Password is not secure enough!");
            return;
        }

        $.ajax({
            url: '/user/updatePassword',
            method: 'POST',
            dataType: "json",
            data: {
                password: password1,
                password2: password2
            },
            success: function(response) {
                displaySuccess(response.message);
            },
            error: function(data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                displayError(data.responseJSON.message);
            }
        });

        pwResetPopup.close();
    });
}

/**
 * Setup of the notification popup
 */
function setupNotificationPopup(value){
    const notificationPopup = new Popup("popup-containerManageNotifications");

    notificationPopup.displayInputPopupCustom("/res/others/edit.png", "Edit Notification Settings", "Update", "btnUpdateNotifications",
        '<label for="password1" class="input-label">Trainingdata Discord Reminder</label>' +
        '<div id="notificationOption" class="notification-container">' +
        '<div class="radio-option">' +
        '<input type="radio" id="allow" name="notification" value="1" class="radio-input">' +
        '<label for="allow" class="radio-label">Allow</label>' +
        '</div>' +
        '<div class="radio-option">' +
        '<input type="radio" id="block" name="notification" value="0" class="radio-input">' +
        '<label for="block" class="radio-label">Block</label>' +
        '</div>' +
        '</div>'
    )

    $("#manageNotifications").click(function (e) {
        notificationPopup.open(e)
    });

    $(`input[name="notification"][value=${value}]`).prop('checked', true);

    $("#btnUpdateNotifications").click(function (e) {
        const formData = {
            trainingdatareminder: $('input[name="notification"]:checked').val()
        };

        updateUserInfo(formData);
        notificationPopup.close();
    });
}

/**
 * Loads the full user picture
 */
function loadUserPicture(){
    $.ajax({
        url: '/user/getUserPicture',
        method: 'GET',
        dataType: "json",
        success: function(response) {
            if(response[0].picture !== null && response[0].picture.length > 10){
                $('#userImage').attr("src", response[0].picture);
            }
        },
        error: function(data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message);
        }
    });
}

/**
 * Setup code for the Link GNX account popup
 */
function setupLinkShopAccountPopup(){
    const linkShopAccountPopup = new Popup("popup-containerLinkShopAccount");

    linkShopAccountPopup.displayInputPopupCustom("/res/logo/GNXClothingLogo.png", "Link GNX Clothing Account", "Link", "btnLinkShopAccount",
        '<label for="usernameShop" class="input-label">Username</label>' +
        '<input type="text" id="usernameShop" class="input-field"/>' +
        '<label for="password" class="input-label">Password</label>' +
        '<input type="password" id="password" class="input-field"/>'
    )

    $("#btnLinkShopAccount").click(function () {
        $.ajax({
            url: '/wooCommerce/linkShopAccount',
            method: 'POST',
            dataType: "json",
            data: {
                username: $('#usernameShop').val(),
                password: $('#password').val()
            },
            success: function (message) {
                displaySuccess(message.message)
                updateShopButton(999)
            },
            error: function (data) {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                displayError(data.responseJSON.message);
            }
        })

        linkShopAccountPopup.close();
    });

    $(document).on('click', '#linkShoppAccount', function(e) {
        $('#usernameShop').val('');
        $('#password').val('');
        linkShopAccountPopup.open(e);
    });
}

/**
 * Setup code for the unLink GNX account popup
 */
function setupUnlinkShopAccountPopup(userId){
    const unlinkShopAccountPopup = new Popup("popup-containerUnlinkShopAccount");

    unlinkShopAccountPopup.displayYesNoPopup("/res/logo/GNXClothingLogo.png", "Unlink Account", "Do you really want to unlink you GNX Clothing account?",
        "Yes", "No", "btnUnlinkShopAccount", "btnCancelUnlinkShopAccount")

    $(document).on('click', '#unlinkShoppAccount', function(e) {
        unlinkShopAccountPopup.open(e);
    });

    $("#btnUnlinkShopAccount").click(function () {
        updateUserInfo({wpuserid: 0, wptoken: "", wprefreshtoken: ""});
        updateShopButton(0)
        unlinkShopAccountPopup.close();
    });

    $("#btnCancelUnlinkShopAccount").click(function () {
        unlinkShopAccountPopup.close();
    });
}

/**
 * Updates the GNX Clothing account button
 * @param wpUserId
 */
function updateShopButton(wpUserId) {
    const $button = $('.shop');

    if (wpUserId === 0) {
        $button.text('Link GNX Clothing Account')
            .removeClass('red')
            .addClass('green')
            .attr('id', 'linkShoppAccount');
    } else {
        $button.text('Unlink GNX Clothing Account')
            .removeClass('green')
            .addClass('red')
            .attr('id', 'unlinkShoppAccount');
    }
}

/**
 * This function checks the linked accounts
 */
function checkLinkedAccounts(discord, steam, origin, riotgames){
    checkDiscordLinking(discord);
    //Here we can add more checks
}

/**
 * This function checks if the discord account is linked correctly
 */
function checkDiscordLinking(discord){
    $.ajax({
        url: '/discordbot/isDiscordNameValid',
        type: 'GET',
        data: { username: discord },
        success: function(response) {
            // Handle success response
            if (!response.isValid) {
                displayError('Your discord name is not valid, please change it in your profile settings!')
            }
        },
        error: function(xhr, status, error) {
            // Handle error response
            console.error('Error occurred: ' + error);
        }
    });
}
