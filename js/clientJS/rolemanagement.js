/**
 * This file contains all the functions that are used in the role management page.
 */

let roleData;
let editRoleId;

/**
 * Setup of the create role popup
 */
function setupCreateRolePopup(){
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
function createNewRole(name, desc){
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
function loadData(){
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
                const tdPermissions = $("<td></td>").text("TODO");

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
function editRole(id){
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
function buildPermissionList(data, listRef){
    let listContainer = $("#" + listRef);
    listContainer.empty();

    $.each(data, function(index, value) {
        let listItem = $('<p></p>');
        listItem.text(value.location + " -> " + value.permission);
        listItem.data('id', value.id);
        listItem.on('click', function() {
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
function assignPermission(){
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
function deAssignPermission(){
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
function setupAssignToTeamPopup(){
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

    $("#roleType").change(function() {
        if($(this).val()>0) {
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
                        text : "Select a Team",
                        disabled: true,
                        selected: true
                    }));

                    // Populate the dropdown with the fetched options
                    $.each(data, function (i, item) {
                        $('#team').append($('<option>', {
                            value: item.id,
                            text : item.displayname
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
function getRoleOptions(){
    let options = "";

    for(let x = 0; x < roleData.length; x++){
        options += '<option value="' + roleData[x].id + '">' + roleData[x].displayname + '</option>';
    }

    return options;
}

/**
 * Setup Popup for assigning a role to a user
 */
function setupAssignToUserPopup(){
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
        $("#roleType").val("");
        $("#user").val("").prop("disabled", true);
        popupAssignToUser.open(e);
    });

    $("#btnAssignToUser").click(function () {
        popupAssignToUser.close()
        if ($("#user").val() > 0) {
            assignRole()
        }
    });

    $("#roleType2").change(function() {
        if($(this).val()>0) {
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
                        text : "Select a User",
                        disabled: true,
                        selected: true
                    }));

                    // Populate the dropdown with the fetched options
                    $.each(data, function (i, item) {
                        $('#user').append($('<option>', {
                            value: item.id,
                            text : item.username
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

function setupUnAssignFromTeamPopup(){

}

function setupUnAssignFromUserPopup(){

}

/**
 * Assigns a role to a team or user and saves it in the database
 */
function assignRole(){
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