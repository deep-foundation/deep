/**
 * Тест на лимиты производительности для relations.js
 * Измеряет максимальное количество связей в памяти Node.js процесса
 * при использовании отношения a.type = <Association>
 */
import deep from './index.js';
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import Benchmarkify from 'benchmarkify';
import { performance } from 'node:perf_hooks';

// Вспомогательная функция для форматирования числа с разделителями
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Вспомогательная функция для форматирования размера памяти
function formatMemory(bytes) {
  if (bytes < 1024) return `${bytes} байт`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} КБ`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} МБ`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} ГБ`;
}

// Создаем бенчмарк с Benchmarkify для совместимости с другими бенчмарками
const benchmark = new Benchmarkify('RELATIONS Limits', {
  description: 'Тест на пределы количества связей в Node.js процессе при использовании отношения a.type = <Association>'
}).printHeader();

// Класс для измерения использования памяти
class MemoryMonitor {
  constructor() {
    this.startMemory = process.memoryUsage();
    this.lastMemory = this.startMemory;
    this.maxMemory = this.startMemory;
    this.lastReport = Date.now();
    this.reportInterval = 5000; // 5 секунд
  }

  update() {
    const currentMemory = process.memoryUsage();
    this.lastMemory = currentMemory;

    if (currentMemory.heapUsed > this.maxMemory.heapUsed) {
      this.maxMemory = currentMemory;
    }

    // Отчёт по таймеру
    const now = Date.now();
    if (now - this.lastReport >= this.reportInterval) {
      this.report();
      this.lastReport = now;
      return true;
    }
    return false;
  }

  report() {
    const diff = {
      rss: this.lastMemory.rss - this.startMemory.rss,
      heapTotal: this.lastMemory.heapTotal - this.startMemory.heapTotal,
      heapUsed: this.lastMemory.heapUsed - this.startMemory.heapUsed,
      external: this.lastMemory.external - this.startMemory.external
    };

    console.log(`Использование памяти:
    Текущее использование кучи: ${formatMemory(this.lastMemory.heapUsed)}
    Максимальное использование кучи: ${formatMemory(this.maxMemory.heapUsed)}
    Увеличение с начала: ${formatMemory(diff.heapUsed)}
    Всего занято в памяти: ${formatMemory(this.lastMemory.rss)}
    `);
  }

  get heapUsed() {
    return this.lastMemory.heapUsed;
  }
}

// Функция для выполнения теста лимитов
async function runLimitsTest() {
  console.log('🚀 Запуск теста на пределы количества связей');
  console.log('📊 Конфигурация Node.js:');
  console.log('  - Версия Node.js:', process.version);
  console.log('  - Платформа:', process.platform, process.arch);
  console.log('  - Макс. размер кучи:', process.env.NODE_OPTIONS || 'Не задан (по умолчанию)');
  console.log('  - Число доступных процессоров:', os.cpus().length);
  console.log('  - Всего системной памяти:', formatMemory(os.totalmem()));
  console.log('  - Свободная системная память:', formatMemory(os.freemem()));

  // Создаем монитор памяти
  const monitor = new MemoryMonitor();

  // Результаты для формирования отчета
  const results = {
    name: 'RELATIONS Limits',
    description: 'Тест на пределы количества связей в Node.js процессе при использовании отношения a.type = <Association>',
    timestamp: Date.now(),
    environment: {
      platform: `${process.platform} ${process.arch}`,
      nodejs: process.version,
      v8: process.versions.v8,
      cpu: os.cpus()[0].model,
      memory: formatMemory(os.totalmem())
    },
    suites: []
  };

  // Создаем сьют с результатами теста лимитов
  const limitsSuite = {
    name: 'Тест на пределы количества связей',
    tests: []
  };

  // Начальные параметры
  const BATCH_SIZE = 10000; // Размер пакета для создания связей
  const MAX_ASSOCIATIONS = 100000000; // Максимальное число для предотвращения бесконечных циклов
  const TYPES_COUNT = 100; // Количество различных типов ассоциаций

  // Массив для сбора данных скорости по батчам
  const speedData = [];
  const memoryData = [];

  // Начальное время
  const startTime = performance.now();

  // Создаем типы ассоциаций
  console.log(`\n📦 Создание ${TYPES_COUNT} типов ассоциаций...`);
  const types = Array(TYPES_COUNT).fill(null).map((_, i) => deep({ name: `type${i}` }));

  // Массив для хранения ассоциаций
  const associations = [];
  let totalCreated = 0;
  let lastReportedCount = 0;
  let memoryPerAssociation = 0;
  let lastBatchTime = performance.now();

  try {
    // Цикл создания ассоциаций и установки типов
    console.log(`\n🔄 Начинаем создавать ассоциации и устанавливать связи...`);

    while (totalCreated < MAX_ASSOCIATIONS) {
      // Создаем новую партию ассоциаций
      const startBatchMemory = process.memoryUsage().heapUsed;
      const newAssociations = [];

      for (let i = 0; i < BATCH_SIZE; i++) {
        const ass = deep({ id: totalCreated + i });
        // Устанавливаем случайный тип
        const typeIndex = (totalCreated + i) % TYPES_COUNT;
        ass.type = types[typeIndex];

        newAssociations.push(ass);
      }

      // Добавляем новые ассоциации в общий массив
      associations.push(...newAssociations);
      totalCreated += BATCH_SIZE;

      // Обновляем статистику памяти
      monitor.update();

      // Вычисляем среднее потребление памяти на одну ассоциацию
      const endBatchMemory = process.memoryUsage().heapUsed;
      const batchMemoryUsage = endBatchMemory - startBatchMemory;
      memoryPerAssociation = batchMemoryUsage / BATCH_SIZE;

      // Вычисляем производительность
      const now = performance.now();
      const batchTime = now - lastBatchTime;
      const speed = BATCH_SIZE / (batchTime / 1000);
      lastBatchTime = now;

      // Сохраняем данные для отчета
      speedData.push(speed);
      memoryData.push(memoryPerAssociation);

      // Выводим отчет каждые 10 пакетов
      if (totalCreated - lastReportedCount >= BATCH_SIZE * 10) {
        console.log(`✅ Создано ${formatNumber(totalCreated)} ассоциаций с типами`);
        console.log(`⚡ Скорость: ${formatNumber(Math.round(speed))} ассоциаций/сек`);
        console.log(`💾 Память на 1 ассоциацию: ${formatMemory(memoryPerAssociation)}`);
        console.log(`⏱️ Прошло времени: ${((now - startTime) / 1000).toFixed(1)} сек\n`);
        lastReportedCount = totalCreated;
      }

      // Проверяем память каждую итерацию
      if (monitor.heapUsed > 1.8 * 1024 * 1024 * 1024) { // Если используется больше 1.8 ГБ памяти
        console.log(`⚠️ Достигнут предел памяти (${formatMemory(monitor.heapUsed)})`);
        break;
      }

      // Даем шанс сборщику мусора выполнить свою работу
      if (totalCreated % (BATCH_SIZE * 20) === 0) {
        if (global.gc) {
          console.log('♻️ Принудительный запуск сборщика мусора...');
          global.gc();
          monitor.update();
        }

        // Короткая пауза чтобы позволить выполнить другие операции в Event Loop
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  } catch (error) {
    console.error(`❌ Ошибка при выполнении теста:`, error);
  } finally {
    // Финальное время
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;

    // Сохраняем результаты теста
    limitsSuite.tests.push({
      name: 'Максимальное количество ассоциаций с типами',
      stat: {
        count: totalCreated,
        rps: Math.round(totalCreated / duration),
        avg: duration / totalCreated,
        memoryPerAssociation: memoryPerAssociation
      }
    });

    // Сохраняем данные скоростей по пакетам
    limitsSuite.tests.push({
      name: 'Средняя скорость (ассоциаций/сек)',
      stat: {
        rps: speedData.reduce((sum, speed) => sum + speed, 0) / speedData.length,
        min: Math.min(...speedData),
        max: Math.max(...speedData)
      }
    });

    // Сохраняем данные по памяти
    limitsSuite.tests.push({
      name: 'Память на одну ассоциацию',
      stat: {
        avg: memoryData.reduce((sum, mem) => sum + mem, 0) / memoryData.length,
        min: Math.min(...memoryData.filter(m => m > 0)),
        max: Math.max(...memoryData)
      }
    });

    // Финальный отчет
    console.log('\n📝 ИТОГОВЫЙ ОТЧЕТ ТЕСТА НА ЛИМИТЫ');
    console.log('==================================');
    console.log(`📊 Общее количество созданных ассоциаций: ${formatNumber(totalCreated)}`);
    console.log(`⏱️ Общее время выполнения: ${duration.toFixed(1)} сек`);
    console.log(`⚡ Средняя скорость создания: ${formatNumber(Math.round(totalCreated / duration))} ассоциаций/сек`);
    console.log(`💾 Средний размер одной ассоциации: ${formatMemory(memoryPerAssociation)}`);

    // Финальный отчет о памяти
    monitor.report();

    // Теоретический максимум ассоциаций
    const maxHeapSize = 2 * 1024 * 1024 * 1024; // предположим 2GB максимум
    const theoreticalMax = Math.floor(maxHeapSize / memoryPerAssociation);
    console.log(`📈 Теоретический максимум ассоциаций в 2GB памяти: ${formatNumber(theoreticalMax)}`);

    // Оценка памяти на 1 миллион ассоциаций
    const memoryPerMillion = memoryPerAssociation * 1000000;
    console.log(`💾 Оценка памяти на 1 миллион ассоциаций: ${formatMemory(memoryPerMillion)}`);

    // Рекомендации
    console.log('\n🔍 РЕКОМЕНДАЦИИ:');
    if (totalCreated < 1000000) {
      console.log('⚠️ Количество созданных ассоциаций меньше 1 миллиона. Возможно, требуется оптимизация использования памяти.');
      console.log('   • Рекомендуется проверить реализацию метода type в relations.js');
      console.log('   • Рассмотреть возможность использования WeakMap или WeakSet для хранения связей');
      console.log('   • Проверить наличие утечек памяти в отслеживании событий (track)');
    } else {
      console.log('✅ Достигнуто хорошее количество ассоциаций. Система демонстрирует стабильное поведение.');
    }

    // Добавляем общие результаты и выводы
    limitsSuite.tests.push({
      name: 'Теоретический максимум ассоциаций в 2GB памяти',
      stat: {
        count: theoreticalMax
      }
    });

    limitsSuite.tests.push({
      name: 'Память на 1 миллион ассоциаций',
      stat: {
        bytes: memoryPerMillion,
        formatted: formatMemory(memoryPerMillion)
      }
    });

    // Добавляем сьют в результаты
    results.suites.push(limitsSuite);

    // Добавляем общее время выполнения
    results.elapsedMs = endTime - startTime;

    // Генерируем Markdown отчет
    generateMarkdownReport(results);

    console.log('\n🏁 Тест на лимиты завершен');
  }
}

// Функция для генерации Markdown отчета
function generateMarkdownReport(results) {
  try {
    const fileName = 'RELATIONS.limits.md';
    console.log(`🔄 Генерация Markdown отчета: ${fileName}`);

    // Создаем содержимое MD файла
    let mdContent = `# ${results.name}\n\n`;
    mdContent += `${results.description}\n\n`;

    // Добавляем системную информацию
    mdContent += '## Информация о системе\n\n';
    for (const [key, value] of Object.entries(results.environment)) {
      mdContent += `- **${key}:** ${value}\n`;
    }
    mdContent += '\n';

    // Добавляем результаты теста
    for (const suite of results.suites) {
      mdContent += `## ${suite.name}\n\n`;

      // Конвертируем тесты в таблицу
      mdContent += '| Метрика | Значение |\n';
      mdContent += '|---------|----------|\n';

      for (const test of suite.tests) {
        if (test.name.includes('Максимальное количество')) {
          mdContent += `| ${test.name} | ${formatNumber(test.stat.count)} |\n`;
          mdContent += `| Скорость создания | ${formatNumber(Math.round(test.stat.rps))} ассоциаций/сек |\n`;
          mdContent += `| Среднее время на одну ассоциацию | ${(test.stat.avg * 1000).toFixed(3)} мс |\n`;
          mdContent += `| Память на одну ассоциацию | ${formatMemory(test.stat.memoryPerAssociation)} |\n`;
        } else if (test.name.includes('Средняя скорость')) {
          mdContent += `| ${test.name} | ${formatNumber(Math.round(test.stat.rps))} |\n`;
          mdContent += `| Минимальная скорость | ${formatNumber(Math.round(test.stat.min))} ассоциаций/сек |\n`;
          mdContent += `| Максимальная скорость | ${formatNumber(Math.round(test.stat.max))} ассоциаций/сек |\n`;
        } else if (test.name.includes('Память на одну ассоциацию')) {
          mdContent += `| ${test.name} (среднее) | ${formatMemory(test.stat.avg)} |\n`;
          mdContent += `| Минимальный размер на ассоциацию | ${formatMemory(test.stat.min)} |\n`;
          mdContent += `| Максимальный размер на ассоциацию | ${formatMemory(test.stat.max)} |\n`;
        } else if (test.name.includes('Теоретический максимум')) {
          mdContent += `| ${test.name} | ${formatNumber(test.stat.count)} |\n`;
        } else if (test.name.includes('Память на 1 миллион')) {
          mdContent += `| ${test.name} | ${test.stat.formatted} |\n`;
        }
      }

      mdContent += '\n';
    }

    // Добавляем выводы и рекомендации
    mdContent += '## Выводы и рекомендации\n\n';

    // Определяем главный вывод на основе результатов
    const mainSuite = results.suites[0];
    const maxAssociationsTest = mainSuite.tests.find(t => t.name.includes('Максимальное количество'));

    if (maxAssociationsTest && maxAssociationsTest.stat.count >= 1000000) {
      mdContent += '✅ **Система показывает хорошую производительность** при работе с большим количеством ассоциаций.\n\n';
      mdContent += '### Сильные стороны:\n';
      mdContent += '- Возможность создания и работы с более чем 1 миллионом ассоциаций\n';
      mdContent += '- Стабильная скорость создания и установки связей\n';
      mdContent += '- Умеренное потребление памяти на одну ассоциацию\n\n';
    } else {
      mdContent += '⚠️ **Система имеет ограничения** при работе с большим количеством ассоциаций.\n\n';
      mdContent += '### Выявленные проблемы:\n';
      mdContent += '- Ограничение по количеству создаваемых ассоциаций (менее 1 миллиона)\n';
      mdContent += '- Высокое потребление памяти на одну ассоциацию\n\n';
    }

    mdContent += '### Рекомендации по оптимизации:\n';
    mdContent += '1. Оптимизировать хранение связей между ассоциациями\n';
    mdContent += '2. Рассмотреть возможность использования WeakMap/WeakSet для уменьшения потребления памяти\n';
    mdContent += '3. Оптимизировать процесс установки и изменения типов для ассоциаций\n';
    mdContent += '4. Улучшить кеширование и повторное использование объектов для снижения нагрузки на сборщик мусора\n\n';

    // Добавляем время выполнения теста
    mdContent += `## Время выполнения\n\n`;
    mdContent += `- Дата запуска: ${new Date(results.timestamp).toISOString()}\n`;
    mdContent += `- Общее время выполнения: ${(results.elapsedMs / 1000).toFixed(1)} сек\n`;

    // Сохраняем файл
    fs.writeFileSync(fileName, mdContent, 'utf8');
    console.log(`✅ Markdown отчет сохранен в: ${fileName}`);
  } catch (error) {
    console.error(`❌ Ошибка при создании Markdown отчета:`, error);
  }
}

// Проверяем, включена ли опция --expose-gc
if (!global.gc) {
  console.warn('⚠️ Для лучших результатов запустите Node.js с флагом --expose-gc для принудительной сборки мусора.');
  console.warn('   Пример: node --expose-gc --max-old-space-size=2048 relations.limits.js');
}

// Запускаем тест на лимиты
runLimitsTest().catch(error => {
  console.error('❌ Ошибка при запуске теста на лимиты:', error);
});
