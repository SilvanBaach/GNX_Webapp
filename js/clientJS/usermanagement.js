async function loadRegistrationCodeTable(){
    await $.ajax({
        url: "/registrationcode/getregistrationcodes",
        type: "GET",
        cache: false,
        dataType: "json",
        success: function(data) {
            const tableBody = $("#registration-codes-table tbody");
            tableBody.empty();

            data.forEach(function(registrationCode) {
                const tr = $("<tr></tr>");
                const tdCode = $("<td></td>").text(registrationCode.code);
                const tdExpiration = $("<td></td>").text(registrationCode.validuntil);
                const tdUsed = $("<td></td>").text(registrationCode.used);
                const tdTeam = $("<td></td>").text(registrationCode.teamname);
                const tdValid = $("<td></td>");

                const statusIndicator = $("<div></div>").addClass("status-indicator");
                if (registrationCode.valid) {
                    statusIndicator.addClass("status-green");
                } else {
                    statusIndicator.addClass("status-red");
                }
                tdValid.append(statusIndicator)

                const tdButton = $("<td></td>");
                const button = $("<button></button>");
                if (registrationCode.valid) {
                    button.addClass("default table-btn");
                    button.append($("<i></i>").addClass("ri-close-circle-line").addClass("ri-2x"));

                } else {
                    button.addClass("default purple table-btn");
                    button.append($("<i></i>").addClass("ri-refresh-line ").addClass("ri-2x"));
                }

                button.on("click", function(e) {
                    const row = $(this).closest("tr");
                    const code = row.find("td:first").text(); // Get the code from the first column

                    // Call your method with the code and teamName variables
                    regCodeButtonAction(code, registrationCode.valid, e);
                });

                tdButton.append(button);

                tr.append(tdCode).append(tdExpiration).append(tdUsed).append(tdTeam).append(tdValid).append(tdButton);
                tableBody.append(tr);
            });

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error fetching registration codes:", errorThrown);
        }
    });
}

async function fetchTeamTypes() {
    const dropdownOptions = [];
    try {
        return await $.ajax({
            url: '/teamtype/getteamtypeOptions',
            type: 'GET',
            dataType: 'json'
        });
    } catch (error) {
        console.error("ups");
        return dropdownOptions;
    }
}

function regCodeButtonAction(code, valid, event) {
    //Display a popup to confirm the action
    const question = valid ? "Do you really want to deactivate this registration code?" : "Do you really want to reactivate this registration code?";
    const popup = new Popup("popup-containerYesNo");
    popup.displayYesNoPopup("/res/others/question_blue.png", "Are you sure?", question, "Yes", "No", "btnYes", "btnNo");
    popup.open(event);

    $("#btnNo").click(function (e) {
        popup.close(e);
    });

    $("#btnYes").click(function (e) {
        popup.close(e);
        updateRegisterCode(code, valid);
    });
}

async function updateRegisterCode(code, valid){
    await $.ajax({
        url: "/registrationcode/updateRegistrationCode/" + code + "/" + valid,
        type: "POST",
        success: function (data) {

        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error deactivating registration code:", errorThrown);
        }
    });

    await loadRegistrationCodeTable();
}

let userData;
async function loadUserTable() {
    await $.ajax({
        url: "/user/getusers",
        type: "GET",
        cache: false,
        dataType: "json",
        success: function (data) {
            userData = data;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error fetching registration codes:", errorThrown);
        }
    })

    buildUserTable();
}

function buildUserTable(){
    const tableBody = $("#user-table tbody");
    tableBody.empty();

    userData.forEach(function(account) {
        const tr = $("<tr></tr>");
        const tdUsername = $("<td></td>").text(account.username);
        const tdTeam = $("<td></td>").text(account.team_displayname);
        const tdFullname = $("<td></td>").text(account.fullname);

        // Create an img element with the picture URL and onerror event handler
        if (account.picture === '-') {
            account.picture = "/res/others/blank-profile-picture.png";
        }

        const img = $("<img>").attr("src", account.picture);

        img.addClass("profile-picture");

        // Create a td element and append the img element to it
        const tdPicture = $("<td></td>").addClass("text-center").append(img);

        // Create a td element with a button and icon
        const tdButton = $("<td></td>");
        const button = $("<button></button>").addClass("default purple table-btn");
        const icon = $("<i></i>").addClass("ri-file-edit-line").addClass("ri-2x");

        button.on("click", function() {
            const row = $(this).closest("tr");
            const username = row.find("td:first").text(); // Get the username from the first column
            editUser(username);
        });

        button.append(icon);
        tdButton.append(button);

        tr.append(tdUsername).append(tdTeam).append(tdFullname).append(tdPicture).append(tdButton);
        tableBody.append(tr);
    });
}

function editUser(username) {
    const user = userData.find((user) => user.username === username);
    if (user) {
        // Show the edit box
        $(".edit-box").show();

        // Fill in the input values
        $("#fullName").val(user.fullname === "-" ? "" : user.fullname);
        $("#email").val(user.email === "-" ? "" : user.email);
        $("#phone").val(user.phone === "-" ? "" : user.phone);
        $("#username").val(user.username === "-" ? "" : user.username);
        $("#street").val(user.street === "-" ? "" : user.street);
        $("#city").val(user.city === "-" ? "" : user.city);
        $("#zip").val(user.zip === "-" ? "" : user.zip);
        $("#password").val("");
        $("#userid").val(user.id);
    }
}

function deleteUser(e){
    const popup = new Popup("popup-containerYesNoDelUser");
    popup.displayYesNoPopup("/res/others/question_blue.png","Warning","Are you sure you want to delete this user?", "Yes", "No", "delUserYes","delUserNo");
    popup.open(e);

    $("#delUserNo").click(function (e) {
        popup.close(e);
    });

    $("#delUserYes").click(function (e) {
        popup.close(e);
        const username = $("#username").val();
        $.ajax({
            url: "/user/deleteUser/" + username,
            type: "POST",
            success: function (data) {
                $(".edit-box").hide();
                loadUserTable();
                displaySuccess("User deleted successfully!")
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error deleting user:", errorThrown);
                displayError("Error deleting user! Try reloading the page.")
            }
        });
    });
}

function updateUser(){
    const form = document.getElementById('form');
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
        if(value) {
            data[key] = value;
        }
    }

    $.ajax({
        url: "/user/updateUser/" + $("#userid").val(),
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function (data) {
            $(".edit-box").hide();
            loadUserTable();
            displaySuccess("User updated successfully!")
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error updating user:", errorThrown);
            displayError("Error updating user! Try reloading the page.")
        }
    });
}