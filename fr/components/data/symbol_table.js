import * as Errors from '../errors/errors_semantic.js';

let memory;
let stack;

let function_table;

let current_instruction;
let next_instruction;

let current_input;

let error_list;

export const init = (main_index) => 
{
    memory = [];
    stack = [];
    current_input = 0;

    function_table = {};
    current_instruction = main_index;
    next_instruction = main_index+1;
    
    error_list = [];
}

export const allocateMemory = (data) => 
{
    let index;

    if(data.instr != "dec_const" && data.dim.length > 0)
    {
        let total = 1;
        for(let i = 0; i < data.dim.length; i++)
        {
            if(data.dim[i].type != "int")
            {
                let used_type;
                switch(data.dim[i].type)
                {
                    case "float":
                    {
                        used_type = "réel";
                        break;
                    }
                    case "char":
                    {
                        used_type = "charactère";
                        break
                    }
                    case "bool":
                    {
                        used_type = "booléen";
                        break
                    }
                }
                setError(Errors.wrongType("entier",used_type), data.line, data.col)
                return;
            }
            total *= parseInt(data.dim[i].value);
        }

        for(let i = 0; i < total; i++)
        {
            memory.push(
            {
                type: data.type,
                is_ptr: data.is_ptr,
                data: null
            });

            if(i == 0)
            {
                index = memory.length - 1;
            }
        }
    }
    else 
    {
        let has_empty = false;
        for(let i = 0; i < memory.length; i++)
        {
            if(memory[i] == null)
            {
                has_empty = true;
                
                index = i;

                memory[i] = {
                    type: data.type,
                    is_ptr: data.is_ptr,
                    data: null
                };

                break;
            }
        }

        if(!has_empty)
        {
            memory.push(
            {
                type: data.type,
                is_ptr: data.is_ptr,
                data: null
            });

            index = memory.length - 1;
        }
    }

    return index;
}

export const insertVariable = (data) =>
{
    if(typeof(stack[stack.length-1][data.id]) != "undefined")
    {
        setError(Errors.usedId(data.id), data.line, data.col);
        return;
    }
    
    stack[stack.length-1][data.id] = {
        type: data.type,
        is_ptr: data.is_ptr,
        is_const: typeof(data.is_const) != "undefined",
        dim: data.dim,
        adr: allocateMemory(data),
        mode: (typeof(data.mode) != "undefined" ? data.mode : null)
    }

    if(typeof(data.is_const) != "undefined")
    {
        memory[stack[stack.length-1][data.id].adr] = data.val;
    }
}

export const mainStart = () => 
{
    stack.push(
    {
        id: "main",
        $registers: {},
        next_instruction: next_instruction,
    });
}

export const setNextInstruction = (instruction) => 
{
    stack[stack.length-1].next_instruction = instruction
}

export const insertFunction = (id, position, data) => 
{
    if(typeof(function_table[id]) != "undefined")
    {
        setError(Errors.usedId(id), data.line, data.col);
        return;
    }
    
    function_table[id] = {
        pos: position
    }
}

