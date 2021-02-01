import lex from "./components/lex.js";
import parse from "./components/syntax.js";
import semantics from "./components/semantic.js";

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

    $(".download").on('click', () => 
    {
        let text = $("#txtcode").val();
        text = text.replace(/\n/g, "\r\n");
        let blob = new Blob([text], { type: "text/plain"});
        let anchor = document.createElement("a");
        anchor.download = ptree[mainf].id+".jspcc";
        anchor.href = window.URL.createObjectURL(blob);
        anchor.target ="_blank";
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    });
})











