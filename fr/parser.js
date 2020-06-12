
/* Current token while parsing */
let token; 

let current_Token = 0; /* index of the current Token */

let can_continue = false;

/* Main informations of the program */
let full_program = [];

let program = {
    line: 1,
    col: 1
};

let current_input = 0;

let current_function = "";

let errorList = [];
let warningList = [];
/* Detected tokens list */
let tokenList = [];

/* The functions table */
let functions_table = {};

/* The variables list */
let global_scope = {
    variables: {},
    constants: {}
};

let curr_global_scope = {
    variables: {},
    constants: {},
    params: {}
};

/* Temporary id holder */
let id_holder = [];

/* Empty everything */
function Reset()
{
    tokenList = [];
    program.line = 1;
    program.col = 1;

    functions_table = {};
    global_scope = {
        variables: {},
        constants: {}
    }

    full_program = [];

    errorList = [];
    warningList = [];
    current_Token = 0;
}

/*********************** Lexical analysis ***********************/

function Lex(code)
{
    let curr_char = 0;
    let curr_token = "";
    let inside_string = false;
    while(curr_char < code.length)
    {
        if(code[curr_char] == '"')
        {
            inside_string = !inside_string;
        }

        if(!AnalysisStoppers(code[curr_char]) || inside_string)
        {
            curr_token += code[curr_char];
        }
        else 
        {
            addToken(curr_token);
            curr_token = code[curr_char];
            addToken(curr_token);
            curr_token = "";
        }

        curr_char++;
    } 
    addToken(curr_token);
}

function AnalysisStoppers(m_token)
{
    return (
            m_token == "(" || 
            m_token == ")" || 
            m_token == "[" ||
            m_token == "]" ||
            m_token == "+" || 
            m_token == "-" ||
            m_token == "*" ||
            m_token == "/" ||
            m_token == "=" ||
            m_token == "<" ||
            m_token == ";" ||
            m_token == ":" ||
            m_token == "," ||
            m_token == " " ||
            m_token == "\n"
    );
}

