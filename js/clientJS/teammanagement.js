dataAccessors = {
    team: [],
    teamType: [],
    get teamData(){
        return this.team
    },

    get teamTypeData(){
        return this.teamType
    },

    set teamData(data){
        this.team = data
    },
    set teamTypeData(data){
        this.teamType = data
    }
}

let teamPager;
let teamTypePager;

function setupPagination() {
    teamPager = $("#teamPager").anyPaginator({
        itemsPerPage: 5,
        mode: 1,
        hideGoto: true,
        prevText: "&lsaquo; Previous",
        nextText: "Next &rsaquo;",
        hideIfOne: false,
        onClick: buildTeamTable,
    });

    teamPager.numItems(dataAccessors.teamData.length)
    buildTeamTable()

    teamTypePager = $("#teamTypePager").anyPaginator({
        itemsPerPage: 5,
        mode: 1,
        hideGoto: true,
        prevText: "&lsaquo; Previous",
        nextText: "Next &rsaquo;",
        hideIfOne: false,
        onClick: buildTeamTypeTable,
    });

    teamTypePager.numItems(dataAccessors.teamTypeData.length)
    buildTeamTypeTable()
}

async function popupSetup() {
    //Create Popups for Team / Type Creation
    const popupTeam = new Popup("popup-containerTeam");
    const popupTeamType = new Popup("popup-containerTeamType");

    await loadTeams();
    await loadTeamTypes();

    popupTeam.displayInputPopupCustom("/res/others/plus.png", "Create Team", "Create", "btnCreateTeam",
        `<label for="TeamName" class="input-label">Name</label>` +
        `<input type="text" id="teamName" class="input-field"/>` +
        `<label for="teamType" class="input-label">Type</label>` +
        `<select id="teamType" class="input-field">` +
        getTeamTypeOptions() +
        `</select>` +
        `<label for="teamWeight" class="input-label">Weight</label>` +
        `<input type="number" id="teamWeight" class="input-field"/>`
    )

    popupTeamType.displayInputPopupCustom("/res/others/plus.png", "Create Team Type", "Create", "btnCreateTeamType",
        `<label for="TeamTypeName" class="input-label">Internal Name</label>` +
        `<input type="text" id="teamTypeName" class="input-field"/>` +
        `<label for="teamTypeDisplayName" class="input-label">Display Name</label>` +
        `<input type="text" id="teamTypeDisplayName" class="input-field"/>`
    )

    $("#newTeam").click(function (e) {
        popupTeam.open(e);
    });

    $("#newTeamType").click(function (e) {
        popupTeamType.open(e);
    });

    $("#btnCreateTeam").click(function (e) {
        createTeam(e, popupTeam);
    });

    $("#btnCreateTeamType").click(function (e) {
        createTeamType(e, popupTeamType);
    });

    setupPagination();
}

async function loadTeams() {
    await $.ajax({
        url: "/team/getteams",
        type: "GET",
        cache: false,
        success: function (data) {
            dataAccessors.teamData = data;
        },
        error: function (data) {
            console.log(data);
        }
    });
}

async function loadTeamTypes() {
    await $.ajax({
        url: "/teamtype/getteamtypes",
        type: "GET",
        cache: false,
        success: function (data) {
            dataAccessors.teamTypeData = data;
        },
        error: function (data) {
            console.log(data);
        }
    });
}

async function buildTeamTable() {
    await loadTeams()
    teamPager.numItems(dataAccessors.teamData.length)

    const tableBody = $("#teamData");
    tableBody.empty();

    let start = (teamPager.currentPage() - 1) * teamPager.options.itemsPerPage;
    let stop = start + teamPager.options.itemsPerPage - 1;


    for (let i = start; i <= stop; i++) {
        team = dataAccessors.teamData[i];
        if (!team) break;

        const tr = $("<tr></tr>");
        const tdInternalName = $("<td></td>").text(team.displayname);
        const tdType = $("<td></td>").text(dataAccessors.teamTypeData.find((teamtype) => teamtype.id === team.teamtype_fk).displayname);
        const tdWeight = $("<td></td>").text(team.weight);

        const tdButton = $("<td></td>");
        const button = $("<button></button>");
        button.addClass("default purple table-btn");
        button.append($("<i></i>").addClass("ri-file-edit-line").addClass("ri-2x"));

        button.on("click", function () {
            const row = $(this).closest("tr");
            const name = row.find("td:first").text();

            editTeam(name);
        });

        tdButton.append(button);

        tr.append(tdInternalName).append(tdType).append(tdWeight).append(tdButton);
        tableBody.append(tr);
    }
}

async function buildTeamTypeTable() {
    await loadTeamTypes();
    teamTypePager.numItems(dataAccessors.teamTypeData.length)

    const tableBody = $("#teamTypeData");
    tableBody.empty();

    let start = (teamTypePager.currentPage() - 1) * teamTypePager.options.itemsPerPage + 1;
    let stop = start + teamTypePager.options.itemsPerPage - 1;

    for (let i = start; i <= stop; i++) {
        teamType = dataAccessors.teamTypeData[i];
        if (!teamType) break;

        const tr = $("<tr></tr>");
        const tdInternalName = $("<td></td>").text(teamType.name);
        const tdDisplayName = $("<td></td>").text(teamType.displayname);

        const tdButton = $("<td></td>");
        const button = $("<button></button>");
        button.addClass("default purple table-btn");
        button.append($("<i></i>").addClass("ri-file-edit-line").addClass("ri-2x"));

        button.on("click", function () {
            const row = $(this).closest("tr");
            const name = row.find("td:first").text();

            editTeamType(name);
        });

        tdButton.append(button);

        tr.append(tdInternalName).append(tdDisplayName).append(tdButton);
        tableBody.append(tr);
    }
}

