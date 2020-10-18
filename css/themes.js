$(document).ready(function()
{
    $(".bars-mobile").on("click", function()
    {
        $(".right-nav").slideToggle();
    });

    let resized = false;

    $(window).resize(function()
    {
        if($(window).width() > 1024)
        {
            resized = true;
            $(".right-nav").show();
        }
        
        if($(window).width() <= 1024 && resized)
        {
            resized = false;
            $(".right-nav").hide();
        }
        
    });
});