export const callFunction = (datas, tree) =>
{
    if(typeof(function_table[datas.val]) == "undefined")
    {
        setError(Errors.undeclaredFun(datas.val), datas.line, datas.col);
        return;
    }

    const pos = function_table[datas.val].pos;

    if(datas.params == null)
    {
        datas.params = [];
    }

    if(tree[pos].params == null)
    {
        tree[pos].params = [];
    }

    tree[pos].$return_val = datas.target;
    if(datas.params.length != tree[pos].params.length)
    {
        if(datas.params.length > tree[pos].params.length)
        {
            setError(Errors.tooMuchParams(), datas.line, datas.col);
        }
        else 
        {
            setError(Errors.tooFewParams(), datas.line, datas.col);
        }
        return;
    }
    
    stack.push(
    {
        $registers:{},
        id: datas.val,
        next_instruction: pos
    });

    console.log(tree[pos])
    getFct()["$type"] = tree[pos].type;
    getFct()["$return_val"] = datas.target;
    for(let i = 0; i < datas.params.length; i++)
    {
        switch(tree[pos].params[i].mode.toLowerCase())
        {
            case "e":{
                insertVariable(tree[pos].params[i])
                if(datas.params[i].val[0] != "$")
                {
                    if(tree[pos].params[i].type != stack[stack.length-2][datas.params[i].val].type)
                    {
                        if(typeConflict(tree[pos].params[i].type, stack[stack.length-2][datas.params[i].val].type,datas.params[i]))
                        {
                            return;
                        }
                    }

                    if(tree[pos].params[i].dim.length > 0)
                    {
                        if(datas.params[i].index.length > 0)
                        {
                            setError(Errors.dimMismatch(), datas.params[i].line, datas.params[i].col);
                            return;
                        }

                        if(tree[pos].params[i].dim.length != stack[stack.length-2][datas.params[i].val].dim.length)
                        {
                            setError(Errors.dimMismatch(), datas.params[i].line, datas.params[i].col)
                            return; 
                        }

                        for(let j = 0; j < tree[pos].params[i].dim.length; j++)
                        {
                            if(tree[pos].params[i].dim[j].value != stack[stack.length-2][datas.params[i].val].dim[j].value)
                            {
                                setError(Errors.dimMismatch(), datas.params[i].line, datas.params[i].col);
                                return false;
                            }
                        }

                        let total = 1;
                        for(let j = 0; j < tree[pos].params[i].dim.length; j++)
                        {
                            if(tree[pos].params[i].dim[j].type != "int")
                            {
                                let used_type;
                                switch(datas.params[i].dim[j].type)
                                {
                                    case "float":
                                    {
                                        used_type = "réel";
                                        break;
                                    }
                                    case "char":
                                    {
                                        used_type = "charactère";
                                        break
                                    }
                                    case "bool":
                                    {
                                        used_type = "booléen";
                                        break
                                    }
                                }
                                setError(Errors.wrongType("entier",used_type), datas.params[i].line, datas.params[i].col);
                                return;
                            }
                            total *= parseInt(tree[pos].params[i].dim[j].value);
                        }
                        
                        for(let j = 0; j < total; j++)
                        {
                            if(getFct()[tree[pos].params[i].id].type == "int" && stack[stack.length-2][datas.params[i].val].type == "float")
                            {
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr + j].data = parseInt(memory[stack[stack.length-2][datas.params[i].val].adr + j].data);
                            }
                            else 
                            {
                                //OTHERS
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr + j].data = memory[stack[stack.length-2][datas.params[i].val].adr + j].data;
                            }
                        }
                    }
                    else 
                    {
                        if(datas.params[i].index.length > 0)
                        {
                            let indexes = [];
                            let dim = [];
                            
                            for(let j = 0; j < datas.params[i].index.length; j++)
                            {
                                if(stack[stack.length-2]["$registers"][datas.params[i].index[j]].type != "int")
                                {
                                    let used_type;
                                    switch(stack[stack.length-2]["$registers"][datas.params[i].index[j]].type )
                                    {
                                        case "float":
                                        {
                                            used_type = "réel";
                                            break;
                                        }
                                        case "char":
                                        {
                                            used_type = "charactère";
                                            break
                                        }
                                        case "bool":
                                        {
                                            used_type = "booléen";
                                            break
                                        }
                                    }
                                    setError(Errors.wrongType("entier",used_type), datas.params[i].line, datas.params[i].col)
                                    return;
                                }

                                indexes.push(parseInt(stack[stack.length-2]["$registers"][datas.params[i].index[j]].data));
                                dim.push(parseInt(stack[stack.length-2][datas.params[i].val].dim[j].value));
                            }

                            let index = stack[stack.length-2][datas.params[i].val].adr + getIndex(dim, indexes);
                            if(getFct()[tree[pos].params[i].id].type == "int" && stack[stack.length-2][datas.params[i].val].type == "float")
                            {
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr].data = parseInt(memory[index].data);
                            }
                            else 
                            {
                                //OTHERS
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr].data = memory[index].data;
                            }
                        }
                        else 
                        {
                            if(getFct()[tree[pos].params[i].id].type == "int" && stack[stack.length-2][datas.params[i].val].type == "float")
                            {
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr].data = parseInt(memory[stack[stack.length-2][datas.params[i].val].adr].data);
                            }
                            else 
                            {
                                //OTHERS
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr].data = memory[stack[stack.length-2][datas.params[i].val].adr].data;
                            }
                        }
                    }
                }
                else 
                {
                    if(tree[pos].params[i].type != stack[stack.length-2]["$registers"][datas.params[i].val].type)
                    {
                        if(typeConflict(tree[pos].params[i].type, stack[stack.length-2]["$registers"][datas.params[i].val].type,datas.params[i]))
                        {
                            return;
                        }
                    }

                    if(tree[pos].params[i].dim > 0)
                    {
                        setError(Errors.dimMismatch(), datas.params[i].line, datas.params[i].col);
                        return;
                    }

                    if(getFct()[tree[pos].params[i].id].type != stack[stack.length-2]["$registers"][datas.params[i].val].type)
                    {
                        if(typeConflict(getFct()[tree[pos].params[i].id].type, stack[stack.length-2]["$registers"][datas.params[i].val].type, datas.params[i]))
                        {
                            return;
                        }
                    }

                    if(getFct()[tree[pos].params[i].id].type == "int" && stack[stack.length-2]["$registers"][datas.params[i].val].type == "float")
                    {
                        memory[stack[stack.length-1][tree[pos].params[i].id].adr].data = parseInt(stack[stack.length-2]["$registers"][datas.params[i].val].data);
                    }
                    else 
                    {
                        //OTHERS
                        memory[stack[stack.length-1][tree[pos].params[i].id].adr].data = parseInt(stack[stack.length-2]["$registers"][datas.params[i].val].data);
                    }
                }
                break;
            }
            case "s":{
                if(stack[stack.length-2][datas.params[i].val].is_const)
                {
                    setError(Errors.outPutOnConst(), datas.params[i].line, datas.params[i].col);
                    return
                }
                insertVariable(tree[pos].params[i]);
                if(tree[pos].params[i].type != stack[stack.length-2][datas.params[i].val].type)
                {
                    if(typeConflict(tree[pos].params[i].type, stack[stack.length-2][datas.params[i].val].type,datas.params[i]))
                    {
                        return;
                    }
                }

                if(datas.params[i].val[0] != "$")
                {
                    if(tree[pos].params[i].dim.length > 0)
                    {
                        if(datas.params[i].index.length > 0)
                        {
                            setError(Errors.dimMismatch(), datas.params[i].line, datas.params[i].col);
                            return;
                        }

                        if(tree[pos].params[i].dim.length != stack[stack.length-2][datas.params[i].val].dim.length)
                        {
                            setError(Errors.dimMismatch(), datas.params[i].line, datas.params[i].col);
                            return; 
                        }

                        stack[stack.length-1][tree[pos].params[i].id]["$adr_out"] = stack[stack.length-2][datas.params[i].val].adr;
                        for(let j = 0; j < tree[pos].params[i].dim.length; j++)
                        {
                            if(tree[pos].params[i].dim[j].value != stack[stack.length-2][datas.params[i].val].dim[j].value)
                            {
                                setError(Errors.dimMismatch(), datas.params[i].line, datas.params[i].col)
                                return false;
                            }
                        }
                    }
                    else 
                    {
                        if(datas.params[i].index.length > 0)
                        {
                            let indexes = [];
                            let dim = [];
                            
                            for(let j = 0; j < datas.params[i].index.length; j++)
                            {
                                if(stack[stack.length-2]["$registers"][datas.params[i].index[j]].type != "int")
                                {
                                    let used_type;
                                    switch(stack[stack.length-2]["$registers"][datas.params[i].index[j]].type )
                                    {
                                        case "float":
                                        {
                                            used_type = "réel";
                                            break;
                                        }
                                        case "char":
                                        {
                                            used_type = "charactère";
                                            break
                                        }
                                        case "bool":
                                        {
                                            used_type = "booléen";
                                            break
                                        }
                                    }
                                    setError(Errors.wrongType("entier",used_type), datas.params[i].line, datas.params[i].col)
                                    return;
                                }

                                indexes.push(parseInt(stack[stack.length-2]["$registers"][datas.params[i].index[j]].data));
                                dim.push(parseInt(stack[stack.length-2][datas.params[i].val].dim[j].value));
                            }

                            let index = stack[stack.length-2][datas.params[i].val].adr + getIndex(dim, indexes);
                            stack[stack.length-1][tree[pos].params[i].id]["$adr_out"] = index;
                        }
                        else 
                        {
                            stack[stack.length-1][tree[pos].params[i].id]["$adr_out"] = stack[stack.length-2][datas.params[i].val].adr;
                        }
                    }
                }
                else 
                {
                    setError(Errors.outPutOnExpression("Sortie"), datas.params[i].line, datas.params[i].col);
                    return;
                }
                break;
            }
            case "es":{
                insertVariable(tree[pos].params[i])
                if(tree[pos].params[i].type != stack[stack.length-2][datas.params[i].val].type)
                {
                    if(typeConflict(tree[pos].params[i].type, stack[stack.length-2][datas.params[i].val].type,datas.params[i]))
                    {
                        return;
                    }
                }

                if(datas.params[i].val[0] != "$")
                {
                    if(tree[pos].params[i].dim.length > 0)
                    {
                        if(datas.params[i].index.length > 0)
                        {
                            setError(Errors.dimMismatch(), datas.params[i].line, datas.params[i].col);
                            return;
                        }

                        if(tree[pos].params[i].dim.length != stack[stack.length-2][datas.params[i].val].dim.length)
                        {
                            setError(Errors.dimMismatch(), datas.params[i].line, datas.params[i].col)
                            return; 
                        }

                        for(let j = 0; j < tree[pos].params[i].dim.length; j++)
                        {
                            if(tree[pos].params[i].dim[j].value != stack[stack.length-2][datas.params[i].val].dim[j].value)
                            {
                                setError(Errors.dimMismatch(), datas.params[i].line, datas.params[i].col);
                                return false;
                            }
                        }

                        let total = 1;
                        for(let j = 0; j < tree[pos].params[i].dim.length; j++)
                        {
                            if(tree[pos].params[i].dim[j].type != "int")
                            {
                                let used_type;
                                switch(datas.params[i].dim[j].type)
                                {
                                    case "float":
                                    {
                                        used_type = "réel";
                                        break;
                                    }
                                    case "char":
                                    {
                                        used_type = "charactère";
                                        break
                                    }
                                    case "bool":
                                    {
                                        used_type = "booléen";
                                        break
                                    }
                                }
                                setError(Errors.wrongType("entier",used_type), datas.params[i].line, datas.params[i].col);
                                return;
                            }
                            total *= parseInt(tree[pos].params[i].dim[j].value);
                        }
                        
                        for(let j = 0; j < total; j++)
                        {
                            if(getFct()[tree[pos].params[i].id].type == "int" && stack[stack.length-2][datas.params[i].val].type == "float")
                            {
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr + j].data = parseInt(memory[stack[stack.length-2][datas.params[i].val].adr + j].data);
                            }
                            else 
                            {
                                //OTHERS
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr + j].data = memory[stack[stack.length-2][datas.params[i].val].adr + j].data;
                            }
                        }

                        stack[stack.length-1][tree[pos].params[i].id]["$adr_out"] = stack[stack.length-2][datas.params[i].val].adr;
                    }
                    else 
                    {
                        if(datas.params[i].index.length > 0)
                        {
                            let indexes = [];
                            let dim = [];
                            
                            for(let j = 0; j < datas.params[i].index.length; j++)
                            {
                                if(stack[stack.length-2]["$registers"][datas.params[i].index[j]].type != "int")
                                {
                                    let used_type;
                                    switch(stack[stack.length-2]["$registers"][datas.params[i].index[j]].type )
                                    {
                                        case "float":
                                        {
                                            used_type = "réel";
                                            break;
                                        }
                                        case "char":
                                        {
                                            used_type = "charactère";
                                            break
                                        }
                                        case "bool":
                                        {
                                            used_type = "booléen";
                                            break
                                        }
                                    }
                                    setError(Errors.wrongType("entier",used_type), datas.params[i].line, datas.params[i].col)
                                    return;
                                }

                                indexes.push(parseInt(stack[stack.length-2]["$registers"][datas.params[i].index[j]].data));
                                dim.push(parseInt(stack[stack.length-2][datas.params[i].val].dim[j].value));
                            }

                            let index = stack[stack.length-2][datas.params[i].val].adr + getIndex(dim, indexes);
                            if(getFct()[tree[pos].params[i].id].type == "int" && stack[stack.length-2][datas.params[i].val].type == "float")
                            {
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr].data = parseInt(memory[index].data);
                            }
                            else 
                            {
                                //OTHERS
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr].data = memory[index].data;
                            }
                            stack[stack.length-1][tree[pos].params[i].id]["$adr_out"] = index;
                        }
                        else 
                        {
                            
                            if(getFct()[tree[pos].params[i].id].type == "int" && stack[stack.length-2][datas.params[i].val].type == "float")
                            {
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr].data = parseInt(memory[stack[stack.length-2][datas.params[i].val].adr].data);
                            }
                            else 
                            {
                                //OTHERS
                                memory[stack[stack.length-1][tree[pos].params[i].id].adr].data = memory[stack[stack.length-2][datas.params[i].val].adr].data;
                            }
                            stack[stack.length-1][tree[pos].params[i].id]["$adr_out"] = stack[stack.length-2][datas.params[i].val].adr;
                        }
                    }
                }
                else 
                {
                    setError(Errors.outPutOnExpression("Entrée/Sortie"), datas.params[i].line, datas.params[i].col);
                    return;
                }

                break;
            }
            case "ref":{
                if(tree[pos].params[i].type != stack[stack.length-2][datas.params[i].val].type)
                {
                    if(typeConflict(tree[pos].params[i].type, stack[stack.length-2][datas.params[i].val].type,datas.params[i]))
                    {
                        return;
                    }
                }

                if(datas.params[i].val[0] != "$")
                {
                    if(datas.params[i].index.length > 0)
                    {
                        let indexes = [];
                        let dim = [];
                        
                        for(let j = 0; j < datas.params[i].index.length; j++)
                        {
                            if(stack[stack.length-2]["$registers"][datas.params[i].index[j]].type != "int")
                            {
                                let used_type;
                                switch(stack[stack.length-2]["$registers"][datas.params[i].index[j]].type )
                                {
                                    case "float":
                                    {
                                        used_type = "réel";
                                        break;
                                    }
                                    case "char":
                                    {
                                        used_type = "charactère";
                                        break
                                    }
                                    case "bool":
                                    {
                                        used_type = "booléen";
                                        break
                                    }
                                }
                                setError(Errors.wrongType("entier",used_type), datas.params[i].line, datas.params[i].col)
                                return;
                            }

                            indexes.push(parseInt(stack[stack.length-2]["$registers"][datas.params[i].index[j]].data));
                            dim.push(parseInt(stack[stack.length-2][datas.params[i].val].dim[j].value));
                        }

                        let index = stack[stack.length-2][datas.params[i].val].adr + getIndex(dim, indexes);
                        stack[stack.length-1][tree[pos].params[i].id] = {...stack[stack.length-2][datas.params[i].val]};
                        stack[stack.length-1][tree[pos].params[i].id].adr = index;
                        stack[stack.length-1][tree[pos].params[i].id].mode = "ref";
                    }
                    else 
                    {
                        stack[stack.length-1][tree[pos].params[i].id] = {...stack[stack.length-2][datas.params[i].val]};
                        stack[stack.length-1][tree[pos].params[i].id].mode = "ref";
                    }
                }
                else 
                {
                    setError(Errors.outPutOnExpression("Référence"), datas.params[i].line, datas.params[i].col);
                    return;
                }
                break;
            }
        }
    }
}

