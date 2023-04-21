/**
 * Displays Toast Messages with the given message
 */
function displayInfo(message)
{
    Toastify({
        text: message,
        duration: 3000,
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

function displayError(message)
{
    Toastify({
        text: message,
        duration: 3000,
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

function displaySuccess(message)
{
    Toastify({
        text: message,
        duration: 3000,
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