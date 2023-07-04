function getNextTrainings(teamId) {
    const url = "/presence/nextTrainings/" + teamId;
    $.ajax({
        url: url,
        type: "GET",
        success: function (data) {
            const tableBody = $("#training-column tbody");
            tableBody.empty();

            const firstTwoTrainings = data.slice(0, 4); // Extract first two elements from the data array

            firstTwoTrainings.forEach(function(training) {
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

function setupSwiper() {
    const swiper = new Swiper('.swiper', {
        // Optional parameters
        direction: 'horizontal',
        loop: true,

        // Navigation arrows
        pagination: {
            el: '.swiper-pagination',
        },

        autoplay: {
            delay: 3500, // time delay between slides change
            disableOnInteraction: false, // continue autoplay after user interactions
        }
    });

    return swiper;
}