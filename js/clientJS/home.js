function getNextTrainings(teamId){
    const url = "/presence/nextTrainings/" + teamId;
    $.ajax({
        url: url,
        type: "GET",
        success: function (data) {
            const tableBody = $("#training-column tbody");
            tableBody.empty();


            data.forEach(function(training) {
                const tr = $("<tr></tr>");
                const tdDate = $("<td></td>").text(training.readable_date);
                const tdFrom = $("<td></td>").text(training.starttime);
                const tdUntil = $("<td></td>").text(training.endtime);
                const tdType = $("<td></td>");

                const statusIndicator = $("<div></div>").addClass("status-indicator");
                if (training.trainingtype === "sure") {
                    statusIndicator.addClass("status-green");
                } else {
                    statusIndicator.addClass("status-orange");
                }
                tdType.append(statusIndicator)

                tr.append(tdDate).append(tdFrom).append(tdUntil).append(tdType);
                tableBody.append(tr);
            });
        },
        error: function (data) {
            console.log(data);
        }
    });
}