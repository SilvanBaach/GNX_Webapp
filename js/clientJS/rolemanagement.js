/**
 * This file contains all the functions that are used in the role management page.
 */
let roleData;
let editRoleId;

/**
 * Setup of the create role popup
 */
function setupCreateRolePopup() {
    const popupCreateRole = new Popup("popup-containerCreateRole");

    popupCreateRole.displayInputPopupCustom("/res/others/plus.png", "Create Role", "Create", "btnCreateRole",
        `<label for="roleName" class="input-label">Name</label>` +
        `<input type="text" id="roleName" class="input-field"/>` +
        `<label for="roleDescription" class="input-label">Description</label>` +
        `<textarea id="roleDescirption" class="input-field" rows="4" style="height: auto"/>`
    )

    $("#newRole").click(function (e) {
        popupCreateRole.open(e);
    });

    $("#btnCreateRole").click(function () {
        popupCreateRole.close()
        createNewRole($("#roleName").val(), $("#roleDescirption").val());
    });
}

/**
 * Creates a new role in the database
 * @param name
 * @param desc
 */
function createNewRole(name, desc) {
    $.ajax({
        url: "/roletype/createRoleType",
        type: "POST",
        data: {
            name: name,
            description: desc
        },
        cache: false,
        success: function (data) {
            displaySuccess(data.message);
            loadData();
        },
        error: function (data) {
            displayError(data.message);
            console.log(data);
        }
    });
}

/**
 * Loads all the data from the database
 */
function loadData() {
    $.ajax({
        url: "/roletype/getRoleTypes",
        type: "GET",
        cache: false,
        success: function (data) {
            roleData = data;
            const tableBody = $("#roleData");
            tableBody.empty();

            for (let x = 0; x < data.length; x++) {
                const roleType = data[x];
                const tr = $("<tr></tr>");
                const tdName = $("<td></td>").text(roleType.displayname);
                const tdId = $("<td></td>").text(roleType.id);
                const tdDescription = $("<td></td>").text(roleType.description);
                const tdPermissions = $("<td></td>").text(roleType.permissioncount);

                const tdButton = $("<td></td>");
                const button = $("<button></button>");
                button.addClass("default purple table-btn");
                button.append($("<i></i>").addClass("ri-file-edit-line").addClass("ri-2x"));

                button.on("click", function () {
                    const row = $(this).closest("tr");
                    const id = row.find("td:first").text();

                    editRole(id);
                });

                tdButton.append(button);

                tr.append(tdId).append(tdName).append(tdDescription).append(tdPermissions).append(tdButton);
                tableBody.append(tr);
            }

            setupCreateRolePopup();
            setupAssignToTeamPopup();
            setupAssignToUserPopup();
            setupUnAssignFromTeamPopup();
            setupUnAssignFromUserPopup();
            setupDeleteRolePopup();
        },
        error: function (data) {
            console.log(data);
        }
    });
}

/**
 * Loads a role into the edit window
 * @param id the id of the role
 */
function editRole(id) {
    editRoleId = id;
    const localRoleData = roleData.filter(role => parseInt(role.id) === parseInt(id));

    $("#roleEdit").removeClass('edit-box');

    $("#name").val(localRoleData[0].displayname);
    $("#roleTypeId").val(localRoleData[0].id);
    $("#description").val(localRoleData[0].description === "-" ? "" : localRoleData[0].description);

    //Load all unassigned permissions
    $.ajax({
        url: "/permission/getunassignedpermissions",
        data: {
            roleId: id
        },
        type: "GET",
        cache: false,
        success: function (data) {
            //Build the list
            buildPermissionList(data, "scrollableListUnassigned");
        },
        error: function (data) {
            displayError(data.responseText)
        }
    });

    //Load all assigned permissions
    $.ajax({
        url: "/permission/getassignedpermissions",
        data: {
            roleId: id
        },
        type: "GET",
        cache: false,
        success: function (data) {
            //Build the list
            buildPermissionList(data, "scrollableListAssigned");
        },
        error: function (data) {
            displayError(data.responseText)
        }
    });
}

/**
 * Builds a list of permissions
 * @param data
 * @param listRef
 */
function buildPermissionList(data, listRef) {
    let listContainer = $("#" + listRef);
    listContainer.empty();

    $.each(data, function (index, value) {
        let listItem = $('<p></p>');
        listItem.text(value.location + " -> " + value.permission);
        listItem.data('id', value.id);
        listItem.on('click', function () {
            // Remove the 'clicked' class from all child elements of listContainer
            listContainer.children().removeClass('clicked');

            // Add the 'clicked' class to the currently clicked item
            $(this).addClass('clicked');
        });
        listContainer.append(listItem);
    });
}

