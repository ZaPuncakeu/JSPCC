import * as Errors from './errors/errors_syntax.js'
/************ Syntaxical ************/

/*********** Recursive Descendant Analysis ***********/

let current_token = 0;
let token;

let current_function;

let program_tree;

let error_list;

let line = 1;
let col = 0;
let tk_list;

let main_index;

let read_token = -1;

let interm_var = -1;

const parse = (token_list) =>
{   
    current_token = 0;
    token;
    current_function;
    
    program_tree = [];

    interm_var = -1;

    error_list = [];
    line = 1;
    col = 0;

    tk_list = token_list;
    token = getNextToken();

    program_root();
    console.log("Errors: ", error_list);

    if(error_list.length == 0)
    {
        $("#build .log").empty();
        $("#build .log").append("<div><span class='kw'>Votre programme a été complié avec succès.</span><br>"+
                                "Vous pouvez à présent l'exécuter.</div>");
        
        $("#build").show();
        return {
            tree: program_tree,
            main_index: main_index
        }
    }
    else 
    {
        $("#build .log").empty();
        for(let i = 0; i < error_list.length; i++)
        {
            $("#build .log").append("<div><span class='error'>ERREUR! ligne "+error_list[i].line+""+
                                ", colonne "+ error_list[i].col + "</span>: "+ 
                                error_list[i].message);
        }
        
        $("#build").show();
    }
    return {
        tree: null,
        main_index: null
    }
}

const program_root = () =>
{
    fonctions();
    main();
}

const fonctions = () =>
{
    const time = getTime();
    while(checkToken("function") || checkToken("procedure"))
    {
        if(isStuck(time, Errors.unexpectedToken, token.value))
        {
            return;
        }
        
        function_header();
        declaration();
        body();

        token = getNextToken();
        if(!checkToken(";"))
        {
            setError(Errors.missingSemiColumn());    
        }

        program_tree.push(
        {
            instr: "end_fct",
            line: line,
            col: col
        });
        token = getNextToken();
    }
}

const function_header = () =>
{
    const fctType = token.id;
    const fctToken = token.value;

    token = getNextToken();
    if(!checkToken("id"))
    {
        setError(Errors.missingId(fctToken));
        return;
    }

    const id = token.value;
    const index = program_tree.length;
    program_tree.push(
    {
        instr: "dec_fct",
        id: id,
        line: line,
        col: col
    });

    current_function = id;

    token = getNextToken();
    if(!checkToken("("))
    {
        setError(Errors.expectedToken("("));
        return;
    }

    token = getNextToken();
    const time = getTime();
    while(!checkToken(")"))
    {
        if(isStuck(time, Errors.expectedToken,")"))
        {
            return;
        }
        params();
    }
    
    if(fctType == "function")
    {
        token = getNextToken();
        if(!checkToken(":"))
        {
            setError(Errors.expectedToken(":"));
            return;
        }

        token = getNextToken();
        if(!checkToken("type"))
        {
            setError(Errors.missingType());
            return;
        }

        program_tree[index]["type"] = token.value;
    }
    
    token = getNextToken();
    if(!checkToken(";"))
    {
        setError(Errors.missingSemiColumn());
        return;
    }
}

const params = () => 
{
    const time_mode = getTime();
    while(checkToken("mode"))
    {
        let mode = token.value;
        if(isStuck(time_mode, Errors.unexpectedToken,token.value))
        {
            return;
        }

        token = getNextToken();
        if(!checkToken("/"))
        {
            setError(Errors.expectedToken("/"));
            return;
        }

        let var_list = [];
        const time = getTime();
        while(!checkToken(":"))
        {
            if(isStuck(time, Errors.unexpectedToken,token.value))
            {
                return;
            }

            token = getNextToken();
            if(!checkToken("id"))
            {
                setError(Errors.unexpectedToken(token.value));
                return;
            }
            var_list.push({
                id: token.value,
                dim: dec_array()
            });
            
            if(!checkToken(":") && !checkToken(","))
            {
                setError(Errors.unexpectedToken(token.value));
            }
        }

        token = getNextToken();
        if(!checkToken("type"))
        {
            setError(Errors.missingType());
            return;
        }

        var_list.forEach((vr) => 
        {
            program_tree.push(
            {
                instr: "dec_param",
                id: vr.id,
                type: token.value,
                fct: current_function,
                mode: mode,
                dim: vr.dim,
                line: line,
                col: col
            });
        });

        token = getNextToken();
        if(checkToken(";"))
        {
            token = getNextToken();
            if(!checkToken("mode"))
            {
                setError(Errors.missingMode());
                return;
            }
        }
    }

}

