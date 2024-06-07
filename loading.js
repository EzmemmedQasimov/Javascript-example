var currentButton = null;
$(document).on("click", ".spinning", function () {
    currentButton = this;
});

$(document).ajaxStart(function () {
    if (currentButton) {
        disableButton(currentButton);
    }
});

$(document).ajaxComplete(function () {
    if (currentButton) {
        enableButton(currentButton);
        currentButton = null;
    }
});

function disableButton(button) {
    button.disabled = true;
    if ($(button).find(".spinner-border").length === 0) {
        $(button).append(
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
        );
    }
}

function enableButton(button) {
    button.disabled = false;
    $(button).find(".spinner-border").remove();
}

$(document).ready(function () {
    $.ajaxSetup({
        beforeSend: function (jqXHR, settings) {
            if (settings.type.toUpperCase() === "GET") {
                $("#loader").show();
            }
        },
    });

    $(document).ajaxComplete(function (event, jqXHR, settings) {
        if (settings.type.toUpperCase() === "GET") {
            $("#loader").hide();
        }
    });
});