function addToken(m_token)
{
    if(/^[Vv][Aa][Rr]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "var",
            value: m_token
        });

        

        return;
    }

    if(/^[Ee]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "mode",
            value: m_token
        });

        return;
    }

    if(/^[Ss]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "mode",
            value: m_token
        });

        return;
    }

    if(/^[Ee][Ss]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "mode",
            value: m_token
        });

        return;
    }

    if(/^[Rr][Ee][Ff]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "mode",
            value: m_token
        });

        return;
    }

    if(/^[Ss][Dd][Ll]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "ljump",
            value: m_token
        });

        

        return;
    }

    if(/^[Rr][Ee|Éé][Pp][Ee|Éé][Tt][Ee][Rr]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "repeat",
            value: m_token
        });

        

        return;
    }

    if(/^[Jj][Uu][Ss][Qq][Uu][\']?[Aa|Àà]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "until",
            value: m_token
        });

        

        return;
    }

    if(/^[Tt][Aa][Nn][Tt][Qq][Uu][Ee]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "while",
            value: m_token
        });

        

        return;
    }

    if(/^[Tt][Aa][Nn][Tt][Qq][Uu][Ee]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "while",
            value: m_token
        });

        

        return;
    }

    if(/^[Ff][Tt][Qq]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "endwhile",
            value: m_token
        });

        

        return;
    }

    if(/^[Àà]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "to",
            value: m_token
        });

        

        return;
    }

    if(/^[Pp][Oo][Uu][Rr]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "for",
            value: m_token
        });

        

        return;
    }

    if(/^[Ff][Oo][Nn][Cc][Tt][Ii][Oo][Nn]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "function",
            value: m_token
        });

        return;
    }
    
    if(/^[Ff][Ii][Nn]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "endf",
            value: m_token
        });

        return;
    }

    if(/^[Pp][Rr][Oo][Cc][Ee|Éé][Dd][Uu][Rr][Ee]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "procedure",
            value: m_token
        });

        return;
    }

    if(/^[Ff][Aa][Ii][Rr][Ee]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "do",
            value: m_token
        });

        

        return;
    }

    if(/^[Ff][Pp][Oo][Uu][Rr]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "endfor",
            value: m_token
        });

        

        return;
    }

    if(/^[Ff][Ss][Ii]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "endif",
            value: m_token
        });

        

        return;
    }

    if(/^[Dd][Ee|Éé][Bb][Uu][Tt]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "begin",
            value: m_token
        });

        

        return;
    }

    if(/^[Ff][Ii][Nn]\.$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "end_main",
            value: m_token
        });

        

        return;
    }

    if(/^[Ss][Ii]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "if",
            value: m_token
        });

        

        return;
    }

    if(/^[Aa][Ll][Oo][Rr][Ss]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "then",
            value: m_token
        });

        

        return;
    }

    if(/^[Ss][Ii][Nn][Oo][Nn]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "else",
            value: m_token
        });

        

        return;
    }

    if(/^[Nn][Oo][Nn]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "not",
            value: m_token
        });

        

        return;
    }

    if(/^[Ee][Tt]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "and",
            value: m_token
        });

        

        return;
    }

    if(/^[Oo][Uu]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "or",
            value: m_token
        });

        

        return;
    }

    if(/^[Ff][Ii][Nn][Ss][Ii]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "endif",
            value: m_token
        });

        

        return;
    }

    if(/^[Cc][Oo][Nn][Ss][Tt]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "const",
            value: m_token
        });

        

        return;
    }

    if(/^[Aa][Ll][Gg][Oo][Rr][Ii][Tt][Hh][Mm][Ee]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "algo",
            value: m_token
        });

        

        return;
    }

    if(/^[Ee][Nn][Tt][Ii][Ee][Rr]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "type",
            value: "int"
        });

        

        return;
    }

    if(/^[Rr][Ee|Éé][Ee][Ll]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "type",
            value: "float"
        });

        

        return;
    }

    if(/^[Bb][Oo][Oo][Ll][Ee|Éé][Ee][Nn]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "type",
            value: "bool"
        });

        

        return;
    }

    if(/^[Cc][Aa][Rr][Aa][Cc][Tt][Ee|Èè][Rr][Ee]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "type",
            value: "char"
        });

        

        return;
    }

    if(/^[Vv][Rr][Aa][Ii]$/.test(m_token))
    {
        tokenList.push({
            type: "uw",
            id: "value",
            type: "bool",
            value: true
        });

        

        return;
    }

    if(/^[Ll][Ii][Rr][Ee]$/.test(m_token))
    {
        tokenList.push({
            type: "uw",
            id: "read",
            value: m_token
        });

        

        return;
    }

    if(/^[Ee|Éé][Cc][Rr][Ii][Rr][Ee]$/.test(m_token))
    {
        tokenList.push({
            type: "uw",
            id: "write",
            value: m_token
        });

        

        return;
    }

    if(/^[Ff][Aa][Uu][Xx]$/.test(m_token))
    {
        tokenList.push({
            type: "uw",
            id: "value",
            type: "bool",
            value: false
        });

        

        return;
    }

    if(/^[0-9]+$/.test(m_token))
    {
        tokenList.push({
            type: "uw",
            id: "value",
            type: "int",
            value: m_token
        });

        

        return;
    }

    if(/^[0-9]+\.[0-9]*$/.test(m_token))
    {
        tokenList.push({
            type: "uw",
            id: "value",
            type: "float",
            value: m_token
        });

        

        return;
    }

    if(/^\'.\'$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "value",
            type: 'char',
            value: m_token[1]
        });

        

        return;
    }

    if(/^\".*\"$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "string",
            type: 'char',
            value: m_token.split('"')[1]
        });

        

        return;
    }

    if(/^\+$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "+",
            value: m_token
        });

        

        return;
    }

    if(/^\<$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "<",
            value: m_token
        });

        

        return;
    }

    if(/^\>$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: ">",
            value: m_token
        });

        

        return;
    }

    if(/^\-$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "-",
            value: m_token
        });

        

        return;
    }

    if(/^\*$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "*",
            value: m_token
        });

        

        return;
    }

    if(/^\/$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "/",
            value: m_token
        });

        

        return;
    }

    if(/^\=$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "=",
            value: m_token
        });

        

        return;
    }

    if(/^\:$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: ":",
            value: m_token
        });

        

        return;
    }

    if(/^\[$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "[",
            value: m_token
        });

        

        return;
    }

    if(/^\]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "]",
            value: m_token
        });

        

        return;
    }

    if(/^\($/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "(",
            value: m_token
        });

        

        return;
    }
    
    if(/^\)$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: ")",
            value: m_token
        });

        

        return;
    }

    if(/^\;$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: ";",
            value: m_token
        });

        

        return;
    }

    if(/^\,$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: ",",
            value: m_token
        });

        

        return;
    }

    if(/^\0$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: ".",
            value: m_token
        });

        

        return;
    }

    if(/^[A-Za-z_][A-Za-z_0-9]*$/.test(m_token))
    {
        tokenList.push({
            type: "uw",
            id: "id",
            value: m_token
        });

        

        return;
    }

    if(/^[ ]$/.test(m_token))
    {
        tokenList.push({
            id: "white_space"
        });
        return;
    }

    if(/^\n$/.test(m_token))
    {
        tokenList.push({
            id: "line_break"
        });
        return;
    }
    
}


/************ Syntaxical + Semantical analysis ************/


/******  Grammar ******/

/*

    <program_root> ::= <program_main> <declaration> <body>
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


    <function_declaration> ::=  function id (<params>):type <datas_declaration> begin <action> endf <function_declaration> |
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
*/

/*********** Recursive Descendant Analysis ***********/

function program_root()
{   
    program_main();
    declaration(full_program);
    console.log(token);
    body();

    console.log(functions_table);
}

function program_main()
{
    token = getNextToken();
    if(checkToken("algo"))
    {
        program.col+=token.value.length;
        token = getNextToken();
        if(checkToken("id"))
        {
            program.col+=token.value.length;
            functions_table[token.value] = {
                local_data: {
                    consts: {},
                    vars: {}
                },
                body: null
            };

            current_function = token.value;

            token = getNextToken();
            if(!checkToken(";"))
            {
                missingSemiColumn();
            }
        }
        else 
        {
            missingId("Algorithme");
        }
    }
    else 
    {
        missingKeyWord("Algorithme");
    }
}

