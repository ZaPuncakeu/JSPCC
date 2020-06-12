$(document).ready(function()
{
    $(".bars-mobile").on("click", function()
    {
        $(".right-nav").slideToggle();
    });

    $(window).resize(function()
    {
        if($(window).width() > 1024)
        {
            $(".right-nav").show();
        }
    });
});