(function(){
    var overlay = document.getElementById("overlay"),
        menu = document.getElementById("menu"),
        menuButton = document.getElementById("menu-button"),
        isMenuActive,
        toggleTimeout;

    menuButton.addEventListener("touchstart", toggleMenu);
    menuButton.addEventListener("mousedown", toggleMenu);

    overlay.addEventListener("touchstart", toggleMenu);
    overlay.addEventListener("mousedown", toggleMenu);

    function toggleMenu(e){
        e.preventDefault();

        clearTimeout(toggleTimeout);

        if (isMenuActive){
            overlay.classList.remove("active");
            menu.classList.remove("active");

            toggleTimeout = setTimeout(function(){
                overlay.classList.remove("visible");
                menu.classList.remove("visible");

            }, 300);
        }
        else{
            overlay.classList.add("visible");
            menu.classList.add("visible");

            toggleTimeout = setTimeout(function(){
                overlay.classList.add("active");
                menu.classList.add("active");
            }, 1);
        }

        menuButton.classList.toggle("active");
        isMenuActive = !isMenuActive;
    }
})();