function declaration(prg)
{
    token = getNextToken();

    let curr_time = getTime();
    while(checkToken("var") || checkToken("const"))
    {
        if(isStuck(curr_time, missingKeyWord, "var/const/procédure/fonction"))
        {
            return;
        }

        if(checkToken("var"))
        {
            program.col+=token.value.length;
            token = getNextToken();
            variable_declaration(prg);
        }

        if(checkToken("const"))
        {
            program.col+=token.value.length;
            token = getNextToken();
            let res = "";
            
            if(checkToken("id"))
            {
                program.col+=token.value.length;
                let id = token.value;
                token = getNextToken();
                if(checkToken("="))
                {
                    program.col+=token.value.length;
                    token = getNextToken();
                    if(checkToken("-") || checkToken("+"))
                    {
                        res += token.value;
                        token = getNextToken();
                    }

                    if(checkToken("value"))
                    {
                        res += token.value;
                        program.col+=token.value.length;
                        prg.push({
                            function: current_function,
                            instruction: "const_dec",
                            id: id,
                            type: token.type,
                            value: "("+res+")"
                        });

                        token = getNextToken();
                        if(checkToken(";"))
                        {
                            program.col+=token.value.length;
                            token = getNextToken();
                        }
                        else 
                        {
                            missingSemiColumn();
                        }
                    }
                    else 
                    {
                        unexpectedToken(token.value);
                    }
                }
                else 
                {
                    unexpectedToken(token.value);
                }
            }
            else 
            {
                unexpectedToken(token.value);
            }
        }
    }

    /*while(checkToken("function") || checkToken("procedure"))
    {
        if(isStuck(curr_time, missingKeyWord, "var/const/procédure/fonction"))
        {
            return;
        }

        if(checkToken("function"))
        {
            let tmp = current_function;
            program.col+=token.value.length;
            token = getNextToken();
            if(checkToken("id"))
            {
                program.col+=token.value.length;
                functions_table[token.value] = {
                    local_data: {
                        consts: {},
                        vars: {},
                        params: {}
                    },
                    instructions: [],
                };

                current_function = token.value;

                token = getNextToken();
                if(checkToken("("))
                {
                    token = getNextToken();
                    params(functions_table[current_function].instructions);
                }
                else 
                {
                    expectedToken("(")
                }
            }
            else 
            {
                missingId("Fonction");
            }
        }
    }*/
}

function params(instructions)
{
    let curr_time = getTime();
    while(!checkToken(")"))
    {
        if(isStuck(curr_time, unexpectedToken, token.value))
        {
            return;
        }

        if(checkToken("mode"))
        {
            let mode = token.value;
            token = getNextToken();
            if(checkToken("/"))
            {
                token = getNextToken();
                param_dec(mode, instructions);
            }
            else 
            {
                expectedToken("/");
            }

            if(checkToken(";"))
            {
                token = getNextToken();
            }
        }
    }
    token = getNextToken();
}

function param_dec(mode, instruction)
{
    let inst_List = [];
    let curr_time = getTime();
    while(!checkToken(":"))
    {
        if(isStuck(curr_time, missingSemiColumn, null))
        {
            return;
        }

        if(checkToken("id"))
        {
            program.col+=token.value.length;
            let new_inst = {
                function: current_function,
                instruction: "param_dec",
                id: token.value,
                mode: mode,
                type: null,
                shape: ""
            };
            
            token = getNextToken();
            if(checkToken("["))
            {
                program.col+=token.value.length;
                let curr_time3 = getTime();

                token = getNextToken();
                while(!checkToken("]"))
                {
                    if(isStuck(curr_time3, expectedToken, "]"))
                    {
                        return;
                    }

                    if(checkToken("value"))
                    {
                        program.col+=token.value.length;
                        new_inst.shape += token.value;
                        token = getNextToken();
                    }
                    else 
                    {
                        unexpectedToken(token.value);
                    }
                    
                    if(checkToken(","))
                    {
                        program.col+=token.value.length;
                        new_inst.shape += "*";
                        token = getNextToken();
                    }
                }

                token = getNextToken();
            }

            inst_List.push(new_inst);
        }

        if(checkToken(","))
        {
            program.col+=token.value.length;
            token = getNextToken();
            continue;
        }
    }

    if(checkToken(":"))
    {
        program.col+=token.value.length;
        token = getNextToken();
        if(checkToken("type"))
        {
            program.col+=token.value.length;
            for(let i = 0; i < inst_List.length; i++)
            {
                inst_List[i].type = token.value;
            }
            token = getNextToken();

            addInstructions(inst_List, instruction);
        }
        else 
        {
            missingType();
        }
    }
}

function variable_declaration(prg)
{
    let curr_time1 = getTime();
    while(checkToken("id"))
    {
        if(isStuck(curr_time1, missingId, "var"))
        {
            return;
        }

        let inst_List = [];

        let curr_time2 = getTime();
        while(!checkToken(";"))
        {
            if(isStuck(curr_time2, missingSemiColumn, null))
            {
                return;
            }

            if(checkToken("id"))
            {
                program.col+=token.value.length;
                let new_inst = {
                    function: current_function,
                    instruction: "var_dec",
                    id: token.value,
                    type: null,
                    shape: ""
                };
                
                token = getNextToken();
                if(checkToken("["))
                {
                    program.col+=token.value.length;
                    let curr_time3 = getTime();

                    token = getNextToken();
                    while(!checkToken("]"))
                    {
                        if(isStuck(curr_time3, expectedToken, "]"))
                        {
                            return;
                        }

                        if(checkToken("value"))
                        {
                            program.col+=token.value.length;
                            new_inst.shape += token.value;
                            token = getNextToken();
                        }
                        else 
                        {
                            unexpectedToken(token.value);
                        }
                        
                        if(checkToken(","))
                        {
                            program.col+=token.value.length;
                            new_inst.shape += "*";
                            token = getNextToken();
                        }
                    }

                    token = getNextToken();
                }

                inst_List.push(new_inst);
            }

            if(checkToken(","))
            {
                program.col+=token.value.length;
                token = getNextToken();
                continue;
            }

            if(checkToken(":"))
            {
                program.col+=token.value.length;
                token = getNextToken();
                if(checkToken("type"))
                {
                    program.col+=token.value.length;
                    for(let i = 0; i < inst_List.length; i++)
                    {
                        inst_List[i].type = token.value;
                    }

                    token = getNextToken();
                }
            }
        }

        token = getNextToken();
        addInstructions(inst_List, prg);
    }
}

