(function (document) {
    "use strict";

    function isMediaElement(element) {
        while (element && element !== document) {
            if (element.tagName === "IMG" || element.tagName === "VIDEO") {
                return true;
            }

            element = element.parentNode;
        }

        return false;
    }

    function preventMediaAction(event) {
        if (isMediaElement(event.target)) {
            event.preventDefault();
        }
    }

    function protectMediaElements() {
        var mediaElements = document.querySelectorAll("img, video");
        var index;

        for (index = 0; index < mediaElements.length; index += 1) {
            mediaElements[index].setAttribute("draggable", "false");

            if (mediaElements[index].tagName === "VIDEO") {
                mediaElements[index].setAttribute("controlslist", "nodownload");
            }
        }
    }

    document.addEventListener("contextmenu", preventMediaAction, true);
    document.addEventListener("dragstart", preventMediaAction, true);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", protectMediaElements);
    } else {
        protectMediaElements();
    }
}(document));