const dec_array = () => 
{
    token = getNextToken();
    let dim = [];
    if(checkToken("["))
    {
        token = getNextToken();
        const time_braces = getTime();
        while(!checkToken("]"))
        {
            if(isStuck(time_braces, Errors.expectedToken, "]"))
            {
                return;
            }

            if(!checkToken("value"))
            {
                setError(Errors.expectedToken("valeur entière"));
                return;
            }
            
            dim.push(token);

            token = getNextToken();
            if(checkToken(","))
            {
                token = getNextToken(); 
                if(checkToken("]"))
                {
                    setError(Errors.expectedToken("valeur entière"));
                    return;
                }
            }
        }

        token = getNextToken();
    }

    return dim;
}

const declaration = () => 
{
    token = getNextToken();
    while(checkToken("var") || checkToken("const"))
    {
        if(checkToken("var"))
        {
            token = getNextToken();
            let var_list = [];
            const time = getTime();
            let end = false;
            let is_ptr = false;
            if(checkToken("*"))
            {
                is_ptr = true;
                token = getNextToken();
            }

            while(checkToken("id"))
            {
                if(isStuck(time, Errors.unexpectedToken,token.value))
                {
                    return;
                }

                var_list.push({
                    id: token.value,
                    dim: dec_array(),
                    is_ptr: is_ptr
                });

                if(checkToken(","))
                {
                    end = false;
                    token = getNextToken();
                    if(checkToken("*"))
                    {
                        is_ptr = true;
                        token = getNextToken();
                    }
                    else 
                    {
                        is_ptr = false;
                    }

                    continue;
                }

                if(!checkToken(":"))
                {
                    setError(Errors.expectedToken(":"));
                    return;
                }

                token = getNextToken();
                if(!checkToken("type"))
                {
                    setError(Errors.missingType());
                    return;
                }

                var_list.forEach((vr) => 
                {
                    program_tree.push(
                    {
                        instr: "dec_var",
                        id: vr.id,
                        type: token.value,
                        is_ptr: vr.is_ptr,
                        fct: current_function,
                        dim: vr.dim,
                        line: line,
                        col: col
                    });
                });

                token = getNextToken();
                if(!checkToken(";"))
                {
                    setError(Errors.missingSemiColumn());
                    return;
                }

                var_list = [];
                token = getNextToken();
                end = true;
            }

            if(!end)
            {
                setError(Errors.expectedToken("identifiant"));
                return;
            }
            
            continue;
        }

        if(checkToken("const"))
        {
            token = getNextToken();
            if(!checkToken("id"))
            {
                setError(Errors.missingId("const"));
                return;
            }
            
            const id = token.value;

            token = getNextToken();
            if(!checkToken("="))
            {
                setError(Errors.expectedToken("="));
                return;
            }

            token = getNextToken();
            if(!checkToken("value"))
            {
                setError(Errors.missingValue());
                return;
            }
            
            program_tree.push(
            {
                instr: "dec_const",
                id: id,
                val: token.value,
                type: token.type,
                fct: current_function,
                line: line,
                col: col
            });

            token = getNextToken();
            if(!checkToken(";"))
            {
                setError(Errors.missingSemiColumn());
                return;
            }
            
            token = getNextToken();
        }
    }
}

const body = () => 
{
    if(!checkToken("begin"))
    {
        setError(Errors.missingKeyWord("Début"));
        return;
    }

    token = getNextToken();
    const time = getTime();
    while(!checkToken("endf"))
    {
        if(isStuck(time, Errors.missingKeyWord, "Fin"))
        {
            return;
        }

        action();
    }
}