export const returnFunction = (data) => 
{
    if(typeof(getFct()["$type"]) == "undefined")
    {
        setError(Errors.returnOnProcedure(), data.line, data.col);
        return;
    }
    
    if(getFct()["$type"] != getFct()["$registers"][data.target].type)
    {
        typeConflict(getFct()["$type"], getFct()["$registers"][data.target.type, data]);
        return;
    }

    stack[stack.length-2]["$registers"][getFct().$return_val] = {...getFct()["$registers"][data.target]};

    if(getFct()["$type"] == "int")
    {
        stack[stack.length-2]["$registers"][getFct().$return_val].data = parseInt(stack[stack.length-2]["$registers"][getFct().$return_val].data);
    }
    endFunction();
}

export const endFunction = () => 
{
    for(const key in stack[stack.length-1])
    {
        if(key[0] != "$")
        {
            if(typeof(stack[stack.length-1][key].mode) != "undefined")
            {
                switch(getFct()[key].mode)
                {
                    case "e":
                    {
                        if(typeof(stack[stack.length-1][key].adr) != "undefined")
                        {
                            if(getFct()[key].dim.length > 0)
                            {
                                let total = 1;
                                for(let j = 0; j < getFct()[key].dim.length; j++)
                                {
                                    total *= parseInt(getFct()[key].dim[j].value);
                                }
                                
                                for(let j = 0; j < total; j++)
                                {
                                    memory[getFct()[key].adr + j] = null;
                                }
                            }
                            else 
                            {
                                memory[stack[stack.length-1][key].adr] = null;
                            }
                        }
                        break;
                    }
                    case "s":
                    {
                        if(typeof(stack[stack.length-1][key].adr) != "undefined")
                        {
                            if(getFct()[key].dim.length > 0)
                            {
                                let total = 1;
                                for(let j = 0; j < getFct()[key].dim.length; j++)
                                {
                                    total *= parseInt(getFct()[key].dim[j].value);
                                }
                                
                                for(let j = 0; j < total; j++)
                                {
                                    memory[getFct()[key].$adr_out + j] = memory[getFct()[key].adr + j];
                                    memory[getFct()[key].adr + j] = null;
                                }
                            }
                            else 
                            {
                                memory[getFct()[key].$adr_out] = memory[getFct()[key].adr];
                                memory[stack[stack.length-1][key].adr] = null;
                            }
                        }
                        break;
                    }
                    case "es":
                    {
                        if(typeof(stack[stack.length-1][key].adr) != "undefined")
                        {
                            if(getFct()[key].dim.length > 0)
                            {
                                let total = 1;
                                for(let j = 0; j < getFct()[key].dim.length; j++)
                                {
                                    total *= parseInt(getFct()[key].dim[j].value);
                                }
                                
                                for(let j = 0; j < total; j++)
                                {
                                    memory[getFct()[key].$adr_out + j] = memory[getFct()[key].adr + j];
                                    memory[getFct()[key].adr + j] = null;
                                }
                            }
                            else 
                            {
                                memory[getFct()[key].$adr_out] = memory[getFct()[key].adr];
                                memory[stack[stack.length-1][key].adr] = null;
                            }
                        }
                        break;
                    } 
                }
            }
            else 
            {
                if(typeof(stack[stack.length-1][key].adr) != "undefined")
                {
                    if(getFct()[key].dim.length > 0)
                    {
                        let total = 1;
                        for(let j = 0; j < getFct()[key].dim.length; j++)
                        {
                            total *= parseInt(getFct()[key].dim[j].value);
                        }
                        
                        for(let j = 0; j < total; j++)
                        {
                            memory[getFct()[key].adr + j] = null;
                        }
                    }
                    else 
                    {
                        memory[stack[stack.length-1][key].adr] = null;
                    }
                }
            }
        }
    }

    stack.pop();
}

