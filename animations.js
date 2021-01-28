
$(document).ready(function()
{
    let on = false;
    let resized = false;

    $(".menu-btn").on("click", function()
    {
        if(on)
        {
            $(".menu-btn i").removeClass("fa-arrow-left");
            $(".menu-btn i").addClass("fa-arrow-right");
            $(".doc-menu").animate(
            {
                left: "-100%"
            });
            on = false;
        }
        else 
        {
            $(".menu-btn i").removeClass("fa-arrow-right");
            $(".menu-btn i").addClass("fa-arrow-left");
            $(".doc-menu").animate(
            {
                left: "0"
            });
            on = true;
        }
    })

    $(window).resize(function()
    {
        if($(window).width() > 1024)
        {
            resized = true;
            $(".doc-menu").css("left", "0");
            on = false;
        }
        
        if($(window).width() <= 1024 && resized)
        {
            resized = false;
            $(".doc-menu").css("left", "-100%");
            on = false;
        }
        
    });
});