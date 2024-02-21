let currentGameday;

/**
 * This function display the gamedays in the table
 */
function displayGamedays(gamedays) {
    let tableBody = $('#gamedaysData');
    tableBody.empty();

    if (!gamedays.length) {
        tableBody.append(`<tr><td colspan="6" class="text-center text-md font-bold text-btn-grey">NO GAMEDAYS FOUND</td></tr>`);
    } else {
        gamedays.forEach(function(gameday){
            const formattedDate = new Date(gameday.date).toLocaleString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '');
            const tr = $("<tr></tr>");
            const tdDate = $("<td></td>").text(formattedDate)
            const tdTitle = $("<td></td>").text(gameday.title);
            const tdDescription = $("<td></td>").text(gameday.description).addClass("hidden md:table-cell");
            const tdLocation = $("<td></td>").text(gameday.location).addClass("hidden sm:table-cell");
            const tdWishes = $("<td></td>").text(gameday.wishes).addClass("hidden sm:table-cell");
            const tdButton = $("<td></td>");
            const del = $("<a href='#' id='delGameday'><i class='ri-close-line ri-xl text-error'></i></a>").click(function(){
                deleteGameday(gameday.id);
            });
            const report = $("<a href='#' id='reportResult'><i class='ri-edit-box-line ri-lg text-success ml-2'></i></a>").click(function(){
               currentGameday = gameday;
               $('#resultTitle').text("Report Result for Gameday " + gameday.title);
               $('#reportResultDiv').removeClass('hidden');
               $('#result').val("");
                $('#comment').val("");
            });
            if(!gameday.isreported){
                tdButton.append(del).append(report);
            }else{
                const alreadyReported = $("<span></span>").text("Already reported").addClass("text-success");
                tdButton.append(alreadyReported);
            }

            tr.append(tdDate).append(tdTitle).append(tdDescription).append(tdLocation).append(tdWishes).append(tdButton);
            tableBody.append(tr);
        });
    }
}

/**
 * This function is used to submit the result of a gameday
 */
function submitReport(){
    let data = {
        gameday_id: currentGameday.id,
        result: $('#result').val(),
        comment: $('#comment').val()
    };
    $.ajax({
        type: 'POST',
        url: '/gameday/submitResult',
        data: data,
        success: function(response) {
            displaySuccess(response.message);
            $('#reportResultDiv').addClass('hidden');
            loadGamedays();
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
 * This function is used to delete a gameday
 * @param id
 */
function deleteGameday(id){
    $.ajax({
        type: 'DELETE',
        url: '/gameday/delete',
        data: {id: id},
        success: function(response) {
            displaySuccess(response.message);
            loadPage('gameday');
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
 * This function is used to load all gamedays for the team
 */
function loadGamedays(){
    let url = "";

    if ($("#showPast").is(":checked")) {
        url = '/gameday/getAllForTeam';
    }else{
        url = '/gameday/getNotReportedForTeam';
    }

    $.ajax({
        type: 'GET',
        url: url,
        success: function(response) {
            displayGamedays(response);
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
 * This function is used to submit a new gameday
 */
function submitNewGameday(data){
    $.ajax({
        type: 'POST',
        url: '/gameday/new',
        data: data,
        success: function(response) {
            displaySuccess(response.message);
            loadPage('gameday');
        },
        error: function(data) {
            if (data.responseJSON && data.responseJSON.redirect) {
                window.location.href = data.responseJSON.redirect;
            }
            displayError(data.responseJSON.message);
        }
    });
}