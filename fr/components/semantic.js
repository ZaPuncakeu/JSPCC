import * as SYM from './data/symbol_table.js'

let tree;
let main;

export default async (main_index, program_tree) => 
{
    tree = program_tree;
    main = main_index;
    SYM.init(main);
    
    $("#exec .log").empty();
    $("#exec").show();

    branchings();
    SYM.LOG();
    await exec().catch((err) => 
    {
        console.log("error at: "+SYM.getCurrentInstruction());
        console.log(err);
    });
    
    return 0;
}

const branchings = () => 
{
    for(let i = 0; i < tree.length; i++)
    {
        if(tree[i].instr == "dec_fct")
        {
            SYM.insertFunction(tree[i].id, i, tree[i]);
            continue;
        }
    }

    SYM.insertFunction("main", main);
    SYM.mainStart();
}

const exec = async () => 
{
    while(tree[SYM.getCurrentInstruction()].instr != "prg_end")
    {
        switch(tree[SYM.getCurrentInstruction()].instr)
        {
            case "dec_var":
            {
                SYM.insertVariable(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "dec_const":
            {
                SYM.insertVariable(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "load_id":
            {
                SYM.loadID(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "load_val":
            {
                SYM.loadVal(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "save":
            {
                SYM.saveVal(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "read_val":
            {
                await SYM.readVal(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "print_val":
            {
                SYM.printVal(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "print_str":
            {
                SYM.printStr(tree[SYM.getCurrentInstruction()]);
                break;
            } 
            case "print_line_jump":
            {
                SYM.printLineJump();
                break;
            }
            case "minus":
            {
                SYM.minus(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "+": 
            {
                SYM.add(tree[SYM.getCurrentInstruction()])
                break;
            }
            case "-": 
            {
                SYM.sub(tree[SYM.getCurrentInstruction()])
                break;
            }
            case "*": 
            {
                SYM.mul(tree[SYM.getCurrentInstruction()])
                break;
            }
            case "/": 
            {
                SYM.div(tree[SYM.getCurrentInstruction()])
                break;
            }
            case ">": 
            {
                SYM.sup(tree[SYM.getCurrentInstruction()])
                break;
            }
            case "<": 
            {
                SYM.lt(tree[SYM.getCurrentInstruction()])
                break;
            }
            case ">=": 
            {
                SYM.supeq(tree[SYM.getCurrentInstruction()])
                break;
            }
            case "<=": 
            {
                SYM.leq(tree[SYM.getCurrentInstruction()])
                break;
            }
            case "<>": 
            {
                SYM.dif(tree[SYM.getCurrentInstruction()])
                break;
            }
            case "=": 
            {
                SYM.eq(tree[SYM.getCurrentInstruction()])
                break;
            }
            case "if":
            {
                SYM.condition(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "jump":
            {
                SYM.setNextInstruction(tree[SYM.getCurrentInstruction()].to);
                break;
            }
            case "for":
            {
                const steptype = SYM.forloop(tree[SYM.getCurrentInstruction()]);
                const end = tree[SYM.getCurrentInstruction()].end;
                if(steptype != null)
                {
                    tree[tree[SYM.getCurrentInstruction()].step].steptype = steptype;
                }
                else 
                {
                    SYM.setNextInstruction(end);
                }

                break;
            }
            case "while_check":
            {
                SYM.whileloop(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "until":
            {
                SYM.repeatloop(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "step": 
            {
                SYM.step(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "fct_call":
            {
                SYM.callFunction(tree[SYM.getCurrentInstruction()], tree);
                break;
            }
            case "return":
            {
                SYM.returnFunction(tree[SYM.getCurrentInstruction()]);
                break;
            }
            case "end_fct":
            {
                SYM.endFunction();
                break;   
            }
        }
        
        SYM.getNextInstruction();
    }

    return 0;
}