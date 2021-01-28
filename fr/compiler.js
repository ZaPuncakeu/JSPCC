import lex from "lex";
import parse from "./components/syntax";
import semantics from "./components/semantic";

let ptree;
let mainf;

export const compile = async () =>
{
    let code = $("#txtcode").val();

    const token_list = lex(code);
    console.log("List of Tokens: ", token_list);

    const {tree, main_index} = parse(token_list);
    ptree = tree;
    mainf = main_index;
    console.log("Program: ", tree);
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

    $(".exec").on('click', () => 
    {
        semantics(mainf, ptree);
    })
})











