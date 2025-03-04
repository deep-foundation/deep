import { Deep } from "./deep.js";
import test from 'node:test';
import assert from 'node:assert';

Deep.DEBUG = true;

test('typeof и typeofs', () => {
  const deep = Deep.new();
  // Определим типы
  const TypeA = new deep();
  const TypeB = new deep();
  const TypeC = new deep();

  // Установим иерархию типов напрямую через Deep.type
  Deep.type.set(TypeB.this, TypeA.this);
  Deep.type.set(TypeC.this, TypeB.this);
  
  // Создадим экземпляры
  const a1 = new TypeA();
  const b1 = new TypeB();
  const c1 = new TypeC();
  
  // Проверка typeof
  assert(a1.typeof(TypeA), 'a1 должен быть типа TypeA');
  assert(!a1.typeof(TypeB), 'a1 не должен быть типа TypeB');
  assert(b1.typeof(TypeA), 'b1 должен быть типа TypeA (базовый тип)');
  assert(b1.typeof(TypeB), 'b1 должен быть типа TypeB');
  assert(c1.typeof(TypeA), 'c1 должен быть типа TypeA (базовый тип)');
  assert(c1.typeof(TypeB), 'c1 должен быть типа TypeB (родительский тип)');
  assert(c1.typeof(TypeC), 'c1 должен быть типа TypeC');
  
  // Проверка typeofs
  console.log('=== Testing typeofs ===');
  const aTypes = a1.typeofs();
  console.log('aTypes.length:', aTypes.length);
  console.log('aTypes содержимое детально:');
  aTypes.forEach((t, i) => {
    console.log(`  [${i}] type:`, t);
    console.log(`  [${i}] this:`, t.this);
    console.log(`  [${i}] сравнение с TypeA:`, t === TypeA);
    console.log(`  [${i}] сравнение this:`, t.this === TypeA.this);
  });
  
  assert.equal(aTypes.length, 1, 'a1 должен иметь 1 тип');
  assert(aTypes[0].this === TypeA.this, 'Первый тип a1 должен быть TypeA (сравнение по this)');
  
  const bTypes = b1.typeofs();
  console.log('bTypes.length:', bTypes.length);
  console.log('bTypes содержимое:', bTypes.map(t => t.this));
  assert.equal(bTypes.length, 2, 'b1 должен иметь 2 типа');
  assert(bTypes[0].this === TypeB.this, 'Первый тип b1 должен быть TypeB (сравнение по this)');
  assert(bTypes[1].this === TypeA.this, 'Второй тип b1 должен быть TypeA (сравнение по this)');
  
  const cTypes = c1.typeofs();
  console.log('cTypes.length:', cTypes.length);
  console.log('cTypes содержимое:', cTypes.map(t => t.this));
  assert.equal(cTypes.length, 3, 'c1 должен иметь 3 типа');
  assert(cTypes[0].this === TypeC.this, 'Первый тип c1 должен быть TypeC (сравнение по this)');
  assert(cTypes[1].this === TypeB.this, 'Второй тип c1 должен быть TypeB (сравнение по this)');
  assert(cTypes[2].this === TypeA.this, 'Третий тип c1 должен быть TypeA (сравнение по this)');
});

test('isDeep и isValue', () => {
  const deep = Deep.new();
  const a1 = new deep();
  
  // Проверка isDeep
  assert(Deep.isDeep(a1), 'a1 должен определяться как Deep');
  assert(!Deep.isDeep("строка"), 'Строка не должна определяться как Deep');
  assert(!Deep.isDeep(123), 'Число не должно определяться как Deep');
  assert(!Deep.isDeep(null), 'null не должен определяться как Deep');
  assert(!Deep.isDeep(undefined), 'undefined не должен определяться как Deep');
  
  // Проверка isValue
  assert(Deep.isValue("строка"), 'Строка должна определяться как Value');
  assert(Deep.isValue(123), 'Число должно определяться как Value');
  assert(Deep.isValue(true), 'Булево значение должно определяться как Value');
  assert(!Deep.isValue(a1), 'Deep-объект не должен определяться как Value');
  assert(!Deep.isValue(undefined), 'undefined не должен определяться как Value');
  assert(!Deep.isValue(null), 'null не должен определяться как Value');
}); 