function body()
{
    if(checkToken("begin"))
    {
        program.col+=token.value.length;
        token = getNextToken();

        let curr_time = getTime();
        while(!checkToken("end_main"))
        {
            if(isStuck(curr_time, missingKeyWord, "Fin."))
            {
                return;
            }

            action(full_program);
        }
        
        program.col+=token.value.length;
    }
    else 
    {
        missingKeyWord("Début");
    }
}

function action(prg)
{
    if(checkToken("id"))
    {
        program.col+=token.value.length;
        let id = token.value;
        
        token = getNextToken();
        
        if(checkToken("("))
        {
            program.col+=token.value.length;
            //call for function not available yet...
        }
        else 
        {
            let new_inst = {
                function: current_function,
                instruction: "aff",
                id: id,
                expression: null,
                indexes: ""
            };

            if(checkToken("["))
            {
                program.col+=token.value.length;
                token = getNextToken();

                let curr_time = getTime();
                while(!checkToken("]"))
                {
                    if(isStuck(curr_time,expectedToken,"]"))
                    {
                        return;
                    }
                    new_inst.indexes += "[" + expression() + "]";
                    if(checkToken(","))
                    {
                        program.col+=token.value.length;
                        token = getNextToken();
                    }
                }
                program.col+=token.value.length;

                token = getNextToken();
            }

            if(checkToken("<"))
            {
                program.col+=token.value.length;
                token = getNextToken();
                if(checkToken("-"))
                {
                    program.col+=token.value.length;
                    token = getNextToken();
                    new_inst.expression = expression();
                    if(checkToken(";"))
                    {
                        program.col+=token.value.length;
                        token = getNextToken();
                        prg.push(new_inst);
                        return;
                    }
                    else 
                    {
                        missingSemiColumn();
                    }
                }
            }
        }
    }

    if(checkToken("if"))
    {
        program.col+=token.value.length;
        token = getNextToken();
        let new_inst = {
            function: current_function,
            instruction: "cond",
            bool_exp: condition(),
            instructions: [],
            alt_instructions: []
        };

        if(checkToken("then"))
        {
            program.col+=token.value.length;
            token = getNextToken();

            let curr_time = getTime();
            while(!checkToken("endif"))
            {
                if(isStuck(curr_time, missingKeyWord, "Finsi"))
                {
                    return;
                }
                action(new_inst.instructions);
                if(checkToken("else"))
                {
                    program.col+=token.value.length;
                    token = getNextToken();
                    action(new_inst.alt_instructions);
                }
            }
            
            program.col+=token.value.length;
            token = getNextToken();
            if(checkToken(";"))
            {
                program.col+=token.value.length;
                prg.push(new_inst);
                token = getNextToken();
                return;
            }
            else 
            {
                missingSemiColumn();
            }
        }
        else 
        {
            missingKeyWord("Alors");
        }
    }

    if(checkToken("for"))
    {
        program.col+=token.value.length;
        let f_inst = {
            function: current_function,
            instruction: "floop",
            instruction_init: null,
            instructions: [],
            max_val: null
        };

        token = getNextToken();
        if(checkToken("id"))
        {
            program.col+=token.value.length;
            
            let id = token.value;

            let new_inst = {
                function: current_function,
                instruction: "aff",
                id: id,
                expression: null,
                indexes: ""
            };

            token = getNextToken();
            if(checkToken("["))
            {
                program.col+=token.value.length;
                token = getNextToken();

                let curr_time = getTime();
                while(!checkToken("]"))
                {
                    if(isStuck(curr_time, expectedToken("]")))
                    {
                        return;
                    }

                    new_inst.indexes += expression();
                    if(checkToken(","))
                    {
                        program.col+=token.value.length;
                        new_inst.indexes += ",";
                        token = getNextToken();
                    }
                }
                program.col+=token.value.length;

                token = getNextToken();
            }

            if(checkToken("<"))
            {
                program.col+=token.value.length;
                token = getNextToken();
                if(checkToken("-"))
                {
                    program.col+=token.value.length;
                    token = getNextToken();
                    new_inst.expression = expression();
                    f_inst.instruction_init = new_inst;

                    if(checkToken("to"))
                    {
                        program.col+=token.value.length;
                        token = getNextToken();
                        f_inst.max_val = expression();
                        if(checkToken("do"))
                        {   
                            program.col+=token.value.length;
                            token = getNextToken();
                            let curr_time2 = getTime();
                            while(!checkToken("endfor"))
                            {
                                if(isStuck(curr_time2, missingKeyWord, "Faire"))
                                {
                                    return;
                                }
                                action(f_inst.instructions);
                            }
                            program.col+=token.value.length;
                            token = getNextToken();
                            if(checkToken(";"))
                            {
                                program.col+=token.value.length;
                                token = getNextToken();
                                prg.push(f_inst);
                                return;
                            }
                            else 
                            {
                                missingSemiColumn();
                            }
                        }
                        else 
                        {
                            missingKeyWord("Faire");
                        }
                    }
                    else 
                    {
                        expectedToken("à");
                    }
                }
                else 
                {
                    unexpectedToken(token.value);
                }
            }
            else 
            {
                unexpectedToken(token.value);
            }
        }
        else 
        {
            unexpectedToken(token.value);
        }
    }

    if(checkToken("while"))
    {
        program.col+=token.value.length;
        token = getNextToken();
        let w_inst = {
            function: current_function,
            instruction: "wloop",
            bool_exp: condition(),
            instructions: [],
            max_val: null
        };

        if(checkToken("do"))
        {
            program.col+=token.value.length;
            token = getNextToken();

            let curr_time = getTime();
            while(!checkToken("endwhile"))
            {
                if(isStuck(curr_time, missingKeyWord, "Ftq"))
                {
                    return;
                }
                action(w_inst.instructions);
            }

            program.col+=token.value.length;
            token = getNextToken();

            if(checkToken(";"))
            {
                program.col+=token.value.length;
                token = getNextToken();
                prg.push(w_inst);
                return;
            }
            else 
            {
                missingSemiColumn();
            }
        }
    }

    if(checkToken("repeat"))
    {
        program.col+=token.value.length;
        token = getNextToken();
        let dw_inst = {
            function: current_function,
            instruction: "dwloop",
            bool_exp: null,
            instructions: [],
            max_val: null
        };
        
        let curr_time = getTime();
        while(!checkToken("until"))
        {
            if(isStuck(curr_time, missingKeyWord, "Jusqua"))
            {
                return;
            }

            action(dw_inst.instructions);
        }
        program.col+=token.value.length;
        token = getNextToken();
        dw_inst.bool_exp = condition();

        if(checkToken(";"))
        {
            program.col+=token.value.length;
            token = getNextToken();
            prg.push(dw_inst);
            return;
        }
        else 
        {
            missingSemiColumn();
        }
    }

    if(checkToken("write"))
    {
        program.col+=token.value.length;
        token = getNextToken();
        if(checkToken("("))
        {
            program.col+=token.value.length;
            token = getNextToken();
            let write_inst = {
                function: current_function,
                instruction: "write",
                content: [],
            };

            let curr_time = getTime();
            while(!checkToken(")"))
            {
                if(isStuck(curr_time, expectedToken, ")"))
                {
                    return;
                }

                if(checkToken("string"))
                {
                    program.col+=token.value.length;
                    write_inst.content.push(
                    {
                        type: "string",
                        value: token.value
                    });
                    token = getNextToken();
                }
                else if(checkToken("ljump")) 
                {
                    program.col+=token.value.length;
                    write_inst.content.push(
                    {
                        type: "line_break",
                        value: token.value
                    });
                    token = getNextToken();
                }
                else 
                {
                    write_inst.content.push(
                    {
                        type: "expression",
                        value: expression()
                    });
                }

                if(checkToken(","))
                {
                    program.col+=token.value.length;
                    token = getNextToken();
                }
            }

            token = getNextToken();
            if(checkToken(";"))
            {
                program.col+=token.value.length;
                prg.push(write_inst);
                token = getNextToken();
            }
            else 
            {
                missingSemiColumn();
            }
        }
        else 
        {
            expectedToken("(")
        }
    }

    if(checkToken("read"))
    {
        program.col+=token.value.length;
        token = getNextToken();
        if(checkToken("("))
        {
            program.col+=token.value.length;
            token = getNextToken();

            let curr_time = getTime();
            
            let read_inst = {
                function: current_function,
                instruction: "read",
                variables: [],
            };

            while(!checkToken(")"))
            {
                if(isStuck(curr_time, expectedToken, ")"))
                {
                    return;
                }

                if(checkToken("id"))
                {
                    program.col+=token.value.length;
                    let var_instruction = {
                        id: token.value,
                        indexes: ""
                    };

                    token = getNextToken();

                    if(checkToken("["))
                    {
                        program.col+=token.value.length;
                        token = getNextToken();
                        let curr_time2 = getTime();
                        while(!checkToken("]"))
                        {
                            if(isStuck(curr_time2,expectedToken,"]"))
                            {
                                return;
                            }
                            var_instruction.indexes += "[" + expression() + "]";
                            if(checkToken(","))
                            {
                                program.col+=token.value.length;
                                token = getNextToken();
                            }
                        }
                        program.col+=token.value.length;
                        token = getNextToken();
                    }
                    read_inst.variables.push(var_instruction);
                    if(checkToken(","))
                    {
                        program.col+=token.value.length;
                        token = getNextToken();
                    }
                }
                else 
                {
                    unexpectedToken(token.value);
                }
            }

            token = getNextToken();
            if(checkToken(";"))
            {
                program.col+=token.value.length;
                prg.push(read_inst);
                token = getNextToken();
            }
            else 
            {
                missingSemiColumn();
            }
        }
        else 
        {
            expectedToken("(");
        }
    }
}

