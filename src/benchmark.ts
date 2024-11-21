import On from './on';
import _Benchmark from 'benchmark';
import { Deep } from './deep';

export default function benchmarks(deep: Deep) {
  // Create Benchmark and Benchmarked types
  const Benchmarked = deep.new();
  const Benchmark = deep.new(async (code: Function) => {
    const on = On();
    const suite = new (_Benchmark as any).Suite();
    suite.add('', code);

    // Create benchmarked instance before promise
    const benchmarked = Benchmarked.new();
    benchmarked.from = deep.wrap(code);  // Set the source function immediately

    const result = await new Promise((resolve) => {
      on(event => {
        const result = deep.wrap({
          target: event.target,
          hz: event.target.hz,
          stats: event.target.stats,
          times: event.target.times
        });
        
        // Fill benchmarked instance with results
        benchmarked.to = result;      // Full benchmark result
        benchmarked.value = event.target.hz; // Average execution speed

        resolve(benchmarked);
      });

      suite.on('cycle', on.emit);
      suite.run({ 'async': true });
    });

    return result;
  });

  return { Benchmark, Benchmarked };
}
