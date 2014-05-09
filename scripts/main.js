(function(){
    var overlay = document.getElementById("overlay"),
        menu = document.getElementById("menu"),
        isMenuActive,
        toggleTimeout;

    document.getElementById("menu-button").addEventListener("touchstart", toggleMenu);
    document.getElementById("menu-button").addEventListener("mousedown", toggleMenu);

    function toggleMenu(e){
        e.preventDefault();

        clearTimeout(toggleTimeout);

        if (isMenuActive){
            overlay.classList.remove("active");
            menu.classList.remove("active");

            toggleTimeout = setTimeout(function(){
                overlay.classList.remove("visible");
                menu.classList.remove("visible");

            }, 400);
        }
        else{
            overlay.classList.add("visible");
            menu.classList.add("visible");

            toggleTimeout = setTimeout(function(){
                overlay.classList.add("active");
                menu.classList.add("active");
            }, 1);
        }

        isMenuActive = !isMenuActive;
    }
})();