function condition()
{
    let b_exp = "";
    b_exp += bool_expression();
    let curr_time = getTime();
    while(checkToken("and") || checkToken("or"))
    {
        if(isStuck(curr_time, missingKeyWord, "et/ou"))
        {
            return;
        }

        if(checkToken("and"))
        {
            program.col+=token.value.length;
            token = getNextToken();
            b_exp += "&&" + bool_expression();
        }

        if(checkToken("or"))
        {
            program.col+=token.value.length;
            token = getNextToken();
            b_exp += "||" + bool_expression();
        }
        
    }
    return b_exp;
}

function bool_expression()
{
    if(checkToken("not"))
    {
        program.col+=token.value.length;
        let b_exp = "";
        token = getNextToken();
        b_exp += "!";
        if(checkToken("("))
        {
            program.col+=token.value.length;
            b_exp += "(";
            token = getNextToken();

            let curr_time = getTime();
            while(!checkToken(")"))
            {
                if(isStuck(curr_time, expectedToken, ")"))
                {
                    return;
                }

                b_exp += condition();
            }
            program.col+=token.value.length;
            b_exp += ")";
            token = getNextToken();
        }
        else 
        {
            expectedToken("(");
        }
        return b_exp;
    }
    else if(checkToken("("))
    {
        program.col+=token.value.length;
        token = getNextToken();
        let res = "(";
        let curr_time = getTime();
        while(!checkToken(")"))
        {
            if(isStuck(curr_time, expectedToken, ")"))
            {
                return;
            }
            res += condition();
        }
        res += ")";
        token = getNextToken();
        return res;
    }
    else 
    {
        let res = "" + expression();
        let op = ""
        if(checkToken("="))
        {
            program.col+=token.value.length;
            op = "==";
            token = getNextToken();
        }
        else if(checkToken("<"))
        {
            program.col+=token.value.length;
            op = "<";
            token = getNextToken();
            if(checkToken(">"))
            {
                program.col+=token.value.length;
                op = "!=";
                token = getNextToken();
            }

            if(checkToken("="))
            {
                program.col+=token.value.length;
                op += "=";
                token = getNextToken();
            }
        }
        else if(checkToken(">"))
        {
            program.col+=token.value.length;
            op = ">";
            token = getNextToken();
            if(checkToken("="))
            {
                program.col+=token.value.length;
                op += "=";
                token = getNextToken();
            }
        }
        else 
        {
            unexpectedToken(token.value);
        }

        return res + op + expression();
    }
    
}

