/**
 * Displays Toast Messages with the given message
 */
function displayInfo(message, duration = 3000)
{
    Toastify({
        text: message,
        duration: duration,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        style: {
            fontFamily: "montserrat",
            fontSize: "1.3vh"
        },
    }).showToast();
}

function displayError(message, duration = 3000)
{
    Toastify({
        text: message,
        duration: duration,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        className: "error",
        style: {
            background: "linear-gradient(to right, #ff6363, #E70000)",
            fontFamily: "montserrat",
            fontSize: "1.3vh"
        },
    }).showToast();
}
/**
 * Displays a success toast notification with the specified message.
 * @param {string} message - The message to be displayed in the success notification.
 * @param {number} [duration=3000] - The duration (in milliseconds) for which the success notification should be displayed. Default is 3000ms (3 seconds).
 */
function displaySuccess(message, duration)
{
    duration = duration || 3000;

    Toastify({
        text: message,
        duration: duration,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        className: "error",
        style: {
            background: "linear-gradient(to right, #04C704, #008000)",
            fontFamily: "montserrat",
            fontSize: "1.3vh"
        },
    }).showToast();
}