export const decFunction = (data) => 
{
    stack[stack.length - 1]["type"] = data.type;
}

export const getCurrentInstruction = () => 
{
    return current_instruction;
}

export const getNextInstruction = () => 
{
    current_instruction = stack[stack.length-1].next_instruction;
    stack[stack.length-1].next_instruction++;
}

export const loadID = (data) => 
{
    if(data.index.length == 0)
    {
        getFct()["$registers"][data.target] = memory[stack[stack.length-1][data.val].adr];
    }
    else 
    {
        let indexes = [];
        let dim = [];
        
        for(let i = 0; i < data.index.length; i++)
        {
            if(getFct()["$registers"][data.index[i]].type != "int")
            {
                wrongIndexType(getFct()["$registers"][data.index[i]].type, data);
                return;
            }

            indexes.push(parseInt(getFct()["$registers"][data.index[i]].data));
            dim.push(parseInt(stack[stack.length-1][data.val].dim[i].value));
        }

        let index = stack[stack.length-1][data.val].adr + getIndex(dim, indexes);
        getFct()["$registers"][data.target] = memory[index];
    }
}

export const loadVal = (data) => 
{
    getFct()["$registers"][data.target] = {
        type: data.type,
        data: data.val
    }
}

export const saveVal = (data) => 
{
    if(getFct()[data.target].is_const)
    {
        setError(Errors.constAffectation(data.target), data.line, data.col);
        return;
    }

    if(memory[stack[stack.length-1][data.target].adr].type != getFct()["$registers"][data.val].type)
    {
        if(typeConflict(memory[stack[stack.length-1][data.target].adr].type, getFct()["$registers"][data.val].type, data))
        {
            return;
        }
    }

    if(data.index.length == 0)
    {
        if(memory[stack[stack.length-1][data.target].adr].type == "int" && getFct()["$registers"][data.val].type == "float")
        {
            memory[stack[stack.length-1][data.target].adr] = {...getFct()["$registers"][data.val]};
            memory[stack[stack.length-1][data.target].adr].data = parseInt(getFct()["$registers"][data.val].data);
        }
        else 
        {
            memory[stack[stack.length-1][data.target].adr] = {...getFct()["$registers"][data.val]};
        }
    }
    else 
    {
        let indexes = [];
        let dim = [];
        
        for(let i = 0; i < data.index.length; i++)
        {
            if(getFct()["$registers"][data.index[i]].type != "int")
            {
                wrongIndexType(getFct()["$registers"][data.index[i]].type, data);
                return;
            }

            indexes.push(parseInt(getFct()["$registers"][data.index[i]].data));
            dim.push(parseInt(stack[stack.length-1][data.target].dim[i].value));
        }

        let index = stack[stack.length-1][data.target].adr + getIndex(dim, indexes);
        memory[index] = {...getFct()["$registers"][data.val]};

        if(memory[index].type == "int" && getFct()["$registers"][data.val].type == "float")
        {
            memory[index] = {...getFct()["$registers"][data.val]};
            memory[index].data = parseInt(getFct()["$registers"][data.val].data);
        }
        else 
        {
            memory[index] = {...getFct()["$registers"][data.val]};
        }
    }
}