function expression()
{
    let exp = ""
    exp = exp + term();
    
    let curr_time = getTime();
    while(checkToken("+") || checkToken("-"))
    {
        if(isStuck(curr_time, expectedToken, "+/-"))
        {
            return;
        }
        exp += token.value;
        token = getNextToken();
        exp += term();
    }

    return exp;
}

function term()
{
    let exp = ""
    exp = exp + functor();

    let curr_time = getTime();
    while(checkToken("*") || checkToken("/"))
    {
        if(isStuck(curr_time, expectedToken, "*//"))
        {
            return;
        }
        exp += token.value;
        token = getNextToken();
        exp += functor();
    }

    return exp;
}

function functor()
{
    let res = "";
    if(checkToken("-"))
    {
        res += "-";
        token = getNextToken();
    }
    else if(checkToken("+")) 
    {
        token = getNextToken();
    }

    if(checkToken("id"))
    {
        program.col+=token.value.length;
        res += token.value;
        token = getNextToken();
        if(checkToken("["))
        {
            program.col+=token.value.length;
            res += "[";
            token = getNextToken();

            let curr_time = getTime();
            while(!checkToken("]"))
            {
                if(isStuck(curr_time, expectedToken, "]"))
                {
                    return;
                }
                res += expression();
                res += "]"

                if(checkToken(","))
                {
                    program.col+=token.value.length;
                    res += "[";
                    token = getNextToken();
                }
            }

            program.col+=token.value.length;
            token = getNextToken();
        }

        return res;
    }

    if(checkToken("value"))
    {
        program.col+=token.value.length;
        res += token.value;
        token = getNextToken();
        return res;
    }

    if(checkToken("("))
    {
        program.col+=token.value.length;
        res += "(";
        token = getNextToken();

        let curr_time = getTime();
        while(!checkToken(")"))
        {
            if(isStuck(curr_time, expectedToken, ")"))
            {
                return;
            }
            res += expression();
        }
        program.col+=token.value.length;

        res += ")";
        token = getNextToken();

        return res;
    }
}

/***************** Semantic Analysis *****************/

function declarer(id, type, shape, dtype, c_fct, init_value)
{
    if(existId(id, functions_table[c_fct].local_data["vars"]))
    {
        usedVarError(id);
    }
    else if(existId(id, functions_table))
    {
        usedVarError(id);
    }
    else if(existId(id, functions_table[c_fct].local_data["consts"]))
    {
        usedVarError(id);
    }
    else 
    {
        functions_table[c_fct].local_data[dtype][id] = {
            type: type,
            value: init_value,
            shape: shape
        }

        if(typeof(shape) != "undefined" && shape != "")
        {
            functions_table[c_fct].local_data[dtype][id].value = declareArray(shape);
        }
    }
}

function affectation(instr)
{
    if(existId(instr.id, functions_table[instr.function].local_data["vars"]))
    {
        let res = evaluate_expression(instr.expression, instr.function);
        if(functions_table[instr.function].local_data["vars"][instr.id].type == "int")
        {
            if(getType(res) == "float")
            {
                impliciteConversion("float", "int");
                res = parseInt(res);
            }
            else if(getType(res) == "bool")
            {
                conflictingTypes("bool", "int");
            }
        }
        else if(functions_table[instr.function].local_data["vars"][instr.id].type == "float")
        {
            if(getType(res) == "bool")
            {
                conflictingTypes("bool", "float");
            }
        }

        let aff = 'functions_table["'+instr.function+'"].local_data.vars["'+instr.id+'"].value' + evaluate_expression(instr.indexes, instr.function) + '=' + res;
        
        return eval(aff);
    }
    else if(existId(instr.id, functions_table[instr.function].local_data["consts"]))
    {
        constAffectation(instr.id);
    }
    else 
    {
        undeclaredVar(instr.id);
    }
}