const action = () => 
{
    if(checkToken("id"))
    {
        const tmp = current_token-1;
        let v = token.value;
        token = getNextToken();
        let index = set_index();

        if(checkToken("<"))
        {
            token = getNextToken();
            if(!checkToken("-"))
            {
                setError(Errors.expectedToken("<-"));
                return;
            }

            token = getNextToken();
            expression();

            program_tree.push(
            {
                instr: "save",
                val: program_tree[program_tree.length-1].target,
                target: v,
                index: index,
                fct: current_function,
                line: line,
                col: col
            });
            
            if(!checkToken(";"))
            {
                setError(Errors.missingSemiColumn());
                return;
            }

            token = getNextToken();
            return;
        }
        else 
        {
            current_token = tmp;
            token = tk_list[tmp];
            token = getNextToken();
            expression();
            return;
        }
        
    }
    else if(checkToken("write"))
    {
        token = getNextToken();
        if(!checkToken("("))
        {
            setError(Errors.expectedToken("("));
            return;
        }

        token = getNextToken();
        const time2 = getTime();
        while(!checkToken(")"))
        {
            if(isStuck(time2, Errors.expectedToken, ")"))
            {
                return;
            }

            if(checkToken("string"))
            {
                program_tree.push(
                {
                    instr: "print_str",
                    str: token.value,
                    fct: current_function,
                    line: line,
                    col: col
                });
                token = getNextToken();
            }

            if(checkToken("ljump"))
            {
                program_tree.push(
                {
                    instr: "print_line_jump",
                    fct: current_function,
                    line: line,
                    col: col
                });

                token = getNextToken();
            }
            
            if(checkToken("&") || checkToken("*") || checkToken("value") || checkToken("id"))
            {
                expression();
                program_tree.push(
                {
                    instr: "print_val",
                    val: program_tree[program_tree.length-1].target,
                    fct: current_function,
                    line: line,
                    col: col
                });
            }

            if(checkToken(",") && !checkToken(")"))
            {
                token = getNextToken();
                continue;
            }
        }
        
        token = getNextToken();
        if(!checkToken(";"))
        {
            setError(Errors.missingSemiColumn());
            return;
        }

        token = getNextToken();
        return;
    }
    else if(checkToken("read"))
    {
        token = getNextToken();
        if(!checkToken("("))
        {
            setError(Errors.expectedToken("("));
            return;
        }

        token = getNextToken();
        const time2 = getTime();
        while(!checkToken(")"))
        {
            if(isStuck(time2, Errors.expectedToken, ")"))
            {
                return;
            }

            if(!checkToken("id"))
            {
                setError(Errors.missingId(""));
                return;
            }

            const id = token.value;

            token = getNextToken();

            program_tree.push(
            {
                instr: "read_val",
                id: id,
                index: set_index(),
                fct: current_function,
                line: line,
                col: col
            });

            if(checkToken(",") && !checkToken(")"))
            {
                token = getNextToken();
                continue;
            }
        }
        
        token = getNextToken();
        if(!checkToken(";"))
        {
            setError(Errors.missingSemiColumn());
            return;
        }

        token = getNextToken();
        return;
    }
    else if(checkToken("return"))
    {
        token = getNextToken();
        expression();
        
        program_tree.push(
        {
            instr: "return",
            target: program_tree[program_tree.length - 1].target,
            fct: current_function,
            line: line,
            col: col
        });

        if(!checkToken(";"))
        {
            setError(Errors.missingSemiColumn);
            return;
        }
        token = getNextToken();
        return;
    }
    else if(checkToken("if"))
    {
        token = getNextToken();
        bool_expression();
        
        if(!checkToken("then"))
        {
            setError(Errors.missingKeyWord("Alors"));
            return;
        }

        token = getNextToken();
        program_tree.push(
        {
            instr: "if",
            eval: program_tree[program_tree.length - 1].target,
            end: null,
            alt: null,
            fct: current_function,
            line: line,
            col: col
        });

        const index = program_tree.length-1;

        const timeif = getTime();
        while(!checkToken("else") && !checkToken("endif"))
        {
            if(isStuck(timeif,Errors.unexpectedToken,token.value))
            {
                return;
            }

            action();
        }
        
        
        program_tree.push(
        {
            instr: "jump",
            to: null,
            fct: current_function,
            line: line,
            col: col
        });

        const jump_index = program_tree.length-1;

        if(checkToken("else"))
        {
            program_tree[index].alt = program_tree.length;
            program_tree.push(
            {
                instr: "else",
                fct: current_function,
                line: line,
                col: col
            });
            token = getNextToken();

            const timelese = getTime();
            while(!checkToken("endif"))
            {
                if(isStuck(timelese, Errors.missingKeyWord,"Fsi"))
                {
                    return;
                }

                action();
            }
        }

        program_tree.push(
        {
            instr: "endif",
            fct: current_function,
            line: line,
            col: col
        });

        
        program_tree[index].end = program_tree.length - 1;
        program_tree[jump_index].to = program_tree.length - 1;

        if(!checkToken("endif"))
        {
            setError(Errors.missingKeyWord("Fsi"));
            return;
        }

        token = getNextToken();
        if(!checkToken(";"))
        {
            setError(Errors.missingSemiColumn());
            return;
        }

        token = getNextToken();
        return;
    }
    else if(checkToken("for"))
    {
        token = getNextToken();

        if(!checkToken("id"))
        {
            setError(Errors.missingId("POUR"));
            return;
        }
        
        let v = token.value;
        token = getNextToken();
        let index = set_index();

        if(!checkToken("<"))
        {
            setError(Errors.missingKeyWord("<- (affectation)"));
        }

        token = getNextToken();
        if(!checkToken("-"))
        {
            setError(Errors.expectedToken("<-"));
            return;
        }

        token = getNextToken();
        expression();

        program_tree.push(
        {
            instr: "save",
            val: program_tree[program_tree.length-1].target,
            target: v,
            index: index,
            type: token.type,
            fct: current_function,
            line: line,
            col: col
        });
        
        if(!checkToken("to"))
        {
            setError(Errors.expectedToken("à"));
            return;
        }

        token = getNextToken();
        expression();

        const endv = program_tree[program_tree.length-1].target;
        program_tree.push(
        {
            instr: "for",
            endv: endv,
            startv: v,
            end: null,
            index: index,
            fct: current_function,
            line: line,
            col: col
        });
        
        const startloop = program_tree.length-1;

        if(!checkToken("do"))
        {
            setError(Errors.missingKeyWord("Faire"));
            return;
        }

        token = getNextToken();

        const timewhile = getTime();
        while(!checkToken("endfor"))
        {
            if(isStuck(timewhile,Errors.missingKeyWord,"Fpour"))
            {
                return;
            }
            action();
        }
        
        program_tree.push(
        {
            instr: "step",
            start: startloop,
            index: index,
            val: v,
            endv: endv,
            fct: current_function,
            steptype: null,
            line: line,
            col: col
        });
        
        program_tree[startloop].step = program_tree.length-1;

        program_tree.push(
        {
            instr: "endfor",
            fct: current_function,
            line: line,
            col: col
        });

        const endloop = program_tree.length-1;
        program_tree[startloop].end = endloop;

        token = getNextToken();
        if(!checkToken(";"))
        {
            setError(Errors.missingSemiColumn());
            return;
        }

        token = getNextToken();
        return;
    }
    else if(checkToken("while"))
    {
        token = getNextToken();
        
        program_tree.push(
        {
            instr: "while",
            fct: current_function,
            line: line,
            col: col
        });
        
        const startloop = program_tree.length-1;

        bool_expression();

        if(!checkToken("do"))
        {
            setError(Errors.missingKeyWord("Faire"));
            return;
        }

        program_tree.push(
        {
            instr: "while_check",
            end: null,
            eval: program_tree[program_tree.length-1].target,
            line: line,
            col: col
        });

        const checkloop = program_tree.length-1;

        token = getNextToken();

        const timewhile = getTime();
        while(!checkToken("endwhile"))
        {
            if(isStuck(timewhile,Errors.missingKeyWord,"Ftq"))
            {
                return;
            }
            action();
        }
        
        program_tree.push(
        {
            instr: "jump",
            to: startloop,
            line: line,
            col: col
        });

        program_tree.push(
        {
            instr: "endwhile",
            fct: current_function,
            line: line,
            col: col
        });

        program_tree[startloop].end = program_tree.length-1;
        program_tree[checkloop].end = program_tree.length-1;

        token = getNextToken();
        if(!checkToken(";"))
        {
            setError(Errors.missingSemiColumn());
            return;
        }

        token = getNextToken();
        return;
    }
    else if(checkToken("repeat"))
    {
        token = getNextToken();
        
        program_tree.push(
        {
            instr: "repeat",
            fct: current_function,
            line: line,
            col: col
        });

        const loopstart = program_tree.length-1;

        token = getNextToken();

        const timerpt = getTime();
        while(!checkToken("until"))
        {
            if(isStuck(timerpt, Errors.missingKeyWord, "Jusqu'à"))
            {
                return;
            }
            
            action();
        }

        token = getNextToken();
        
        bool_expression();

        program_tree.push(
        {
            instr: "until",
            start: loopstart,
            eval: program_tree[program_tree.length-1].target,
            line: line,
            col: col
        });

        if(!checkToken(";"))
        {
            setError(Errors.missingSemiColumn());
            return;
        }

        token = getNextToken();
        return;
    }
    else 
    {
        token = getNextToken();
        return;
    }
}

