import lex from "./components/lex";
import parse from "./components/syntax";
import semantics from "./components/semantic";

export const compile = async () =>
{
    let code = $("#txtcode").val();

    const token_list = lex(code);
    console.log("List of Tokens: ", token_list);

    const {tree, main_index} = parse(token_list);
    console.log("Program: ", tree);

    await semantics(main_index, tree);
}


$(document).ready(function()
{
    $(document).on("keypress", (e) =>
    {
        /*if(e.which == 13){
            if(!can_continue)
            {
                can_continue = true;
            }
        }*/
    });

    $(".compile").on('click', compile);

    $(".quit button").on('click', () => 
    {
        $(".consoles").hide();
    });
})