function evaluate_expression(expr, curr_fct)
{
    expr += ";";
    let result = "";
    let var_detector = "";
    for(let i = 0; i < expr.length; i++)
    {
        if(/^[A-Za-z_]/.test(expr[i]))
        {
            for(let j = i; j < expr.length; j++)
            {
                if(/^[A-Za-z_]/.test(expr[j]))
                {
                    var_detector+=expr[j];
                }
                else 
                {
                    break;
                }
            }
            
            let str; 
            if(var_detector != "true" && var_detector != "false")
            {
                if(existId(var_detector, functions_table[curr_fct].local_data["vars"]))
                {
                    str = 'functions_table["'+curr_fct+'"].local_data.vars["'+var_detector+'"].value';
                }
                else if(existId(var_detector, functions_table[curr_fct].local_data["consts"]))
                {
                    str = ""+functions_table[curr_fct].local_data.consts[var_detector].value;
                }
                else 
                {
                    undeclaredVar(var_detector);
                }
            }
            else 
            {
                str = var_detector;
            }
            result += str;
            i = parseInt(i + var_detector.length - 1);
            var_detector = "";
        }
        else 
        {
            result+=expr[i];
        }
    }
    
    let holder = result;
    result = "";
    for(let i = 0; i < holder.length-1; i++)
    {
        result += holder[i];
    }
    return result;
}

function evalcond(instr)
{
    let res = eval(evaluate_expression(instr.bool_exp, instr.function));
    return res;
}

function evalfloop(prg)
{
    let val = eval('functions_table["'+prg.function+'"].local_data.vars["'+
                    prg.instruction_init.id+'"].value' + prg.instruction_init.indexes);
    let res = eval(evaluate_expression(prg.max_val, prg.function));
    return val <= res;
}

function write_message(prg)
{
    let message = "";
    for(let i = 0; i < prg.content.length; i++)
    {
        if(prg.content[i].type == "expression")
        {
            message += eval(evaluate_expression(prg.content[i].value, prg.function));
        }
        else if(prg.content[i].type == "string")
        {
            message += prg.content[i].value;
        }
        else 
        {
            message += "<br>"; 
        }
    }

    return message;
}

function read_variable(prg, id, indexes)
{
    return new Promise((resolve, reject) => 
    {
        $("#exec .log").append("<input type='text' class='input' id='"+current_input+"'><br>");
        $("#"+current_input).focus();
        $('.input').keydown(function(e) 
        {
            if (e.keyCode == 13) 
            {
                if(!$(this).prop("disabled"))
                {
                    const res = $(this).val();
                    $(this).prop("disabled", true);
                    current_input++;
                    if(existId(id, functions_table[prg.function].local_data["vars"]))
                    {
                        if(functions_table[prg.function].local_data["vars"][id].type == "int")
                        {
                            if(getType(res) == "float")
                            {
                                impliciteConversion("float", "int");
                                res = parseInt(res);
                            }
                            else if(getType(res) == "bool")
                            {
                                conflictingTypes("bool", "int");
                            }
                            else if(getType(res) != "int")
                            {
                                conflictingTypes("string", "int");
                            }
                        }
                        else if(functions_table[prg.function].local_data["vars"][id].type == "float")
                        {
                            if(getType(res) == "bool")
                            {
                                conflictingTypes("bool", "float");
                                return "";
                            }
                            else if(getType(res) != "int" && getTime(res) != "float")
                            {
                                conflictingTypes("string", "float");
                                return "";
                            }
                        }
                        eval("functions_table['"+prg.function+"'].local_data.vars['"+id+"'].value"+evaluate_expression(indexes, prg.function)+"="+ res);
                        resolve(res);
                        
                    }
                    else if(existId(prg.variables[i], functions_table[prg.function].local_data["consts"]))
                    {
                        constRead(prg.variables[i]);
                    }
                    else 
                    {
                        undeclaredVar(prg.variables[i]);
                    }
                    
                    resolve(res);
                }
                else 
                {
                    resolve("already_used");
                }
            }
        });
    });
}
/***************** Parsing *****************/

function Parse()
{
    let code = $("#txtcode").val();

    Reset();
    
    Lex(code);
    
    program_root();
    displayErrors();
}

function exec()
{
    if(full_program.length > 0 && errorList.length == 0)
    {
        $("#exec .log").empty();
        $("#exec").show();
        execute(full_program);
    }
    else 
    {
        alert("One of these problems occures:"+
              "\n- You didn't type any code yet."+
              "\n- You didn't build yet."+
              "\n- Your code contains 1 or many errors."+
              "\n\nPlease, make sure you have none of the problems above before being able to execute.");
    }
}

async function floop(prg)
{
    let curr_time = getTime();
    affectation(prg.instruction_init);
    while(evalfloop(prg))
    {
        await execute(prg.instructions);
        eval('functions_table["'+prg.function+'"].local_data.vars["'+prg.instruction_init.id+'"].value' + prg.instruction_init.indexes + '+=' + 1);
    }
    return new Promise((resolve, reject) => 
    {
        resolve("done");
    });
}

async function execute(f_program)
{
    
    for(let i = 0; i < f_program.length; i++)
    {
        let prg = f_program[i];
        switch(prg.instruction)
        {
            case "var_dec": 
            {
                declarer(prg.id, prg.type, prg.shape, "vars", prg.function, null);
                break;
            }
            case "const_dec": 
            {
                declarer(prg.id, prg.type, prg.shape, "consts", prg.function, prg.value);
                break;
            }
            case "aff": 
            {
                affectation(prg);
                break;
            }
            case "cond": 
            {
                if(evalcond(prg))
                {
                    await execute(prg.instructions)
                }
                else 
                {
                    await execute(prg.alt_instructions);
                }
                break;
            }
            case "floop":
            {
                await floop(prg);
                break;
            }
            case "wloop":
            {
                while(evalcond(prg))
                {
                    await execute(prg.instructions);
                }
                break;
            }
            case "dwloop":
            {
                do
                {
                    await execute(prg.instructions);
                }while(!evalcond(prg));

                break;
            }
            case "write":
            {
                $("#exec .log").append(write_message(prg));
                break;
            }
            case "read":
            {
                for(let j = 0; j < prg.variables.length; j++)
                {
                    await read_variable(prg, prg.variables[j].id, prg.variables[j].indexes);
                }

                break;
            }
        }
    }

    return new Promise((resolve, reject) => 
    {
        resolve("finished");
    });
}



