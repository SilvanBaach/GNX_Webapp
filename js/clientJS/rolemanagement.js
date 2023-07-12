/**
 * This file contains all the functions that are used in the role management page.
 */

let roleData;

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
    const localRoleData = roleData.filter(role => role.id === id);

    $("#roleEdit").show();

    $("#name").val(localRoleData.displayname);
    $("#description").val(localRoleData.description === "-" ? "" : localRoleData.description);
}