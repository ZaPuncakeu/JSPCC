import {AnalysisStoppers} from './components/lex.js'
import {compile} from './compiler.js';

$(document).ready(function()
{   
    $('input[type="file"]').change(function(e){
        var myFile = $(this).prop('files')[0];
        readFile(myFile).then(content => 
        {
            $("#txtcode").val(content);
            updateEditor();
            $('input[type="file"]').val(null);
        });
    });

    function readFile(file)
    {
        const reader = new FileReader();
        return new Promise((resolve, reject) => 
        {
            reader.onload = event => resolve(event.target.result)
            reader.onerror = error => reject(error)
            reader.readAsText(file)
        });
    }

    $(document).delegate('#txtcode', 'keydown', function(e) 
    {
        var keyCode = e.keyCode || e.which;
      
        if (keyCode == 9) 
        {
          e.preventDefault();
          var start = this.selectionStart;
          var end = this.selectionEnd;
      
          // set textarea value to: text before caret + tab + text after caret
          $(this).val($(this).val().substring(0, start)
                      + "    "
                      + $(this).val().substring(end));
      
          // put caret at right position again
          this.selectionEnd = start + 4;
          updateEditor();
        }
    });

    $("#txtcode").on("input", function()
    {
        updateEditor();
    });

    function updateEditor()
    {
        let code = $("#txtcode").val();

        let temp = $("#txtcode").val().split("\n");
        $(".line_num").empty();
        let nums = "";
        for(let i = 1; i <= temp.length; i++)
        {
            nums += "<div>"+i+"<div>";
        }

        $(".line_num").html(nums);

        $(".code").empty().html(getKeyWords(code)); 
        $(".code").append("<br>"); 
    }

    (function() 
    {
        var target1 = $(".code");
        var target2 = $(".line_num");
        $("#txtcode").scroll(function() 
        {
            target1.prop("scrollTop", this.scrollTop)
                .prop("scrollLeft", this.scrollLeft);

            target2.prop("scrollTop", this.scrollTop)
                .prop("scrollLeft", this.scrollLeft);
        });
    })();
});

function getKeyWords(code)
{
    let newcode = "";
    let curr_char = 0;
    let curr_token = "";
    let inside_string = false;
    let inline_com = false;
    let is_number = false;

    let multiline_com = false;

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
            newcode += highlight(curr_token);
            curr_char += 2;
            multiline_com = false;
            curr_token = ""
            if(curr_char >= code.length)
            {
                break;
            }
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
            newcode += highlight(curr_token);
            curr_token = code[curr_char];
            newcode += highlight(curr_token);
            curr_token = "";
        }
        curr_char++;
    } 
    newcode += highlight(curr_token);
    return newcode.split("\n").join("<br>")
}