export const readVal = async (data) => 
{
    return new Promise((resolve, reject) => 
    {
        $("#exec .log").append("<input type='text' class='input' id='"+current_input+"'><br>");
        $("#"+current_input).focus();
        $('.input').keydown(function(e) 
        {  
            if (e.keyCode == 13) 
            {
                if($(this).prop("disabled"))
                {
                    resolve(0);
                }

                const val = $(this).val();
                $(this).prop("disabled", true);
                current_input++;
                
                if(typeof(stack[stack.length-1][data.id]) == "undefined")
                {
                    setError(Errors.undeclaredVar(data.id),data.line, data.col);
                    resolve("error");
                }

                if(getFct()[data.id].is_const)
                {
                    setError(Errors.constAffectation(data.id), data.line, data.col);
                    resolve("error");
                }

                if(stack[stack.length-1][data.id].type == getType(val))
                {
                    if(data.index.length > 0)
                    {
                        if(checkSizes(data))
                        {
                            let indexes = [];
                            let dim = [];
                            
                            for(let i = 0; i < data.index.length; i++)
                            {
                                if(getFct()["$registers"][data.index[i]].type != "int")
                                {
                                    wrongIndexType(getFct()["$registers"][data.index[i]].type, data);
                                    resolve("error");
                                }

                                indexes.push(parseInt(getFct()["$registers"][data.index[i]].data));
                                dim.push(parseInt(stack[stack.length-1][data.id].dim[i].value));
                            }

                            let index = stack[stack.length-1][data.id].adr + getIndex(dim, indexes);
                            if(memory[index].type != getType(val))
                            {
                                if(typeConflict(memory[index].type, getType(val), data))
                                {
                                    resolve("error");
                                }
                            }

                            if(memory[index].type == "int" && getType(val))
                            {
                                memory[index].data = parseInt(val);  
                            }
                            else if(memory[index].type == "float" && getType(val)){
                                memory[index].data = parseFloat(val);  
                            }
                            else 
                            {
                                //OTHERS
                                memory[index].data = val;  
                            }
                        }
                    }
                    else 
                    {
                        if(memory[stack[stack.length-1][data.id].adr].type == "int" && getType(val))
                        {
                            memory[stack[stack.length-1][data.id].adr].data = parseInt(val);  
                        }    
                        else if(memory[stack[stack.length-1][data.id].adr].type == "float" && getType(val))
                        {
                            memory[stack[stack.length-1][data.id].adr].data = parseFloat(val);  
                        } 
                        else 
                        {
                            //OTHERS
                            memory[stack[stack.length-1][data.id].adr].data = val;  
                        }
                    }
                }
                resolve("done");
            }
        });
    });
}