const expression = () => 
{

    let id1 = term();
    
    const time = getTime();
    while(checkToken("+") || checkToken("-"))
    {
        if(isStuck(time, Errors.unexpectedToken,token.value))
        {
            return;
        }

        let oper = token.value;
        
        token = getNextToken();
        let id2 = term();
        program_tree.push(
        {
            instr: oper,
            val1: id1,
            val2: id2,
            target: "$"+(++interm_var),
            fct: current_function,
            line: line,
            col: col
        });
        id1 = program_tree[program_tree.length-1].target;
    }
}

const term = () =>
{
    const time = getTime();
    
    let id1 = functor();
    while(checkToken("*") || checkToken("/"))
    {
        if(isStuck(time, Errors.unexpectedToken,token.value))
        {
            return;
        }

        let oper = token.value;
        
        token = getNextToken();
        let id2 = functor();
        
        program_tree.push(
        {
            instr: oper,
            val1: id1,
            val2: id2,
            target: "$"+(++interm_var),
            fct: current_function,
            line: line,
            col: col
        });
        id1 = program_tree[program_tree.length-1].target;
    }

    return id1;
}

const functor = () => 
{
    let neg = false;
    let adr = [];

    if(checkToken("-"))
    {
        neg = true;
        token = getNextToken();
    }

    if(checkToken("("))
    {
        token = getNextToken();
        expression();
        
        if(!checkToken(")"))
        {
            setError(Errors.expectedToken(")"));
            return;
        }

        let idtmp = program_tree[program_tree.length-1].target;

        if(neg)
        {
            program_tree.push(
            {
                instr: "minus",
                val: idtmp,
                target: "$"+(++interm_var),
                fct: current_function,
                line: line,
                col: col
            });
        }

        token = getNextToken();

        return program_tree[program_tree.length-1].target;
    }

    while(checkToken("&") || checkToken("*"))
    {
        adr.push(token.id);
        token = getNextToken();
    }

    if(checkToken("id"))
    {
        let val = token.value;
        
        token = getNextToken();
        if(checkToken("("))
        {
            program_tree.push(
            {
                instr: "fct_set",
                params: null,
                fct: current_function,
                line: line,
                col: col
            });
            
            const setterIndex = program_tree.length - 1;

            token = getNextToken();
            let timefctcall = getTime();
            while(!checkToken(")"))
            {
                if(isStuck(timefctcall, Errors.expectedToken, ")"))
                {
                    return;
                }

                expression();
                program_tree.push(
                {
                    instr: "set_param",
                    val: program_tree[program_tree.length - 1].target,
                    index: set_index(),
                    to: setterIndex,
                    fct: current_function,
                    line: line,
                    col: col
                });

                if(checkToken(","))
                {
                    token = getNextToken();
                    if(checkToken(")"))
                    {
                        setError(Error.unexpectedToken(token.value));
                        return;
                    }
                }
            }

            program_tree.push(
            {
                instr: "fct_call",
                val: val,
                adr: adr,
                index: set_index(),
                target: "$"+(++interm_var),
                fct: current_function,
                params: setterIndex,
                line: line,
                col: col
            });

            token = getNextToken();
        }
        else 
        {
            program_tree.push(
            {
                instr: "load_id",
                val: val,
                adr: adr,
                index: set_index(),
                target: "$"+(++interm_var),
                fct: current_function,
                line: line,
                col: col
            });
        }

        if(neg)
        {
            program_tree.push(
            {
                instr: "minus",
                val: "$"+interm_var,
                target: "$"+(++interm_var),
                fct: current_function,
                line: line,
                col: col
            });
        }
        
        return program_tree[program_tree.length-1].target;
    }

    if((adr.length == 0) && checkToken("value"))
    {
        program_tree.push(
        {
            instr: "load_val",
            val: token.value,
            type: token.type,
            target: "$"+(++interm_var),
            fct: current_function,
            line: line,
            col: col
        });

        if(neg)
        {
            program_tree.push(
            {
                instr: "minus",
                val: "$"+interm_var,
                target: "$"+(++interm_var),
                type: token.type,
                fct: current_function,
                line: line,
                col: col
            });
        }

        token = getNextToken();
        return program_tree[program_tree.length-1].target;
    }
}