async function createTeam(e, popupTeam) {
    const teamName = $("#teamName").val();
    const teamType = $("#teamType").val();
    const teamWeight = $("#teamWeight").val();

    if (teamName && teamType && teamWeight) {
        $.ajax({
            url: "/team/insertteam",
            type: "POST",
            data: {
                teamName: teamName,
                teamType: teamType,
                teamWeight: teamWeight
            },
            success: function () {
                displaySuccess("Inserted new team!");
                popupTeam.close(e);
                buildTeamTable()
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error inserting team:", errorThrown);
                displayError("Error inserting Team! Try reloading the page.")
            }
        });
    } else {
        displayError("Please fill in all fields!")
    }
}

function createTeamType(e, popupTeamType) {
    const internalName = $("#teamTypeName").val();
    const displayName = $("#teamTypeDisplayName").val();

    if (internalName && displayName) {
        $.ajax({
            url: "/teamtype/insertteamtype",
            type: "POST",
            data: {
                internalName: internalName,
                displayName: displayName
            },
            success: function () {
                displaySuccess("Inserted new team type!");
                popupTeamType.close(e);
                buildTeamTypeTable()
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error inserting team type:", errorThrown);
                displayError("Error inserting Team Type! Try reloading the page.")
            }
        });
    } else {
        displayError("Please fill in all fields!")
    }
}

function editTeamType(name) {
    const teamType = dataAccessors.teamTypeData.find((teamType) => teamType.name === name);
    if (teamType) {
        // Show the edit box
        $("#teamTypeEdit").show();

        // Fill in the input values
        $("#internalName").val(teamType.name === "-" ? "" : teamType.name);
        $("#displayName").val(teamType.displayname === "-" ? "" : teamType.displayname);
        $("#teamTypeId").val(teamType.id);
    }
}

function editTeam(name) {
    const team = dataAccessors.teamData.find((team) => team.displayname === name);
    const teamTypeId = dataAccessors.teamTypeData.find((teamtype) => teamtype.id === team.teamtype_fk).id
    if (team) {
        // Show the edit box
        $("#teamEdit").show();

        // Fill in the input values
        $("#name").val(team.displayname === "-" ? "" : team.displayname);
        const typeSelect = $("#type");
        typeSelect.empty(); // Remove existing options
        typeSelect.append(getTeamTypeOptions()); // Add new options
        typeSelect.val(teamTypeId);

        $("#weight").val(team.weight === "-" ? "" : team.weight);
        $("#teamId").val(team.id);
    }
}

function getTeamTypeOptions() {
    let options = "";
    dataAccessors.teamTypeData.forEach(function (teamType) {
        options += `<option value="${teamType.id}">${teamType.displayname}</option>`;
    });
    return options;
}

function deleteTeam(e, id) {
    const popup = new Popup("popup-containerTeamDel");
    popup.displayYesNoPopup("/res/others/alert.png", "Warning", "Are you sure you want to delete this team?", "Yes", "No", "btnTeamDelYes", "btnTeamDelNo");
    popup.open(e);

    $("#btnTeamDelYes").click(function (e) {
        $.ajax({
            url: "/team/deleteteam",
            type: "POST",
            data: {
                id: id
            },
            success: function () {
                displaySuccess("Deleted team!");
                popup.close(e);
                $("#teamEdit").hide();
                buildTeamTable()
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error deleting team:", errorThrown);
                displayError("Error deleting Team! Try reloading the page.")
            }
        });
    });

    $("#btnTeamDelNo").click(function (e) {
        popup.close(e);
    });
}

function updateTeam(){
    const id = $("#teamId").val();
    const teamName = $("#name").val();
    const teamType = $("#type").val();
    const teamWeight = $("#weight").val();

    $.ajax({
        url: "/team/updateteam",
        type: "POST",
        data: {
            id: id,
            teamName: teamName,
            teamType: teamType,
            teamWeight: teamWeight
        },
        success: function () {
            loadTeams();
            displaySuccess("Updated team!");
            $("#teamEdit").hide();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error updating team:", errorThrown);
            displayError("Error updating Team! Try reloading the page.")
        }
    });
}

function updateTeamType(){
    const id = $("#teamTypeId").val();
    const internalName = $("#internalName").val();
    const displayName = $("#displayName").val();

    $.ajax({
        url: "/teamtype/updateteamtype",
        type: "POST",
        data: {
            id: id,
            internalName: internalName,
            displayName: displayName
        },
        success: function () {
            loadTeamTypes();
            displaySuccess("Updated team type!");
            $("#teamTypeEdit").hide();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error updating team type:", errorThrown);
            displayError("Error updating Team type! Try reloading the page.")
        }
    });
}
