function findCurrentActive() {
    var activeA = document.querySelector("#mytabs .nav-link.active");
    var href = activeA.getAttribute("href");
    var fragmentIdentifier = href.substring(href.indexOf("#") + 1);
    return fragmentIdentifier;
}

document.addEventListener("DOMContentLoaded", findCurrentActive);

function loadTabContent(target) {
    var urlMap = {
        "#tab_1": "/applications/applicationFormPartial",
        "#tab_2": "/applications/documentFormPartial",
        "#tab_3": "/applications/objectsFormPartial",
        "#tab_4": "/applications/reviewFormPartial"
    };

    if (urlMap[target]) {
        $.ajax({
            url: urlMap[target],
            type: "GET",
            success: function (res) {
                $(target).html(res.data.partial);
            },
            error: function (xhr, status, error) {
                console.error("An error occurred: " + status + ", " + error);
            },
        });
    }
}

$(document).ready(function () {
    var defaultTabHref = $("a.nav-link.btn.btn-default.active").attr("href");
    loadTabContent(defaultTabHref);
});

function saveApplicationForm() {
    let data = {
        petitionType: $("#petitionType").val(),
        requestDate: $("#requestDate").val(),
        registerTheRights: $("#registerTheRights").is(':checked'),
    };
    let url = "/applications/save-applicationForm";
    return new Promise((resolve, reject) => {
        ajaxPost(url, data, resolve, reject);
    });
}

function saveDocumentForm() {
    let data = {
        documentTypeId: $("#documentTypeId").val(),
        documentNumber: $("#documentNumber").val(),
        institutionId: $("#institutionId").val(),
        documentDate: $("#documentDate").val()
    };
    let url = "/applications/save-documentForm";
    return new Promise((resolve, reject) => {
        ajaxPost(url, data, resolve, reject);
    });
}

function saveObjectForm() {
    let data = {
        networkTypeId: $("#networkTypeId").val(),
        objectTypeId: $("#objectTypeId").val(),
        individualNameOfTheObjective: $("#individualNameOfTheObjective").val(),
        locationOfTheObjective: $("#locationOfTheObjective").val(),
        fileId: $("#fileId").val(),
    };

    let url = "/applications/save-objectForm";
    return new Promise((resolve, reject) => {
        ajaxPost(url, data, resolve, reject);
    });
}

function saveReviewForm() {
    let data = {
        executionPeriod: $("#execution-period").val(),
    };
    let url = "/applications/save-reviewForm";
    return new Promise((resolve, reject) => {
        ajaxPost(url, data, resolve, reject);
    });
}

$(document).on("click", ".next", async function () {
    const $activeTab = $(".tab-pane.active");
    const id = $activeTab.attr("id");
    handleTabChange(id, "next");
});

$(document).on("click", ".prev", async function () {
    const $activeTab = $(".tab-pane.active");
    const id = $activeTab.attr("id");
    handleTabChange(id, "prev");
});

document.querySelector("#mytabs").addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    var targetElement = event.target;
    while (
        targetElement != null &&
        !(
            targetElement.tagName === "A" &&
            targetElement.parentElement.tagName === "LI"
        )
        ) {
        targetElement = targetElement.parentElement;
    }
    if (targetElement != null) {
        handleTabChange(findCurrentActive(), null, targetElement);
    }
});

