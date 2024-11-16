import _repl from "repl";

export const Repl = (context) => {
  const r = _repl.start({
    prompt: '> ',
    useGlobal: true,
  });
  r.context.__dirname = process.cwd();
  Object.assign(r.context, context);
};
