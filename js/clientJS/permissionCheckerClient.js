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
            error: (error) => {
                console.error('Error: ' + error);
                reject(error);
            }
        });
    });
}