function changeTab(direction, loadedElement) {
    if (direction == "prev") {
        const $activeTab = $(".tab-pane.active");
        const $prevTab = $activeTab.prev(".tab-pane");
        const $activeNav = $("#mytabs .nav-link.active");
        const $prevNav = $activeNav.parent().prev("li").find("a");

        if ($prevTab.length) {
            $activeTab.removeClass("active show");
            $prevTab.addClass("active show");
            $activeNav.removeClass("active");
            $prevNav.addClass("active");
        }
    } else if (direction == "next") {
        const $activeTab = $(".tab-pane.active");
        const $nextTab = $activeTab.next(".tab-pane");
        const $activeNav = $("#mytabs .nav-link.active");
        const $nextNav = $activeNav.parent().next("li").find("a");
        if (
            $nextNav.hasClass("disabled") &&
            $nextNav.attr("href") !== "#tab_4"
        ) {
            loadTabContent($nextNav.attr("href"));
        }
        $nextNav.removeClass("disabled");

        if ($nextTab.length) {
            $activeTab.removeClass("active show");
            $nextTab.addClass("active show");
            $activeNav.removeClass("active");
            $nextNav.addClass("active");
        }
    } else {
        var $loadedElement = $(loadedElement);
        const $activeTab = $(".tab-pane.active");
        const $activeNav = $("#mytabs .nav-link.active");
        $activeTab.removeClass("active show");
        $loadedElement.addClass("active show");
        $activeNav.removeClass("active");
        $loadedElement.addClass("active");
        var href = loadedElement.getAttribute("href");
        var fragmentIdentifier = href.substring(href.indexOf("#") + 1);
        $("#" + fragmentIdentifier).addClass("active");
    }
}

async function handleTabChange(id, direction, loadedElement = "") {
    let saveFormFunction = null;
    if (id === "tab_1") {
        saveFormFunction = saveApplicationForm;
    }
    if ($("#object_table tbody tr").length > 0) {
        if (id === "tab_3" && direction == null) {
            changeTab(direction, loadedElement);
        }
        if (id === "tab_3" && direction == "prev") {
            changeTab(direction, loadedElement);
        }
        if (
            $(loadedElement).attr("href") == "#tab_4" ||
            (id == "tab_3" && direction == "next")
        ) {
            changeTab(direction, loadedElement);
            loadTabContent("#tab_4");
        }
    }

    if (saveFormFunction) {
        try {
            const response = await saveFormFunction();
            if (response.success) {
                changeTab(direction, loadedElement);
            }
        } catch (error) {
            console.error(`Error saving form for ${id}:`, error);
            return;
        }
    } else if (id === "tab_2" && $("#document_table tbody tr").length > 0) {
        changeTab(direction, loadedElement);
    } else if (id === "tab_4") {
        changeTab(direction, loadedElement);
    }
}

$(document).on("click", "#add_document_button", async function () {
    try {
        const response = await saveDocumentForm();
        createDocumentTable(response.data);
        resetFormElementsByTabId("tab_2");
        $("#documentBackButton").removeClass("disabled");
        $("#documentNextButton").removeClass("disabled");
    } catch (error) {
        console.error("Error:", error);
    }
});

function createDocumentTable(idDocument) {
    const documentName = $("#documentTypeId option:selected").text();
    const issuingInstitution = $("#institutionId option:selected").text();
    const documentNumber = $("#documentNumber").val();
    const documentDate = $("#documentDate").val();

    const newRow = `
                <tr id="row_${idDocument}">
                    <td class="text-center">${documentName}</td>
                    <td class="text-center">${issuingInstitution}</td>
                    <td class="text-center">${documentNumber}</td>
                    <td class="text-center">${documentDate}</td>
                    <td class="text-center">
                        <button data-target="#documentDeleteModal" data-toggle="modal" onclick="document.getElementById('document_id').value='${idDocument}';" data-id="${idDocument}" class="remove-document-button btn btn-xs btn-flat btn-danger"><i class="fa fa-fw fa-trash"></i></button>
                    </td>
                </tr>
            `;

    $("#document_table tbody").append(newRow);
}


$(document).on("click", ".confirm-remove-document-button", async function () {
    let documentId = $("#document_id").val();
    let data = {
        id: documentId,
    };
    let url = "/applications/document/delete";
    const response = await new Promise((resolve, reject) => {
        ajaxPost(url, data, resolve, reject);
    });
    $("#documentDeleteModal").modal("hide");
    $("#row_" + documentId).remove();
    if ($("#document_table tbody tr").length == 0) {
        $("#documentBackButton").addClass("disabled");
        $("#documentNextButton").addClass("disabled");
    }
});

