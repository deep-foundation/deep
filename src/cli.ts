import { search } from '@inquirer/prompts';
import { Deep } from "./deep.js";
import { Repl } from "./repl.js";
import { LangChain } from "./langchain.js";

const deep = new Deep();
// const ask = await LangChain();
// export const repl = Repl({ deep, LangChain, ask });
export const repl = Repl({ deep });