const bool_expression = () => 
{
    let id1 = bool_connection();
    const time = getTime();
    while(checkToken("and") || checkToken("or"))
    {
        if(isStuck(time, Errors.unexpectedToken,token.value))
        {
            return;
        }

        let oper = checkToken("and") ? "and" : "or";
        
        token = getNextToken();
        let id2 = bool_connection();
        program_tree.push(
        {
            instr: oper,
            val1: id1,
            val2: id2,
            target: "$"+(++interm_var),
            fct: current_function,
            line: line,
            col: col
        });
        id1 = program_tree[program_tree.length-1].target;
    }
}

const bool_connection = () => 
{
    let id1 = bool_result();
    const time = getTime();
    while(checkToken("<") || checkToken(">") || checkToken("="))
    {
        if(isStuck(time, Errors.unexpectedToken,token.value))
        {
            return;
        }

        let oper = "";

        if(checkToken("<"))
        {
            token = getNextToken();
            if(checkToken("="))
            {
                oper = "<=";
                token = getNextToken();
            }
            else if(checkToken(">"))
            {
                oper = "<>";
                token = getNextToken();
            }
            else 
            {
                oper = "<";
            }
        }
        else if(checkToken(">"))
        {
            token = getNextToken();
            if(checkToken("="))
            {
                oper = ">=";
                token = getNextToken();
            }
            else 
            {
                oper = ">";
            }
        }
        else if(checkToken("="))
        {
            oper = "="
            token = getNextToken();
        }

        let id2 = bool_result();
        program_tree.push(
        {
            instr: oper,
            val1: id1,
            val2: id2,
            target: "$"+(++interm_var),
            fct: current_function,
            line: line,
            col: col
        });
        id1 = program_tree[program_tree.length-1].target;
    }
    
    return id1;
}

