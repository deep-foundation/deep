import On from './on';
import _Benchmark from 'benchmark';

// хочу моментально узнавать цену любой функции
// просто передать ее в Benchmark и получить результат
// `${Benchmark(() => {})}` сразу выводит '<Test #2> x 35,207 ops/sec ±3.33% (89 runs sampled)'
// +Benchmark(() => {}) возвращает число в милисикундах
export const Benchmark = (code) => {
  const on = On();
  var suite = new (_Benchmark as any).Suite();
  suite.add('', code);
  let benchmark;
  const promise = new Promise((resolve) => {
    on(event => {
      benchmark.value = event;
      resolve(event);
    });
  })
  benchmark = () => promise;
  benchmark.promise(promise);
  benchmark.on = on;
  benchmark.off = on.off;
  benchmark.valueOf = () => benchmark?.value?.target?.hz;
  benchmark.toString = () => String(benchmark?.value?.target);
  suite.on('cycle', on.emit);
  // run async
  suite.run({ 'async': true });
  return benchmark;
};