function highlight(m_token)
{
    if(/^\/\/.*$/.test(m_token))
    {
        return "<span class='com'>"+m_token.split(" ").join("&nbsp;")+"</span>";
    }

    if(/\*[^*]*\*+(?:[^\/\*][^*]*\*+)*\/$/.test(m_token))
    {
        let res = m_token.split(" ").join("&nbsp;");
        res = res.split("\n").join("<br>");
        return "<span class='com'>"+res+"</span>";
    }

    if(/^[Ff][Oo][Nn][Cc][Tt][Ii][Oo][Nn]$/.test(m_token))
    {
        return "<span class='kw'>"+m_token+"</span>";
    }

    if(/^[Pp][Rr][Oo][Cc][Ee|Éé][Dd][Uu][Rr][Ee]$/.test(m_token))
    {
        return "<span class='kw'>"+m_token+"</span>";
    }

    if(/^[Ee]$/.test(m_token))
    {
        return "<span class='transm'>"+m_token+"</span>";
    }

    if(/^[Ss]$/.test(m_token))
    {
        return "<span class='transm'>"+m_token+"</span>";
    }

    if(/^[Ee][Ss]$/.test(m_token))
    {
        return "<span class='transm'>"+m_token+"</span>";
    }

    if(/^[Rr][Ee][Ff]$/.test(m_token))
    {
        return "<span class='transm'>"+m_token+"</span>";
    }

    if(/^[Vv][Aa][Rr]$/.test(m_token))
    {
        return "<span class='dec'>"+m_token+"</span>";
    }

    if(/^[Ss][Dd][Ll]$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^[Rr][Ee|Éé][Pp][Ee|Éé][Tt][Ee][Rr]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Jj][Uu][Ss][Qq][Uu][\']?[Aa|Àà]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Tt][Aa][Nn][Tt][Qq][Uu][Ee]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Ff][Tt][Qq]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Àà]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Pp][Oo][Uu][Rr]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Ff][Aa][Ii][Rr][Ee]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Ff][Pp][Oo][Uu][Rr]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Ff][Ss][Ii]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Dd][Ee|Éé][Bb][Uu][Tt]$/.test(m_token))
    {
        return "<span class='kw'>"+m_token+"</span>";
    }

    if(/^[Ff][Ii][Nn]$/.test(m_token))
    {
        return "<span class='kw'>"+m_token+"</span>";
    }

    if(/^[Ss][Ii]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Aa][Ll][Oo][Rr][Ss]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Ss][Ii][Nn][Oo][Nn]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Nn][Oo][Nn]$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^[Ee][Tt]$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^[Oo][Uu]$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^[Ff][Ii][Nn][Ss][Ii]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^[Cc][Oo][Nn][Ss][Tt]$/.test(m_token))
    {
        return "<span class='dec'>"+m_token+"</span>";
    }

    if(/^[Aa][Ll][Gg][Oo][Rr][Ii][Tt][Hh][Mm][Ee]$/.test(m_token))
    {
        return "<span class='kw'>"+m_token+"</span>";
    }

    if(/^[Ee][Nn][Tt][Ii][Ee][Rr]$/.test(m_token))
    {
        return "<span class='dec'>"+m_token+"</span>";
    }

    if(/^[Rr][Ee|Éé][Ee][Ll]$/.test(m_token))
    {
        return "<span class='dec'>"+m_token+"</span>";
    }

    if(/^[Bb][Oo][Oo][Ll][Ee|Éé][Ee][Nn]$/.test(m_token))
    {
        return "<span class='dec'>"+m_token+"</span>";
    }

    if(/^[Cc][Aa][Rr][Aa][Cc][Tt][Ee|Èè][Rr][Ee]$/.test(m_token))
    {
        return "<span class='dec'>"+m_token+"</span>";
    }

    if(/^[Vv][Rr][Aa][Ii]$/.test(m_token))
    {
        return "<span class='valuebool'>"+m_token+"</span>";
    }

    if(/^[Ll][Ii][Rr][Ee]$/.test(m_token))
    {
        return "<span class='rw'>"+m_token+"</span>";
    }

    if(/^[Ee|Éé][Cc][Rr][Ii][Rr][Ee]$/.test(m_token))
    {
        return "<span class='rw'>"+m_token+"</span>";
    }

    if(/^[Ff][Aa][Uu][Xx]$/.test(m_token))
    {
        return "<span class='valuebool'>"+m_token+"</span>";
    }

    if(/^[0-9]+$/.test(m_token))
    {
        return "<span class='valuenum'>"+m_token+"</span>";
    }

    if(/^[0-9]+\.[0-9]*$/.test(m_token))
    {
        return "<span class='valuenum'>"+m_token+"</span>";
    }

    if(/^\'.\'$/.test(m_token))
    {
        return "<span class='valuechar'>"+m_token+"</span>";
    }

    if(/^[Rr][Ee][Tt][Oo][Uu][Rr][Nn][Ee][Rr]$/.test(m_token))
    {
        return "<span class='instr'>"+m_token+"</span>";
    }

    if(/^\".*\"$/.test(m_token))
    {
        return "<span class='valuestring'>"+m_token.split(" ").join("&nbsp;")+"</span>";
    }

    if(/^\+$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\<$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\>$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\-$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\*$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\/$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\=$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\:$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\[$/.test(m_token))
    {
        return "<span class='normal'>"+m_token+"</span>";
    }

    if(/^\]$/.test(m_token))
    {
        return "<span class='normal'>"+m_token+"</span>";
    }

    if(/^\($/.test(m_token))
    {
        return "<span class='normal'>"+m_token+"</span>";
    }
    
    if(/^\)$/.test(m_token))
    {
        return "<span class='normal'>"+m_token+"</span>";
    }

    if(/^\;$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\.$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\,$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^\&$/.test(m_token))
    {
        return "<span class='symbol'>"+m_token+"</span>";
    }

    if(/^[A-Za-z_][A-Za-z_0-9]*$/.test(m_token))
    {
        return "<span class='var'>"+m_token+"</span>";
    }

    if(/^[ ]$/.test(m_token))
    {
        return "&nbsp;";
    }

    if(/^\n$/.test(m_token))
    {
        return "<br>";
    }

    return m_token;
    
}
