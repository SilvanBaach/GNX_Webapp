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
        displayError("Uh oh - thats dangerous!");
    });

    $('#formAdress').submit(function (e) {
        e.preventDefault();
        const formData = {
            fullName: $('#fullName').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            username: $('#username').val(),
            street: $('#street').val(),
            city: $('#city').val(),
            zip: $('#zipcode').val()
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

            if (formData.username !== $('#usernameBig').text()) {
                $('#usernameBig').text(formData.username);
            }
        },
        error: function (error) {
            displayError(error.responseJSON.message);
        }
    });
}

/**
 * Setup of the password reset popup
 */
function setupPWResetPopup(){
    const pwResetPopup = new Popup("popup-containerResetPassword");

    pwResetPopup.displayInputPopupCustom("/res/others/plus.png", "Set new Password", "Confirm", "btnResetPassword",
        '<label for="password1" class="input-label">New Password</label>' +
        '<input type="password" id="password1" class="input-field"/>' +
        '<label for="password2" class="input-label">Confirm Password</label>' +
        '<input type="password" id="password2" class="input-field"/>'
    )

    $("#resetPassword").click(function (e) {
        $('#password1').val('');
        $('#password2').val('');
        pwResetPopup.open(e)
    });

    $("#btnResetPassword").click(function (e) {
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
            error: function(error) {
                displayError(error.responseJSON.message);
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