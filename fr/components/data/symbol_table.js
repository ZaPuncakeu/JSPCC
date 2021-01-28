let memory;
let stack;
let registers;

let function_table;

let current_instruction;
let next_instruction;

let current_input;

export const init = (main_index) => 
{
    memory = [];
    stack = [];

    registers = {};
    current_input = 0;

    function_table = {};
    current_instruction = main_index;
    next_instruction = main_index+1;
}

export const allocateMemory = (data) => 
{
    let index;

    if(data.dim.length > 0)
    {
        let total = 1;
        for(let i = 0; i < data.dim.length; i++)
        {
            if(data.dim[i].type != "int")
            {
                //WRONG TYPE 
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

                memory.push(
                {
                    type: data.type,
                    is_ptr: data.is_ptr,
                    data: null
                });

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
        //USED ID
        return;
    }

    stack[stack.length-1][data.id] = {
        type: data.type,
        is_ptr: data.is_ptr,
        dim: data.dim,
        adr: allocateMemory(data)
    }
}

export const mainStart = () => 
{
    stack.push(
    {
        id: "main",
        next_instruction: next_instruction,
    });
}

export const setNextInstruction = (instruction) => 
{
    stack[stack.length-1].next_instruction = instruction
}

export const insertFunction = (id, position) => 
{
    if(typeof(function_table[id]) != "undefined")
    {
        //ERROR: ID USED BY 
        return;
    }
    
    function_table[id] = {
        pos: position
    }
}

export const callFunction = (id) =>
{
    if(typeof(function_table[id]) == "undefined")
    {
        //UNDECLARED FUN
        return;
    }

    stack.push(
    {
        id: id,
        next_instruction: function_table[id].pos
    });
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
        registers[data.target] = memory[stack[stack.length-1][data.val].adr];
    }
    else 
    {
        //registers[data.target] = memory[(stack[stack.length-1][data.val].index)]
        let indexes = [];
        let dim = [];
        
        for(let i = 0; i < data.index.length; i++)
        {
            if(registers[data.index[i]].type != "int")
            {
                //TYPE CONFLICT
                return;
            }

            indexes.push(parseInt(registers[data.index[i]].data));
            dim.push(parseInt(stack[stack.length-1][data.val].dim[i].value));
        }

        let index = stack[stack.length-1][data.val].adr + getIndex(dim, indexes);
        registers[data.target] = memory[index];
    }
}

export const loadVal = (data) => 
{
    registers[data.target] = {
        type: data.type,
        data: data.val
    }
}

export const saveVal = (data) => 
{
    if(data.index.length == 0)
    {
        console.log(data);
        console.log(memory[stack[stack.length-1][data.target].adr]);
        if(memory[stack[stack.length-1][data.target].adr].type != registers[data.val].type)
        {
            //TYPE CONFLICT
            return;
        }

        memory[stack[stack.length-1][data.target].adr] = registers[data.val];
    }
    else 
    {
        //registers[data.target] = memory[(stack[stack.length-1][data.val].index)]
        let indexes = [];
        let dim = [];
        
        for(let i = 0; i < data.index.length; i++)
        {
            if(registers[data.index[i]].type != "int")
            {
                //TYPE CONFLICT
                return;
            }

            indexes.push(parseInt(registers[data.index[i]].data));
            dim.push(parseInt(stack[stack.length-1][data.target].dim[i].value));
        }

        let index = stack[stack.length-1][data.target].adr + getIndex(dim, indexes);
        memory[index] = registers[data.val];
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
                    //ID NOT EXISTANT
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
                                if(registers[data.index[i]].type != "int")
                                {
                                    //TYPE CONFLICT
                                    return;
                                }

                                indexes.push(parseInt(registers[data.index[i]].data));
                                dim.push(parseInt(stack[stack.length-1][data.id].dim[i].value));
                            }
                            let index = stack[stack.length-1][data.id].adr + getIndex(dim, indexes);
                            memory[index].data = val;      
                        }
                    }
                    else 
                    {
                        memory[stack[stack.length-1][data.id].adr].data = val;
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
    $("#exec .log").append(registers[data.val].data);
}