export const printStr = (data) => 
{
    $("#exec .log").append(data.str);
}

export const printVal = (data) => 
{
    $("#exec .log").append(getFct()["$registers"][data.val].data);
}

export const printLineJump = () => 
{
    $("#exec .log").append("<br>");
}

export const LOG = () => 
{
    console.log("Memory: ", memory);
    console.log("Stack: ", stack);
    console.log("Functions table: ", function_table);
}

const checkSizes = (data) => 
{
    if(getFct()[data.id].dim.length != data.index.length)
    {
        setError(Errors.dimMismatch(), data.line, data.col);
        return false;
    }

    for(let i = 0; i < data.index.length; i++)
    {
        if(getFct()[data.id].dim[i] <= data.index[i])
        {
            setError(Errors.dimMismatch(), data.line, data.col);
            return false;
        }
    }

    return true;
}

const getType = (data) => 
{
    if(/^[0-9]+$/.test(data))
    {
        return "int"
    }

    if(/^[0-9]+\.[0-9]*$/.test(data))
    {
        return "float";
    }

    return "string";
}

const getFct = () =>
{
    return stack[stack.length-1];
}

const getIndex = (dim, indexes) => 
{
    if(dim.length > 1)
    {

        let index = dim[dim.length-1] * indexes[dim.length-2] + indexes[dim.length-1];
        
        if(dim.length > 2)
        {
            let cmp = 1;
            for(let i = 0; i < dim.length-2; i++)
            {
                for(let j = i+1; j < dim.length; j++)
                {
                    cmp *= dim[j];      
                }

                cmp *= indexes[i];
                index += cmp;
            }
        }

        return index;
    }

    return indexes[0];
}

/* Operations */

export const add = (data) =>
{
    if(getFct()["$registers"][data.val1].type != getFct()["$registers"][data.val2].type)
    {
        if(typeConflict(getFct()["$registers"][data.val1].type, getFct()["$registers"][data.val2].type, data))
        {
            return;
        }
    }

    switch(getFct()["$registers"][data.val1].type)
    {
        case "int":
        {
            getFct()["$registers"][data.target] = 
            {
                data: ""+parseInt(parseInt(getFct()["$registers"][data.val1].data) + parseInt(getFct()["$registers"][data.val2].data)),
                type: getFct()["$registers"][data.val1].type
            };   
            break;
        }
        case "float":
        {
            getFct()["$registers"][data.target] = 
            {
                data: ""+parseFloat(parseFloat(getFct()["$registers"][data.val1].data) + parseFloat(getFct()["$registers"][data.val2].data)),
                type: getFct()["$registers"][data.val1].type
            };
            break;
        } 
    }
}

export const sub = (data) =>
{
    if(getFct()["$registers"][data.val1].type != getFct()["$registers"][data.val2].type)
    {
        if(typeConflict(getFct()["$registers"][data.val1].type, getFct()["$registers"][data.val2].type, data))
        {
            return;
        }
    }

    switch(getFct()["$registers"][data.val1].type)
    {
        case "int":
        {
            getFct()["$registers"][data.target] = 
            {
                data: ""+parseInt(parseInt(getFct()["$registers"][data.val1].data) - parseInt(getFct()["$registers"][data.val2].data)),
                type: getFct()["$registers"][data.val1].type
            };   
            break;
        }
        case "float":
        {
            getFct()["$registers"][data.target] = 
            {
                data: ""+parseFloat(parseFloat(getFct()["$registers"][data.val1].data) - parseFloat(getFct()["$registers"][data.val2].data)),
                type: getFct()["$registers"][data.val1].type
            };
            break;
        } 
    }
}

