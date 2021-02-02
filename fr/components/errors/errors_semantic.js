export const wrongType = (type_expected, type_used) =>
{
    return("Utilisation d'un type '"+type_used+"', type '"+type_expected+"' attendu.");
}

export const undeclaredVar = (id) =>
{
    return("Utilisation d'une variable/constante non déclarée: "+id);
}

export const dimMismatch = () => 
{
    return("Dimentions incompatibles.");
}

export const undeclaredFun = (id) =>
{
    return("Appelle d'une fonction non déclarée: "+id);
}

export const constAffectation = (id) =>
{
    return("Opération interdite. Affectation d'une valeur à une constante: "+id);
}

export const divByZero = () =>
{
    return("Division par 0");
}

export const constRead = (id) =>
{
    return("Opération interdite. Lecture d'une valeur dans une constante '"+id+"'.");
}

export const conflictingTypes = (t1, t2) =>
{
    return("Opération entre 2 types incompatibles ("+t1+", "+t2+"). Conversion implicite impossible.");
}

export const capacityOverflow = () =>
{
    return("Dépacement de capacité.");
}

export const usedId = (id) => 
{
    return("Identifiant déjà utilisé: "+id);
}

export const tooMuchParams = () => 
{
    return("Des paramètres sont en trop lors de l'appelle.")
}

export const tooFewParams = () => 
{
    return("Des paramètres manquant lors de l'appelle.")
}

export const outPutOnConst = () => 
{
    return("Utilisation d'un paramètre 'Sortie' sur une constante est interdit.");
}

export const outPutOnExpression = (type) => 
{
    return ("Un paramètre '"+type+"' doit recevoir en argument une variable et non une expression.");
}

export const returnOnProcedure = () => 
{
    return("Une procédure ne peut pas retourner de valeur.");
}