/**
 * Assigns a permission to a role and saves it in the database
 */
function assignPermission() {
    // Retrieve the id from the clicked line
    const permissiontypeId = $('#scrollableListUnassigned').find('.clicked').data('id');

    // Send ajax request
    $.ajax({
        url: "/permission/assignpermission",
        type: "POST",
        data: {
            roleId: editRoleId,
            permissionTypeId: permissiontypeId
        },
        cache: false,
        success: function (data) {
            displaySuccess("Permission successfully assigned.");
            editRole(editRoleId);
        },
        error: function (data) {
            displayError(data.responseText);
        }
    });
}

/**
 * Assigns a permission to a role and saves it in the database
 */
function deAssignPermission() {
    // Retrieve the id from the clicked line
    const permissiontypeId = $('#scrollableListAssigned').find('.clicked').data('id');

    // Send ajax request
    $.ajax({
        url: "/permission/deassignpermission",
        type: "POST",
        data: {
            roleId: editRoleId,
            permissionTypeId: permissiontypeId
        },
        cache: false,
        success: function (data) {
            displaySuccess("Permission successfully deassigned.");
            editRole(editRoleId);
        },
        error: function (data) {
            displayError(data.responseText);
        }
    });
}

/**
 * Setup Popup for creating assigning a role to a team
 */
function setupAssignToTeamPopup() {
    const popupAssignToTeam = new Popup("popup-containerAssignToTeam");

    popupAssignToTeam.displayInputPopupCustom("/res/others/plus.png", "Assign Role to Team", "Assign", "btnAssignToTeam",
        '<label for="roleType" class="input-label">Role</label>' +
        '<select id="roleType" class="input-field">' +
        '<option value="" disabled selected>Select a Role</option>' +
        getRoleOptions() +
        '</select>' +
        '<label for="team" class="input-label">Team</label>' +
        '<select id="team" class="input-field">' +
        '<option value="" disabled selected>Select a Team</option>' +
        '</select>'
    )

    $("#assignToTeam").click(function (e) {
        $("#roleType").val("");
        $("#team").val("").prop("disabled", true);
        popupAssignToTeam.open(e);
    });

    $("#btnAssignToTeam").click(function () {
        popupAssignToTeam.close()
        if ($("#team").val() > 0) {
            assignRole()
        }
    });

    $("#roleType").change(function () {
        if ($(this).val() > 0) {
            // Enable the '#team' dropdown
            $("#team").prop("disabled", false);

            $.ajax({
                url: "/team/getteamstoassignrole",
                type: "GET",
                data: {
                    roleId: $(this).val()
                },
                cache: false,
                success: function (data) {
                    // Clear the dropdown
                    $('#team').empty();

                    // Add the placeholder
                    $('#team').append($('<option>', {
                        value: "",
                        text: "Select a Team",
                        disabled: true,
                        selected: true
                    }));

                    // Populate the dropdown with the fetched options
                    $.each(data, function (i, item) {
                        $('#team').append($('<option>', {
                            value: item.id,
                            text: item.displayname
                        }));
                    });
                },
                error: function (error) {
                    displayError(error.responseText)
                }
            });

        } else {
            // If no value is selected in '#roleType', disable the '#team' dropdown
            $("#team").prop("disabled", true);
        }
    });

    $("#team").prop("disabled", true);
}

/**
 * Returns a string containing all role options
 * @returns {string}
 */
function getRoleOptions() {
    let options = "";

    for (let x = 0; x < roleData.length; x++) {
        options += '<option value="' + roleData[x].id + '">' + roleData[x].displayname + '</option>';
    }

    return options;
}

/**
 * Asynchronously retrieves team data and returns a string containing all team options
 * @returns {string}
 */
async function getTeamOptions() {
    let options = "";

    try {
        let response = await fetch('/team/getteams');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let teamData = await response.json();

        for (let x = 0; x < teamData.length; x++) {
            options += `<option value="${teamData[x].id}">${teamData[x].displayname}</option>`;
        }

    } catch (error) {
        console.log('Fetch error: ', error);
    }

    return options;
}

/**
 * Asynchronously retrieves user data and returns a string containing all team options
 * @returns {string}
 */
async function getUserOptions() {
    let options = "";

    try {
        let response = await fetch('/user/getusers');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let teamData = await response.json();

        for (let x = 0; x < teamData.length; x++) {
            options += `<option value="${teamData[x].id}">${teamData[x].username}</option>`;
        }

    } catch (error) {
        console.log('Fetch error: ', error);
    }

    return options;
}


