(function(){
    var overlay = document.getElementById("overlay"),
        menuWrapper = document.getElementById("menu-wrapper"),
        menu = document.getElementById("menu"),
        menuButton = document.getElementById("menu-button"),
        isMenuActive,
        toggleTimeout,
        newEntryPopup = document.getElementById("newEntry"),
        newEntryButton = document.getElementById("newEntryButton"),
        isNewEntryActive;

    addTapListener(menuButton, toggleMenu);
    addTapListener(overlay, toggleMenu);
    addTapListener(newEntryButton, toggleNewEntry);
    addTapListener(document.getElementById("closeNewEntry"), toggleNewEntry);
    addTapListener(document.getElementById("cancelNewEntry"), toggleNewEntry);

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
        e.preventDefault();

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

        newEntryButton.classList.toggle("active");
        isNewEntryActive = !isNewEntryActive;
    }

    function addTapListener(el, handler){
        el.addEventListener("touchstart", handler);
        el.addEventListener("mousedown", handler);
    }
})();