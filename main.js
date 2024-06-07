const ajaxPost = (url, data, resolve, reject, isToastMessage = true) => {
    let response = null;
    let $allSpan = $(".error-message");
    $allSpan.text("");
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });
    $.ajax({
        url: url,
        type: "POST",
        data: data,
        success: function (response) {
            if (resolve) {
                resolve(response);
            }
            if (isToastMessage === true) {
                toastr.success(response.message);
            }
        },
        error: function (xhr, status, error) {
            if (xhr.status === 422) {
                validationMessageHandling(xhr);
            } else {
                let response = JSON.parse(xhr.responseText);
                if (isToastMessage === true) {
                    toastr.success(response.message);
                }
                reject(error || status);
            }
        },
    });
}

function ajaxFormDataPost(url, data, resolve, reject) {
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });
    $.ajax({
        url: url,
        type: "POST",
        data: data,
        contentType: false,
        processData: false,
        success: function (response) {
            if (resolve) {
                resolve(response);
            }
            toastr.success(response.message);
        },
        error: function (xhr, status, error) {
            if (xhr.status === 422) {
                validationMessageHandling(xhr);
            } else {
                let response = JSON.parse(xhr.responseText);
                toastr.error(response.message);
                reject(error || status);
            }
        },
    });
}

const validationMessageHandling = (xhr) => {
    let response = JSON.parse(xhr.responseText);
    toastr.error(response.message);

    for (let index = 0; index < response.errors.length; index++) {
        const element = response.errors[index];
        let key = element.details;
        key = key.charAt(0).toLowerCase() + key.slice(1);
        addErrorMessage(key, element.errorMessage);
    }
}

const addErrorMessage = (inputId, errorMessage) => {
    var $errorSpan = $("#" + inputId).next(".error-message");
    if ($errorSpan.length) {
        $errorSpan.text(errorMessage);
    } else {
        $("<span></span>", {
            text: errorMessage,
            class: "error-message",
            css: {
                color: "red",
            },
        }).insertAfter("#" + inputId);
    }
}