$(document).on("change", "#file", async function () {
    var formData = new FormData();
    var fileInput = $("#file")[0];
    if (fileInput.files && fileInput.files[0]) {
        formData.append("file", fileInput.files[0]);
    }

    let data = formData;
    let url = "/upload/file";
    const response = await new Promise((resolve, reject) => {
        ajaxFormDataPost(url, data, resolve, reject);
    });

    $("#fileId").val(response.data);
    $(this).siblings(".custom-file-label").text(fileInput.files[0].name);
});

$(document).on("click", "#add_object_button", async function () {
    try {
        const response = await saveObjectForm();
        createObjectTable(response.data);
        resetFormElementsByTabId("tab_3");
        $("#objectBackButton").removeClass("disabled");
        $("#objectNextButton").removeClass("disabled");
    } catch (error) {
        console.error("Error:", error);
    }
});

function createObjectTable(idObject) {
    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

    const networkType = $("#networkTypeId option:selected").text();
    const objectTypeId = $("#objectTypeId option:selected").text();
    const individualNameOfTheObjective = $("#individualNameOfTheObjective").val();
    const locationOfTheObjective = $("#locationOfTheObjective").val();

    const newRow = `
    <tr id="row_${idObject}">
    <td class="text-left">${networkType}</td>
    <td class="text-left">${objectTypeId}</td>
    <td class="text-left">${individualNameOfTheObjective}</td>
    <td class="text-left">${locationOfTheObjective}</td>
    <td class="text-left">${file.name}</td>
    <td class="text-center">
      <button data-target="#objectDeleteModal"
      data-toggle="modal"
      onclick="document.getElementById('object_id').value='${idObject}';"
       data-id="${idObject}"
       class="remove-file-button float-right btn btn-xs btn-flat btn-danger"
       type="button"
       data-toggle="modal"
       data-target="#modalDeleteObject">
       <i class="fa fa-fw fa-trash"></i>
       </button>
    </td>
  </tr>
            `;

    $("#object_table tbody").append(newRow);
}

$(document).on("click", ".confirm-remove-file-button", async function () {
    let fileId = $("#object_id").val();
    let data = {
        id: fileId,
    };
    let url = "/applications/file/delete";
    const response = await new Promise((resolve, reject) => {
        ajaxPost(url, data, resolve, reject);
    });
    $("#objectDeleteModal").modal("hide");
    $("#row_" + fileId).remove();
    if ($("#object_table tbody tr").length == 0) {
        $("#objectBackButton").addClass("disabled");
        $("#objectNextButton").addClass("disabled");
    }
});

$(document).on("change", "#networkTypeId", async function () {
    var parentId = $(this).val();
    if (parentId) {
        let data = {
            parentId: parentId,
        };
        let url = "/applications/getObjectTypeByParentId";
        const options = await new Promise((resolve, reject) => {
            ajaxPost(url, data, resolve, reject, false);
        });

        var $select = $("#objectTypeId");
        $select.empty();

        $select.append(
            $("<option></option>").val("").text("Choose").prop("selected", true)
        );

        options.forEach(function (option) {
            $select.append(
                $("<option></option>").val(option.id).text(option.title)
            );
        });
    }
});


function resetFormElementsByTabId(tabId) {
    $(".custom-file-label").text("");
    $(
        "#" +
        tabId +
        " input:not(:disabled), #" +
        tabId +
        " textarea:not(:disabled)"
    ).val("");
    $(
        "#" +
        tabId +
        " input[type=checkbox]:not(:disabled), #" +
        tabId +
        " input[type=radio]:not(:disabled)"
    ).prop("checked", false);
    $("#" + tabId + " select:not(:disabled)").prop("selectedIndex", 0);
}
