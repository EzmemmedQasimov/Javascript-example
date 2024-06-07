const changeStatus = (url) => {
    $.ajax({
        url: url,
        type: "GET",
        success: function (res) {
            toastr.success(res.message);
        },
        error: function (res) {
            toastr.error(res.message);
        }
    });
}


const openCreateEditModal = async (url,
                                   targetHtml = "default-modal-content",
                                   parameters = []) => {
    $("#" + targetHtml).html("");
    $("#default-modal-loader").css("display", "block");
    let waitResponse = await $.ajax({
        url: url,
        parameters: parameters,
        type: "GET",
        success: function (res) {
            $("#" + targetHtml).html(res);
        },
        error: function (xhr, status, error) {
            console.error("An error occurred: " + status + ", " + error);
        },
    });
    $("#default-modal-loader").css("display", "none")
}

const openShowModal = async (url,
                             targetHtml = "default-modal-content",
                             parameters = []) => {
    $("#" + targetHtml).html("");
    $("#default-modal-loader").css("display", "block");
    let waitResponse = await $.ajax({
        url: url,
        parameters: parameters,
        type: "GET",
        success: function (res) {
            $("#" + targetHtml).html(res);
        },
        error: function (xhr, status, error) {
            console.error("An error occurred: " + status + ", " + error);
        },
    });
    $("#default-modal-loader").css("display", "none")
}

const openDeleteModal = (url) => {
    $("#deleteConfirmButton").attr('data-url', url);
}

const deleteCrudTableItem = async () => {
    $("#deleteConfirmButton").prop("disabled", true);
    let url = $("#deleteConfirmButton").attr("data-url")
    let waitResponse = await $.ajax({
        url: url,
        type: "GET",
        success: function (response) {
            toastr.success(response.message);
            setTimeout(function () {
                location.reload();
            }, 1000)
        },
        error: function (xhr, status, error) {
            console.error("An error occurred: " + status + ", " + error);
            var response = JSON.parse(xhr.responseText);
            toastr.error(response.message);
            toastr.error(response.message);
        },
    });
}


$(document).on("click", ".reset-form", function (e) {
    document.forms["search-form"]
        .querySelectorAll("input,select")
        .forEach((elem) => {
            if (elem.name == "pageSize" || elem.name == "pageNo") return;
            elem.value = "";
        });
    document.forms["search-form"].submit();
});


document.addEventListener("DOMContentLoaded", function () {
    const pageSizeSelect = document.getElementById("pagesize-select");
    if (pageSizeSelect !== null) {
        const currentUrl = new URL(window.location);
        const pageSizeParam = currentUrl.searchParams.get("pageSize");
        if (pageSizeParam) {
            pageSizeSelect.value = pageSizeParam;
        }

        pageSizeSelect.addEventListener("change", function () {
            const selectedPageSize = this.value;
            currentUrl.searchParams.set("pageSize", selectedPageSize);
            window.location.href = currentUrl.href;
        });
    }
});


const saveCrudForm = async (url) => {
    let formData = $("#crudForm").serializeArray();
    $("#default-modal-absolute-loader").css("display", "block");
    ajaxPost(url, formData, resolveSaveCrud, rejectSaveCrud);

}

const resolveSaveCrud = (response) => {
    console.log(response);
    if (response.isSuccess === true) {
        setTimeout(function () {
            location.reload();
        }, 1000)
    }
}
const rejectSaveCrud = () => {
    $("#default-modal-absolute-loader").css("display", "none");
}
