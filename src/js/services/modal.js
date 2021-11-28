const Swal = require('sweetalert2')

angular.module('app').service('modal', function () {

    const generalConfig = {
        confirmButtonText: 'Ok',
        confirmButtonColor: '#736BF7'
    };

    return {
        confirm: message => Swal.fire({
            ...generalConfig,
            title: 'Success!',
            text: message,
            icon: 'success',
        }),
        error: message => Swal.fire({
            ...generalConfig,
            title: 'Oh oh',
            text: message,
            icon: 'error',
        }),
    }

});