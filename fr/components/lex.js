const lex = (code) =>
{
    let tokenList = [];

    let curr_char = 0;
    let curr_token = "";
    let inside_string = false;
    let inline_com = false;
    let multiline_com = false;
    let is_number = false;

    while(curr_char < code.length)
    {
        if(!multiline_com && !inline_com && code[curr_char] == '"')
        {
            inside_string = !inside_string;
        }

        if(!multiline_com &&
           !inline_com &&
           !inside_string && 
           code[curr_char] == "/" && 
           curr_char+1 < code.length  && 
           code[curr_char+1] == "/")
        {
            curr_token += "//";
            curr_char += 2;
            inline_com = true;
            continue;
        }

        if(!multiline_com &&
            !inline_com &&
            !inside_string && 
            code[curr_char] == "/" && 
            curr_char+1 < code.length  && 
            code[curr_char+1] == "*")
        {
            curr_token += "/*";
            curr_char += 2;
            multiline_com = true;
            continue;
        }

        if( multiline_com &&
            !inline_com &&
            !inside_string && 
            code[curr_char] == "*" && 
            curr_char+1 < code.length  && 
            code[curr_char+1] == "/")
        {
            curr_token += "*/";
            curr_char += 2;
            multiline_com = false;
            curr_token = "";
        }

        if(!isNaN(code[curr_char]))
        {
            is_number = true;
        }

        if(!AnalysisStoppers(code[curr_char]) || 
                             inside_string || 
                             (inline_com && !code[curr_char].match(/^\n$/)) || 
                             multiline_com || 
                             (is_number && code[curr_char].match(/^\.$/)))
        {
            curr_token += code[curr_char];
        }
        else 
        {
            inline_com = false;
            is_number = false;
            addToken(curr_token, tokenList);
            curr_token = code[curr_char];
            addToken(curr_token, tokenList);
            curr_token = "";
        }

        curr_char++;
    } 
    addToken(curr_token, tokenList);
    return tokenList;
}

export const AnalysisStoppers = (m_token) =>
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
            m_token == "." ||
            m_token == "&" ||
            m_token == "\n"
    );
}

const addToken = (m_token, tokenList) =>
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

    if(/^[Rr][Ee][Tt][Oo][Uu][Rr][Nn][Ee][Rr]$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "return",
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

    if(/^\&$/.test(m_token))
    {
        tokenList.push({
            type: "kw",
            id: "&",
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

    if(/^\.$/.test(m_token))
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

export default lex;

