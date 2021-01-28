export function wrongType(type_expected, type_used)
{
    setError("Utilisation d'un type '"+type_used+"', type '"+type_expected+"' attendu.");
}

export function undeclaredVar(id)
{
    setError("Utilisation d'une variable non déclarée '"+id+"'.");
}

export function constAffectation(id)
{
    setError("Opération interdite. Affectation d'une valeur à une constante '"+id+"'.");
}

export function constRead(id)
{
    setError("Opération interdite. Lecture d'une valeur dans une constante '"+id+"'.");
}

export function conflictingTypes(t1, t2)
{
    setError("Opération entre 2 types incompatibles ("+t1+", "+t2+"). Conversion implicite impossible.");
}

export function capacityOverflow()
{
    setError("Dépacement de capacité.");
}