const bool_result = () => 
{
    let neg = false;

    if(checkToken("non"))
    {
        neg = true;
        token = getNextToken();
    }

    if(checkToken("("))
    {
        token = getNextToken();
        bool_expression();
        
        if(!checkToken(")"))
        {
            setError(Errors.expectedToken(")"));
            return;
        }

        let idtmp = program_tree[program_tree.length-1].target;

        if(neg)
        {
            program_tree.push(
            {
                instr: "neg",
                val: idtmp,
                target: "$"+(++interm_var),
                fct: current_function,
                line: line,
                col: col
            });
        }

        token = getNextToken();

        return program_tree[program_tree.length-1].target;
    }

    expression();

    return program_tree[program_tree.length-1].target;

}

const set_index = () => 
{
    let dim = [];
    if(checkToken("["))
    {
        const time_braces = getTime();
        token = getNextToken();
        while(!checkToken("]"))
        {
            if(isStuck(time_braces, Errors.expectedToken, "]"))
            {
                return;
            }
            
            expression();

            dim.push(program_tree[program_tree.length - 1].target);

            if(checkToken(","))
            {
                token = getNextToken(); 
                if(checkToken("]"))
                {
                    setError(Errors.expectedToken("valeur entière ou expression"));
                    return;
                }
            }
        }

        token = getNextToken();
    }

    return dim;
}

const main = () =>
{
    program_main();
    declaration();
    body();

    token = getNextToken();
    if(!checkToken("."))
    {
        setError(Errors.missingKeyWord("."));
        return;
    }
    program_tree.push(
    {
        instr: "prg_end"
    });
    return;
}

const program_main = () => 
{
    if(!checkToken("algo"))
    {
        setError(Errors.missingKeyWord("Algorithme"));
        return;
    }

    token = getNextToken();
    if(!checkToken("id"))
    {
        setError(errors.missingId("Algorithme"));
        return;
    }
    
    const id = token.value;
    program_tree.push(
    {
        instr: "main",
        id: id,
        line: line,
        col: col
    });

    current_function = id;

    main_index = program_tree.length-1;
    
    token = getNextToken();
    if(!checkToken(";"))
    {
        setError(Errors.missingSemiColumn());
        return;
    }

    token = getNextToken();
    return;
}