/***************** Primitives *******************/
function checkToken(token_id)
{
    while((typeof(token) != "undefined") && (token.id == "white_space" || token.id == "line_break"))
    {
        if(token.id == "white_space")
        {
            program.col++;
        }
        else 
        {
            program.line++;
            program.col = 0;
        }

        token = getNextToken();
    }
    return (typeof(token) != "undefined") && (token.id == token_id);
}

function getNextToken()
{
    let nt = tokenList[current_Token++];
    
    return nt;
}

function existId(id, table)
{
    return typeof(table[id]) != "undefined";
}

function ArrayMaker(shape)
{
    arr = "";
    for(let i = 0; i < shape.length; i++)
    {
        if(i == shape.length-1)
        {
            arr += "new Array("+shape[i]+").fill(0)";
        }
        else 
        {
            arr += "new Array("+shape[i]+").fill(0).map(() => ";
        }
    }

    for(let i = 0; i < shape.length-1; i++)
    {
        arr += ")";
    }

    return eval(arr);
}


function addInstructions(arr, prg)
{
    for(let i = 0; i < arr.length; i++)
    {
        prg.push(arr[i]);
    }
}

function declareArray(shape)
{
    return ArrayMaker(parseArrayInt(shape.split("*")));
}

function shift(arr)
{
    let n_arr = [];
    for(let i = 1; i < arr.length; i++)
    {
        n_arr.push(arr[i]);
    }

    return n_arr;
}

function parseArrayInt(arr)
{
    let intarr = [];
    for(let i = 0; i < arr.length; i++)
    {
        intarr.push(parseInt(arr[i]));
    }

    return intarr;
}

function checkIndexes(arr)
{
    for(let i = 0; i < arr.length; i++)
    {
        if(arr[i] < 0)
        {
            return false;
        }
    }

    return true;
}

function existIdInArray(id, arr)
{
    for(let i = 0; i < arr.length; i++)
    {
        if(arr[i].id == id)
        {
            return true;
        }
    }

    return false;
}

function getType(val)
{
    if(/^[0-9]+\.[0-9]*$/.test(val))
    {
        return "float";
    }
    else if(/^[0-9]+$/.test(val))
    {
        return "int";
    }
    if(val == "true" || val == "false")
    {
        return "bool";
    }
}

function getTime()
{
    return new Date();
}

/* Errors handler */
function setError(message)
{
    errorList.push({
        line: program.line,
        col: program.col,
        message: message
    });
}

function setWarning(message)
{
    warningList.push({
        line: program.line,
        col: program.col,
        message: message
    });
}

function usedVarError(id)
{
    setError("Identifiant '"+id+"' déjà utilisé.");
}

function missingSemiColumn()
{
    setError("Token de fin d'instruction ';' manquant.");
}

function missingId(fun)
{
    setError("Il faut un identifiant pour votre "+fun+". ("+fun+" identifient)");
}

function missingKeyWord(kw)
{
    setError("Mot clé '"+kw+"' manquant.");
}

function unexpectedToken(tk)
{
    setError("Token '"+tk+"' inattendu.");
}

function expectedToken(tk) 
{
    setError("Token '"+tk+"' attendu.");
}

function missingType()
{
    setError("Type attendu.");
}

function wrongType(type_expected, type_used)
{
    setError("Utilisation d'un type '"+type_used+"', type '"+type_expected+"' attendu.");
}

function undeclaredVar(id)
{
    setError("Utilisation d'une variable non déclarée '"+id+"'.");
}

function constAffectation(id)
{
    setError("Opération interdite. Affectation d'une valeur à une constante '"+id+"'.");
}

function constRead(id)
{
    setError("Opération interdite. Lecture d'une valeur dans une constante '"+id+"'.");
}

function isStuck(time, error, param)
{
    let t = getTime();
    let res = t - time;
    if(res > 75)
    {
        if(typeof(token) != "undefined")
        {
            unexpectedToken(token.value);
        }
        else 
        {
            if(error != null)
            {
                if(param != null)
                {
                    error(param);
                }
                else 
                {
                    error();
                }
            }
        }
        return true;
    } 
    return false;
}

function conflictingTypes(t1, t2)
{
    setError("Opération entre 2 types incompatibles ("+t1+", "+t2+"). Conversion implicite impossible.");
}

function displayErrors()
{
    if(errorList.length > 0)
    {
        $("#build .log").empty();
        for(let i = 0; i < errorList.length; i++)
        {
            $("#build .log").append("<div><span class='error'>ERREUR! ligne "+errorList[i].line+""+
                                  ", colonne "+ errorList[i].col + "</span>: "+ 
                                  errorList[i].message);
        }
        $("#build").show();
    }
}

/* Warning handler */

function impliciteConversion(from, to)
{
    setWarning( "Attention ! utilisation de 2 types différents,"+ 
                "une convertion implicite a été efféctuée (" + from + " -> " + to + ").");
}

$(document).ready(function()
{
    $(document).on("keypress", function(e)
    {
        if(e.which == 13){
            if(!can_continue)
            {
                can_continue = true;
            }
        }
    });
})