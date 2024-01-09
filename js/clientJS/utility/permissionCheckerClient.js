/**
 * This file implements method to determine if the user has permission to perform certain actions
 */
function hasPermission(location, permission) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/user/getUserPermissions',
            type: 'GET',
            dataType: "json",
            success: (data) => {
                for (let element of data) {
                    if (element.location === location && element.permission === permission) {
                        resolve(true);
                        return;
                    }
                }

                resolve(false);
            },
            error: (data) => {
                if (data.responseJSON && data.responseJSON.redirect) {
                    window.location.href = data.responseJSON.redirect;
                }
                console.error('Error: ' + data);
                reject(data);
            }
        });
    });
}