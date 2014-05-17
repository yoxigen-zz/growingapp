(function(){
    var overlay = document.getElementById("overlay"),
        menuWrapper = document.getElementById("menu-wrapper"),
        newEntryTypesWrapper = document.getElementById("newEntryTypesWrapper"),
        newEntryTypes = document.getElementById("newEntryType"),
        menu = document.getElementById("menu"),
        menuButton = document.getElementById("menu-button"),
        isMenuActive,
        toggleTimeout,
        toggleNewEntryTypesTimeout,
        newEntryPopup = document.getElementById("newEntry"),
        newEntryTypesButton = document.getElementById("newEntryButton"),
        isNewEntryActive,
        isNewEntryTypesActive;

    addTapListener(menuButton, toggleMenu);
    addTapListener(overlay, toggleMenu);
    addTapListener(newEntryTypesButton, toggleNewEntryTypeSelection);
    addTapListener(document.getElementById("closeNewEntry"), toggleNewEntry);
    addTapListener(document.getElementById("cancelNewEntry"), toggleNewEntry);
    addTapListener(newEntryTypes, function(e){
        toggleNewEntryTypeSelection(e);
        toggleNewEntry();
    });

    function toggleMenu(e){
        e.preventDefault();

        clearTimeout(toggleTimeout);

        if (isMenuActive){
            overlay.classList.remove("active");
            menu.classList.remove("active");

            toggleTimeout = setTimeout(function(){
                overlay.classList.remove("visible");
                menuWrapper.classList.remove("visible");

            }, 300);
        }
        else{
            overlay.classList.add("visible");
            menuWrapper.classList.add("visible");

            toggleTimeout = setTimeout(function(){
                overlay.classList.add("active");
                menu.classList.add("active");
            }, 1);
        }

        menuButton.classList.toggle("active");
        isMenuActive = !isMenuActive;
    }

    function toggleNewEntry(e){
        e && e.preventDefault();

        clearTimeout(toggleTimeout);

        if (isNewEntryActive){
            newEntryPopup.classList.remove("active");

            toggleTimeout = setTimeout(function(){
                newEntryPopup.classList.remove("visible");
            }, 300);
        }
        else{
            newEntryPopup.classList.add("visible");

            toggleTimeout = setTimeout(function(){
                newEntryPopup.classList.add("active");
            }, 1);
        }

        isNewEntryActive = !isNewEntryActive;
    }

    function toggleNewEntryTypeSelection(e){
        e.preventDefault();

        clearTimeout(toggleNewEntryTypesTimeout);

        if (isNewEntryTypesActive){
            newEntryTypes.classList.remove("active");

            toggleNewEntryTypesTimeout = setTimeout(function(){
                newEntryTypesWrapper.classList.remove("visible");
            }, 300);
        }
        else{
            newEntryTypesWrapper.classList.add("visible");

            toggleNewEntryTypesTimeout = setTimeout(function(){
                newEntryTypes.classList.add("active");
            }, 1);
        }

        newEntryTypesButton.classList.toggle("active");
        isNewEntryTypesActive = !isNewEntryTypesActive;
    }

    function addTapListener(el, handler){
        el.addEventListener("touchstart", handler);
        el.addEventListener("mousedown", handler);
    }
})();