/**
 * Setup Popup for assigning a role to a user
 */
function setupAssignToUserPopup() {
    const popupAssignToUser = new Popup("popup-containerAssignToUser");

    popupAssignToUser.displayInputPopupCustom("/res/others/plus.png", "Assign Role to User", "Assign", "btnAssignToUser",
        '<label for="roleType2" class="input-label">Role</label>' +
        '<select id="roleType2" class="input-field">' +
        '<option value="" disabled selected>Select a Role</option>' +
        getRoleOptions() +
        '</select>' +
        '<label for="user" class="input-label">User</label>' +
        '<select id="user" class="input-field">' +
        '<option value="" disabled selected>Select a User</option>' +
        '</select>'
    )

    $("#assignToUser").click(function (e) {
        $("#roleType2").val("");
        $("#user").val("").prop("disabled", true);
        popupAssignToUser.open(e);
    });

    $("#btnAssignToUser").click(function () {
        popupAssignToUser.close()
        if ($("#user").val() > 0) {
            assignRole()
        }
    });

    $("#roleType2").change(function () {
        if ($(this).val() > 0) {
            // Enable the '#team' dropdown
            $("#user").prop("disabled", false);

            $.ajax({
                url: "/user/getuserstoassignrole",
                type: "GET",
                data: {
                    roleId: $(this).val()
                },
                cache: false,
                success: function (data) {
                    // Clear the dropdown
                    $('#user').empty();

                    // Add the placeholder
                    $('#user').append($('<option>', {
                        value: "",
                        text: "Select a User",
                        disabled: true,
                        selected: true
                    }));

                    // Populate the dropdown with the fetched options
                    $.each(data, function (i, item) {
                        $('#user').append($('<option>', {
                            value: item.id,
                            text: item.username
                        }));
                    });
                },
                error: function (error) {
                    displayError(error)
                }
            });

        } else {
            // If no value is selected in '#roleType', disable the '#team' dropdown
            $("#user").prop("disabled", true);
        }
    });

    $("#user").prop("disabled", true);
}

/**
 * Setup Popup for unassigning a role from a team
 */
function setupUnAssignFromTeamPopup() {
    const popupUnAssignFromTeam = new Popup("popup-containerUnAssignFromTeam");
    getTeamOptions().then(function (options) {

        popupUnAssignFromTeam.displayInputPopupCustom("/res/others/alert.png", "Remove Role from Team", "Remove", "btnUnAssignFromTeam",
            '<label for="roleType2" class="input-label">Team</label>' +
            '<select id="teamdropdown" class="input-field">' +
            '<option value="" disabled selected>Select a Team</option>' +
            options +
            '</select>' +
            '<label for="role" class="input-label">Role</label>' +
            '<select id="roledropdown" class="input-field">' +
            '<option value="" disabled selected>Select a Role</option>' +
            '</select>'
        )

        $("#unassignFromTeam").click(function (e) {
            $("#teamdropdown").val("");
            $("#roledropdown").val("").prop("disabled", true);
            popupUnAssignFromTeam.open(e);
        });

        $("#btnUnAssignFromTeam").click(function () {
            if ($("#roledropdown").val() > 0) {
                popupUnAssignFromTeam.close()
                unAssignRole()
            }
        }).addClass('red').removeClass('green');

        $("#teamdropdown").change(function() {
            if($(this).val()>0) {
                // Enable the '#role' dropdown
                $("#roledropdown").prop("disabled", false);

                $.ajax({
                    url: "/roletype/getRoleTypesByTeam",
                    type: "GET",
                    data: {
                        teamId: $(this).val()
                    },
                    cache: false,
                    success: function (data) {
                        // Clear the dropdown
                        $('#roledropdown').empty();

                        // Add the placeholder
                        $('#roledropdown').append($('<option>', {
                            value: "",
                            text: "Select a Role",
                            disabled: true,
                            selected: true
                        }));

                        // Populate the dropdown with the fetched options
                        $.each(data, function (i, item) {
                            $('#roledropdown').append($('<option>', {
                                value: item.id,
                                text: item.displayname
                            }));
                        });
                    },
                    error: function (error) {
                        displayError(error)
                    }
                });
            } else {
                // If no value is selected in '#roleType', disable the '#team' dropdown
                $("#roledropdown").prop("disabled", true);
            }
        });

        $("#roledropdown").prop("disabled", true);
    });
}