export const mul = (data) =>
{
    if(getFct()["$registers"][data.val1].type != getFct()["$registers"][data.val2].type)
    {
        if(typeConflict(getFct()["$registers"][data.val1].type, getFct()["$registers"][data.val2].type, data))
        {
            return;
        }
    }

    switch(getFct()["$registers"][data.val1].type)
    {
        case "int":
        {
            getFct()["$registers"][data.target] = 
            {
                data: ""+parseInt(parseInt(getFct()["$registers"][data.val1].data) * parseInt(getFct()["$registers"][data.val2].data)),
                type: getFct()["$registers"][data.val1].type
            };   
            break;
        }
        case "float":
        {
            getFct()["$registers"][data.target] = 
            {
                data: ""+parseFloat(parseFloat(getFct()["$registers"][data.val1].data) * parseFloat(getFct()["$registers"][data.val2].data)),
                type: getFct()["$registers"][data.val1].type
            };
            break;
        } 
    }
}

export const div = (data) =>
{
    if(getFct()["$registers"][data.val1].type != getFct()["$registers"][data.val2].type)
    {
        if(typeConflict(getFct()["$registers"][data.val1].type, getFct()["$registers"][data.val2].type, data))
        {
            return;
        }
    }

    switch(getFct()["$registers"][data.val1].type)
    {
        case "int":
        {
            if(parseInt(getFct()["$registers"][data.val2].data) == 0)
            {
                setError(Errors.divByZero(), data.line, data.col);
                return;
            }

            getFct()["$registers"][data.target] = 
            {
                data: ""+parseInt((parseInt(getFct()["$registers"][data.val1].data) / parseInt(getFct()["$registers"][data.val2].data))),
                type: getFct()["$registers"][data.val1].type
            };   
            break;
        }
        case "float":
        {
            if(parseFloat(getFct()["$registers"][data.val2].data) == 0)
            {
                setError(Errors.divByZero(), data.line, data.col);
                return;
            }

            getFct()["$registers"][data.target] = 
            {
                data: ""+parseFloat((parseFloat(getFct()["$registers"][data.val1].data) / parseFloat(getFct()["$registers"][data.val2].data))),
                type: getFct()["$registers"][data.val1].type
            };
            break;
        } 
    }
}

export const minus = (data) => 
{
    getFct()["$registers"][data.target] = getFct()["$registers"][data.val]
    getFct()["$registers"][data.target].data = "-"+getFct()["$registers"][data.val].data;
}

/* Boolean operation */

export const sup = (data) => 
{
    if((getFct()["$registers"][data.val1].type == "int" || getFct()["$registers"][data.val1].type == "float") && (getFct()["$registers"][data.val2].type == "int" || getFct()["$registers"][data.val2].type == "float"))
    {
        getFct()["$registers"][data.target] = 
        {
            data: parseFloat(getFct()["$registers"][data.val1].data) > parseFloat(getFct()["$registers"][data.val2].data),
            type: "bool"
        }; 
    }
} 

export const supeq = (data) => 
{
    if((getFct()["$registers"][data.val1].type == "int" || getFct()["$registers"][data.val1].type == "float") && (getFct()["$registers"][data.val2].type == "int" || getFct()["$registers"][data.val2].type == "float"))
    {
        getFct()["$registers"][data.target] = 
        {
            data: parseFloat(getFct()["$registers"][data.val1].data) >= parseFloat(getFct()["$registers"][data.val2].data),
            type: "bool"
        }; 
    }
} 

export const lt = (data) => 
{
    if((getFct()["$registers"][data.val1].type == "int" || getFct()["$registers"][data.val1].type == "float") && (getFct()["$registers"][data.val2].type == "int" || getFct()["$registers"][data.val2].type == "float"))
    {
        getFct()["$registers"][data.target] = 
        {
            data: parseFloat(getFct()["$registers"][data.val1].data) < parseFloat(getFct()["$registers"][data.val2].data),
            type: "bool"
        }; 
    }
} 

export const leq = (data) => 
{
    if((getFct()["$registers"][data.val1].type == "int" || getFct()["$registers"][data.val1].type == "float") && (getFct()["$registers"][data.val2].type == "int" || getFct()["$registers"][data.val2].type == "float"))
    {
        getFct()["$registers"][data.target] = 
        {
            data: parseFloat(getFct()["$registers"][data.val1].data) <= parseFloat(getFct()["$registers"][data.val2].data),
            type: "bool"
        }; 
    }
} 

export const eq = (data) => 
{
    if((getFct()["$registers"][data.val1].type == "int" || getFct()["$registers"][data.val1].type == "float") && (getFct()["$registers"][data.val2].type == "int" || getFct()["$registers"][data.val2].type == "float"))
    {
        getFct()["$registers"][data.target] = 
        {
            data: parseFloat(getFct()["$registers"][data.val1].data) == parseFloat(getFct()["$registers"][data.val2].data),
            type: "bool"
        };
    }
} 

export const dif = (data) => 
{
    if((getFct()["$registers"][data.val1].type == "int" || getFct()["$registers"][data.val1].type == "float") && (getFct()["$registers"][data.val2].type == "int" || getFct()["$registers"][data.val2].type == "float"))
    {
        getFct()["$registers"][data.target] = 
        {
            data: parseFloat(getFct()["$registers"][data.val1].data) != parseFloat(getFct()["$registers"][data.val2].data),
            type: "bool"
        }; 
    }
} 