export const printLineJump = () => 
{
    $("#exec .log").append("<br>");
}

export const LOG = () => 
{
    console.log("Memory: ", memory);
    console.log("Stack: ", stack);
    console.log("Registers: ", registers);
    console.log("Functions table: ", function_table);
}

const checkSizes = (data) => 
{
    if(getFct()[data.id].dim.length != data.index.length)
    {
        //ERR DIM MISMATCH
        return false;
    }

    for(let i = 0; i < data.index.length; i++)
    {
        if(getFct()[data.id].dim[i] <= data.index[i])
        {
            //ERR DIM MISMATCH
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
    if(registers[data.val1].type != registers[data.val2].type)
    {
        //TYPE CONFLICT
        return;
    }

    switch(registers[data.val1].type)
    {
        case "int":
        {
            registers[data.target] = 
            {
                data: ""+parseInt(parseInt(registers[data.val1].data) + parseInt(registers[data.val2].data)),
                type: registers[data.val1].type
            };   
            break;
        }
        case "float":
        {
            registers[data.target] = 
            {
                data: ""+parseFloat(parseFloat(registers[data.val1].data) + parseFloat(registers[data.val2].data)),
                type: registers[data.val1].type
            };
            break;
        } 
    }
}

export const sub = (data) =>
{
    if(registers[data.val1].type != registers[data.val2].type)
    {
        //TYPE CONFLICT
        return;
    }

    switch(registers[data.val1].type)
    {
        case "int":
        {
            registers[data.target] = 
            {
                data: ""+parseInt(parseInt(registers[data.val1].data) - parseInt(registers[data.val2].data)),
                type: registers[data.val1].type
            };   
            break;
        }
        case "float":
        {
            registers[data.target] = 
            {
                data: ""+parseFloat(parseFloat(registers[data.val1].data) - parseFloat(registers[data.val2].data)),
                type: registers[data.val1].type
            };
            break;
        } 
    }
}

export const mul = (data) =>
{
    if(registers[data.val1].type != registers[data.val2].type)
    {
        //TYPE CONFLICT
        return;
    }

    switch(registers[data.val1].type)
    {
        case "int":
        {
            registers[data.target] = 
            {
                data: ""+parseInt(parseInt(registers[data.val1].data) * parseInt(registers[data.val2].data)),
                type: registers[data.val1].type
            };   
            break;
        }
        case "float":
        {
            registers[data.target] = 
            {
                data: ""+parseFloat(parseFloat(registers[data.val1].data) * parseFloat(registers[data.val2].data)),
                type: registers[data.val1].type
            };
            break;
        } 
    }
}

export const div = (data) =>
{
    if(registers[data.val1].type != registers[data.val2].type)
    {
        //TYPE CONFLICT
        return;
    }

    switch(registers[data.val1].type)
    {
        case "int":
        {
            if(parseInt(registers[data.val2].data) == 0)
            {
                //DIV BY 0
                return;
            }

            registers[data.target] = 
            {
                data: ""+parseInt((parseInt(registers[data.val1].data) / parseInt(registers[data.val2].data))),
                type: registers[data.val1].type
            };   
            break;
        }
        case "float":
        {
            if(parseFloat(registers[data.val2].data) == 0)
            {
                //DIV BY 0
                return;
            }

            registers[data.target] = 
            {
                data: ""+parseFloat((parseFloat(registers[data.val1].data) / parseFloat(registers[data.val2].data))),
                type: registers[data.val1].type
            };
            break;
        } 
    }
}

export const minus = (data) => 
{
    if(registers[data.val].type != "float" && registers[data.val].type != "int")
    {
        //TYPE CONFLICT
        return;
    }

    registers[data.target] = registers[data.val]
    registers[data.target].data = "-"+registers[data.val].data;
}

/* Boolean operation */
export const sup = (data) => 
{
    if((registers[data.val1].type == "int" || registers[data.val1].type == "float") && (registers[data.val2].type == "int" || registers[data.val2].type == "float"))
    {
        registers[data.target] = 
        {
            data: parseFloat(registers[data.val1].data) > parseFloat(registers[data.val2].data),
            type: "bool"
        }; 
    }
} 

export const supeq = (data) => 
{
    if((registers[data.val1].type == "int" || registers[data.val1].type == "float") && (registers[data.val2].type == "int" || registers[data.val2].type == "float"))
    {
        registers[data.target] = 
        {
            data: parseFloat(registers[data.val1].data) >= parseFloat(registers[data.val2].data),
            type: "bool"
        }; 
    }
} 

export const lt = (data) => 
{
    if((registers[data.val1].type == "int" || registers[data.val1].type == "float") && (registers[data.val2].type == "int" || registers[data.val2].type == "float"))
    {
        registers[data.target] = 
        {
            data: parseFloat(registers[data.val1].data) < parseFloat(registers[data.val2].data),
            type: "bool"
        }; 
    }
} 

export const leq = (data) => 
{
    if((registers[data.val1].type == "int" || registers[data.val1].type == "float") && (registers[data.val2].type == "int" || registers[data.val2].type == "float"))
    {
        registers[data.target] = 
        {
            data: parseFloat(registers[data.val1].data) <= parseFloat(registers[data.val2].data),
            type: "bool"
        }; 
    }
} 

export const eq = (data) => 
{
    if((registers[data.val1].type == "int" || registers[data.val1].type == "float") && (registers[data.val2].type == "int" || registers[data.val2].type == "float"))
    {
        registers[data.target] = 
        {
            data: parseFloat(registers[data.val1].data) == parseFloat(registers[data.val2].data),
            type: "bool"
        }; 
    }
} 

export const dif = (data) => 
{
    if((registers[data.val1].type == "int" || registers[data.val1].type == "float") && (registers[data.val2].type == "int" || registers[data.val2].type == "float"))
    {
        registers[data.target] = 
        {
            data: parseFloat(registers[data.val1].data) != parseFloat(registers[data.val2].data),
            type: "bool"
        }; 
    }
} 

/* CONDITIONS */

export const condition = (data) => 
{
    if(!registers[data.eval].data)
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
            if(parseInt(memory[stack[stack.length-1][data.startv].adr].data) > parseInt(registers[data.endv].data))
            {
                return "desc";
            }
            else if(parseInt(memory[stack[stack.length-1][data.startv].adr].data) < parseInt(registers[data.endv].data))
            {
                return "asc";
            }
            return null;
        }
        case "float":
        {
            if(parseFloat(memory[stack[stack.length-1][data.startv].adr].data) > parseFloat(registers[data.endv].data))
            {
                return "desc";
            }
            else if(parseFloat(memory[stack[stack.length-1][data.startv].adr].data) < parseFloat(registers[data.endv].data))
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
                    if(parseInt(memory[stack[stack.length-1][data.val].adr].data) <= parseInt(registers[data.endv].data))
                    {
                        break;
                    }
                    memory[stack[stack.length-1][data.val].adr].data = parseInt(memory[stack[stack.length-1][data.val].adr].data)-1;
                    setNextInstruction(data.start+1);
                }
                else if(data.steptype == "asc")
                {
                    if(parseInt(memory[stack[stack.length-1][data.val].adr].data) >= parseInt(registers[data.endv].data))
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
                    if(parseFloat(memory[stack[stack.length-1][data.val].adr].data) <= parseFloat(registers[data.endv].data))
                    {
                        break;
                    }
                    memory[stack[stack.length-1][data.val].adr].data = parseFloat(memory[stack[stack.length-1][data.val].adr].data)-1;
                    setNextInstruction(data.start+1);
                }
                else if(data.steptype == "asc")
                {
                    if(parseFloat(memory[stack[stack.length-1][data.val].adr].data) >= parseFloat(registers[data.endv].data))
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
    if(!registers[data.eval].data)
    {
        setNextInstruction(data.end);
        return;
    }
}

export const repeatloop = (data) => 
{
    if(!registers[data.eval].data)
    {
        setNextInstruction(data.start);
        return;
    }
}