function setupUnAssignFromUserPopup() {
    const popupUnAssignFromUser = new Popup("popup-containerUnAssignFromUser");
    getUserOptions().then(function (options) {

        popupUnAssignFromUser.displayInputPopupCustom("/res/others/alert.png", "Remove Role from User", "Remove", "btnUnAssignFromUser",
            '<label for="userdropdown" class="input-label">User</label>' +
            '<select id="userdropdown" class="input-field">' +
            '<option value="" disabled selected>Select a User</option>' +
            options +
            '</select>' +
            '<label for="roledropdown2" class="input-label">Role</label>' +
            '<select id="roledropdown2" class="input-field">' +
            '<option value="" disabled selected>Select a Role</option>' +
            '</select>'
        )

        $("#unassignFromUser").click(function (e) {
            $("#userdropdown").val("");
            $("#roledropdown2").val("").prop("disabled", true);
            popupUnAssignFromUser.open(e);
        });

        $("#btnUnAssignFromUser").click(function () {
            if ($("#roledropdown2").val() > 0) {
                popupUnAssignFromUser.close()
                unAssignRole()
            }
        }).addClass('red').removeClass('green');

        $("#userdropdown").change(function() {
            if($(this).val()>0) {
                // Enable the '#role' dropdown
                $("#roledropdown2").prop("disabled", false);

                $.ajax({
                    url: "/roletype/getRoleTypesByUser",
                    type: "GET",
                    data: {
                        userId: $(this).val()
                    },
                    cache: false,
                    success: function (data) {
                        // Clear the dropdown
                        $('#roledropdown2').empty();

                        // Add the placeholder
                        $('#roledropdown2').append($('<option>', {
                            value: "",
                            text: "Select a Role",
                            disabled: true,
                            selected: true
                        }));

                        // Populate the dropdown with the fetched options
                        $.each(data, function (i, item) {
                            $('#roledropdown2').append($('<option>', {
                                value: item.id,
                                text: item.displayname
                            }));
                        });
                    },
                    error: function (error) {
                        displayError(error)
                    }
                });
            } else {
                // If no value is selected in '#roleType', disable the '#team' dropdown
                $("#roledropdown2").prop("disabled", true);
            }
        });

        $("#roledropdown2").prop("disabled", true);
    });
}

/**
 * Removes a role to a team or user and saves it in the database
 */
function unAssignRole() {
    let roleId = $("#roledropdown").val();
    if (!roleId) {
        roleId = $("#roledropdown2").val();
    }
    const teamId = $("#teamdropdown").val();
    const userId = $("#userdropdown").val();

    $.ajax({
        url: "/roleType/unassignrole",
        type: "POST",
        data: {
            roleId: roleId,
            teamId: teamId,
            userId: userId
        },
        cache: false,
        success: function (data) {
            displaySuccess(data);
        },
        error: function (error) {
            displayError(error.responseText)
        }
    });
}

/**
 * Assigns a role to a team or user and saves it in the database
 */
function assignRole() {
    let roleId = $("#roleType").val();
    if (roleId == null || roleId == "") {
        roleId = $("#roleType2").val();
    }
    const teamId = $("#team").val();
    const userId = $("#user").val();

    $.ajax({
        url: "/roleType/assignrole",
        type: "POST",
        data: {
            roleId: roleId,
            teamId: teamId,
            userId: userId
        },
        cache: false,
        success: function (data) {
            displaySuccess(data);
        },
        error: function (error) {
            displayError(error.responseText)
        }
    });
}

/**
 * Deletes a role from the database
 */
function deleteRole(){
    $.ajax({
        url: "/roletype/delete",
        type: "POST",
        data: {
            roleTypeId: editRoleId
        },
        cache: false,
        success: function (data) {
            $("#roleEdit").addClass('edit-box');
            loadData();
            displaySuccess(data.message);
        },
        error: function (error) {
            displayError(error.responseText)
        }
    });
}

/**
 * Sets up the popup for deleting a role
 */
function setupDeleteRolePopup(){
    const popupDeleteRole = new Popup("popup-containerDeleteRole");
    popupDeleteRole.displayYesNoPopup("/res/others/alert.png", "Delete Role", "Are you sure you want to delete this role?", "Yes", "No", "btnDeleteRole", "btnNoDeleteRole");

    $("#deleteRole").click(function (e) {
        popupDeleteRole.open(e);
    });

    $("#btnDeleteRole").click(function () {
        popupDeleteRole.close()
        deleteRole()
    });

    $("#btnNoDeleteRole").click(function () {
        popupDeleteRole.close()
    });
}