/* CONDITIONS */


export const condition = (data) => 
{
    if(!getFct()["$registers"][data.eval].data)
    {
        if(data.alt != null)
        {
            setNextInstruction(data.alt);
        }
        else 
        {
            setNextInstruction(data.end);
        }
    }
}

/* LOOPS */

export const forloop = (data) => 
{
    switch(memory[stack[stack.length-1][data.startv].adr].type)
    {
        case "int":
        {
            if(parseInt(memory[stack[stack.length-1][data.startv].adr].data) > parseInt(getFct()["$registers"][data.endv].data))
            {
                return "desc";
            }
            else if(parseInt(memory[stack[stack.length-1][data.startv].adr].data) < parseInt(getFct()["$registers"][data.endv].data))
            {
                return "asc";
            }
            return null;
        }
        case "float":
        {
            if(parseFloat(memory[stack[stack.length-1][data.startv].adr].data) > parseFloat(getFct()["$registers"][data.endv].data))
            {
                return "desc";
            }
            else if(parseFloat(memory[stack[stack.length-1][data.startv].adr].data) < parseFloat(getFct()["$registers"][data.endv].data))
            {
                return "asc";
            }
            return null;
        }
        default: 
        {
            return null;
        }
    }
}

export const step = (data) => 
{
    if(data.index.length == 0)
    {
        switch(memory[stack[stack.length-1][data.val].adr].type)
        {
            case "int":
            {
                if(data.steptype == "desc")
                {
                    if(parseInt(memory[stack[stack.length-1][data.val].adr].data) <= parseInt(getFct()["$registers"][data.endv].data))
                    {
                        break;
                    }
                    memory[stack[stack.length-1][data.val].adr].data = parseInt(memory[stack[stack.length-1][data.val].adr].data)-1;
                    setNextInstruction(data.start+1);
                }
                else if(data.steptype == "asc")
                {
                    if(parseInt(memory[stack[stack.length-1][data.val].adr].data) >= parseInt(getFct()["$registers"][data.endv].data))
                    {
                        break;
                    }
                    memory[stack[stack.length-1][data.val].adr].data = parseInt(memory[stack[stack.length-1][data.val].adr].data)+1;
                    setNextInstruction(data.start+1);
                }
                break;
            }
            case "float":
            {
                if(data.steptype == "desc")
                {
                    if(parseFloat(memory[stack[stack.length-1][data.val].adr].data) <= parseFloat(getFct()["$registers"][data.endv].data))
                    {
                        break;
                    }
                    memory[stack[stack.length-1][data.val].adr].data = parseFloat(memory[stack[stack.length-1][data.val].adr].data)-1;
                    setNextInstruction(data.start+1);
                }
                else if(data.steptype == "asc")
                {
                    if(parseFloat(memory[stack[stack.length-1][data.val].adr].data) >= parseFloat(getFct()["$registers"][data.endv].data))
                    {
                        break;
                    }
                    memory[stack[stack.length-1][data.val].adr].data = parseFloat(memory[stack[stack.length-1][data.val].adr].data)+1;
                    setNextInstruction(data.start+1);
                }
                break;
            }
        }
    }
}

export const whileloop = (data) => 
{
    if(!getFct()["$registers"][data.eval].data)
    {
        setNextInstruction(data.end);
        return;
    }
}

export const repeatloop = (data) => 
{
    if(!getFct()["$registers"][data.eval].data)
    {
        setNextInstruction(data.start);
        return;
    }
}

/* Errors */


const setError = (message, line, col) =>
{
    error_list.push({
        line: line,
        col: col,
        message: message
    });

    $("#exec .log").empty();
    $("#exec").hide();
    $("#build .log").empty();
    for(let i = 0; i < error_list.length; i++)
    {
        $("#build .log").append("<div><span class='error'>ERREUR! ligne "+error_list[i].line+""+
                            ", colonne "+ error_list[i].col + "</span>: "+ 
                            error_list[i].message);
    }
    
    $("#build").show();
}

const typeConflict = (t1,t2, data) => 
{
    if(t1 == "char")
    {
        if(t2 == "float")
        {
            setError(Errors.conflictingTypes("charactère", "réel"), data.line, data.col);
            return true;
        }
        else if(t2 == "bool")
        {
            setError(Errors.conflictingTypes("charactère", "booléen"), data.line, data.col);
            return true;
        }
    }
    else if(t1 == "float")
    {
        if(t2 == "char")
        {
            setError(Errors.conflictingTypes("réel", "charactère"), data.line, data.col);
            return true;
        }
        else if(t2 == "bool")
        {
            setError(Errors.conflictingTypes("réel", "booléen"), data.line, data.col);
            return true;
        }
    }
    else if(t1 == "bool")
    {
        if(t2 == "char")
        {
            setError(Errors.conflictingTypes("booléen", "charactère"), data.line, data.col);
            return true;
        }
        else if(t2 == "float")
        {
            setError(Errors.conflictingTypes("booléen", "réel"), data.line, data.col);
            return true;
        }
    }

    return false;
}

const wrongIndexType = (t,data) =>
{
    let used_type;
    switch(t)
    {
        case "float":
        {
            used_type = "réel";
            break;
        }
        case "char":
        {
            used_type = "charactère";
            break
        }
        case "bool":
        {
            used_type = "booléen";
            break
        }
    }
    setError(Errors.wrongType("entier",used_type), data.line, data.col)
}