/*
    ------------------------------------------- Grammar -------------------------------------------

    <program_root> ::= <function_declaration> <program_main> <declaration> <body>
    <declaration>  ::= <datas_declaration> <function_declaration> 
 
    <program>      ::=  algo id

    <datas_declaration>    ::=  var  <variables_declaraion> <datas_declaration>|
                                const id = val ; <datas_declaration> |
                                epsilon 

    <variables_declaraion> ::=  <variables_list> : type ; |
                                <variables_list> : type ; <variables_declaration>

    <variables_list>       ::=  id <array_declaration> |
                                id <array_declaration> , <variables_list>


    <array_declaration>    ::=  [ <array_size> ] |
                                ( <array_size> ) |
                                epsilon

    <array_size>           ::=  val | 
                                val , <array_size>


    <function_declaration> ::=  const id (<params>):type <datas_declaration> begin <action> endf <function_declaration> |
                                procedure id (<params>) <datas_declaration> begin <action> endf <function_declaration>

    <body>    ::= begin <action> end.

    <action>  ::=   id <operations> <action> | 
                    if <condition> <action> |
                    for <for_loop> <action> |
                    repeat <do_while> <action> |
                    while <while_loop> <action> |
                    write ( <write_stmt> ) ; <action> |
                    read ( <read_stmt ) ; <action> |
                    epsilon
    
    <write_stmt> ::=    <expression> |
                        <string> |
                        <expression> , <write_stmt> |
                        <string> , <write_stmt> |
    
    <read_stmt> ::=     id |
                        id , <read_stmt>

    <operations>  ::=  <affectation>

    <affectation> ::=  <array_indexes> < - <expression> <action>; 

    <condition>             ::= <bool_connectors> then <action> <alternative_condition> endif ;

    <alternative_condition> ::= else <action> | 
                                epsilon

    <for_loop> ::=  id <affectaton> to <expression> do <action> endfor ;

    <while_loop> ::= <bool_connectors> do <action> endwhile ;

    <do_while> ::= <action> until <bool_connectors> ;
    
    <expression>  ::=   <term> <expression1>

    <expression1> ::=   + <term> <expression1> | 
                        - <term> <expression1> | epsilon 
    
    <term>  ::= <functor> <term1>

    <term1> ::= * <term1> | 
                / <term1> | 
                epsilon
    
    <functor> ::=   id <array_indexes> | 
                    val | 
                    ( <expression> )

    <array_indexes> ::=     [ <indexes> ] | 
                            epsilon

    <indexes>       ::=     <expression> |
                            <expression> , <indexes>

    <bool_connectors>  ::=  <bool_expression> <bool_connectors1> |
                            not ( <bool_connectors> ) <bool_connectors1>

    <bool_connectors1> ::=  et <bool_expression> <bool_connectors1> |
                            ou <bool_expression> <bool_connectors1> |
                            epsilon

    <bool_expression>  ::=  <expression> > <expression> |
                            <expression> < <expression> |
                            <expression> = <expression> |
                            <expression> >= <expression> |
                            <expression> <= <expression> |
                            <expression> <> <expression> |
                            ( bool_connectors )

    --------------------------------------------------------------------------------------  
*/

const checkToken = (token_id) =>
{
    while((typeof(token) != "undefined") && (token.id == "white_space" || token.id == "line_break"))
    {
        if(token.id == "white_space")
        {
            col++;
        }
        else 
        {
            line++;
            col = 0;
        }

        token = getNextToken();
    }
    if(read_token != current_token)
    {
        col += typeof(token) != "undefined" ? token.value.length : 0;
        read_token = current_token;
    }
    return (typeof(token) != "undefined") && (token.id == token_id);
}

const getNextToken = () =>
{
    let nt = tk_list[current_token++];
    return nt;
}

const isStuck = (time, error, param) =>
{
    let t = getTime();
    let res = t - time;
    if(res > 75)
    {
        if(typeof(token) != "undefined")
        {
            setError(Errors.unexpectedToken(token.value));
        }
        else 
        {
            if(error != null)
            {
                if(param != null)
                {
                    setError(error(param));
                }
                else 
                {
                    setError(error());
                }
            }
        }
        return true;
    } 
    return false;
}

const getTime = () =>
{
    return new Date();
}

function setError(message)
{
    error_list.push({
        line: line,
        col: col,
        message: message
    });
}

export default parse;