export function usedVarError(id)
{
    return("Identifiant '"+id+"' déjà utilisé.");
}

export function missingType()
{
    return("Type attendu.");
}

export function missingMode()
{
    return("Mode de transmission manquant.");
}

export function missingValue()
{
    return("Valeur manquante.");
}

export function missingSemiColumn()
{
    return("Token de fin d'instruction ';' manquant.");
}

export function missingId(fun)
{
    return("Il faut un identifiant pour votre "+fun+". ("+fun+" identifient)");
}

export function missingKeyWord(kw)
{
    return("Mot clé '"+kw+"' manquant.");
}

export function unexpectedToken(tk)
{
    return("Token '"+tk+"' inattendu.");
}

export function expectedToken(tk) 
{
    return("Token '"+tk+"' attendu.");
}

/*export function displayErrors(parseTime)
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
        
    }
    else 
    {
        $("#build .log").empty();
        $("#build .log").append("<div><span class='kw'>Votre programme a été complié avec succès.</span><br>"+
                                "Vous pouvez à présent l'exécuter.</div>");
        
    }
    $("#build .log").append("<div class='dec'><br><br>- Temps de compilation: "+parseTime+"ms</div>");
    $("#build").show();
}

/* Warning handler */

/*export function impliciteConversion(from, to)
{
    setWarning( "Attention ! utilisation de 2 types différents,"+ 
                "une convertion implicite a été efféctuée (" + from + " -> " + to + ").");
}*/