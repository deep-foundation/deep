/**
 * Скрипт для обновления документации из результатов бенчмарков
 *
 * Находит все файлы *.benchmark.js в корне проекта,
 * запускает их и вставляет вывод в соответствующие разделы документации.
 *
 * Поддерживаемые форматы бенчмарков:
 * 1. benchmarkify (формат используемый в track.benchmark.js, gets.benchmark.js)
 *    ```
 *    Suite: имя_сьюта
 *    ==============
 *
 *    test_name  -XX.XX% (123,456 ops/sec) (avg: Xμs)
 *    ```
 *
 * 2. mitata формат (используемый в некоторых бенчмарках)
 *    ```
 *    ✓ test_name 123,456 ops/sec
 *    ```
 *
 * Можно указать конкретный бенчмарк через переменную окружения BENCHMARK:
 * BENCHMARK="many.benchmark.js" node scripts/benchmarkify.js
 *
 * Дополнительные переменные окружения:
 * - DEBUG=true - включает режим отладки
 * - QUICK=true - запускает минимальное количество тестов для быстрой проверки
 * - TIMEOUT=60 - устанавливает таймаут в секундах (по умолчанию 120)
 * - MAX_DURATION=30 - максимальное время выполнения бенчмарка в секундах
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Соответствие между файлами бенчмарков и документацией
const BENCHMARK_DOCS_MAP = {
  'events.benchmark.js': 'EVENTS.md',
  'memory.benchmark.js': 'MEMORY.md',
  'association.benchmark.js': 'ASSOCIATION.md',
  'lifecycle.benchmark.js': 'LIFECYCLE.md',
  'is.benchmark.js': 'IS.md',
  'gets.benchmark.js': 'GETS.md',
  'sets.benchmark.js': 'SETS.md',
  'many.benchmark.js': 'MANY.md',
  'track.benchmark.js': 'TRACK.md'
};

// Функция для запуска бенчмарка и получения результатов
function runBenchmark(benchmarkPath) {
  console.log(`Запуск бенчмарка: ${benchmarkPath}`);
  console.log(`Время начала: ${new Date().toISOString()}`);

  // Проверяем флаг отладки
  const isDebug = process.env.DEBUG === 'true';
  const nodeCommand = isDebug ? 'node --trace-warnings --inspect' : 'node';

  // Проверяем флаг таймаута - по умолчанию 2 минуты, в отладке 10 минут
  // Можно задать через переменную окружения TIMEOUT
  const defaultTimeout = isDebug ? 10 * 60 * 1000 : 2 * 60 * 1000;
  const timeoutMs = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT, 10) * 1000 : defaultTimeout;

  const fullCommand = `${nodeCommand} ${benchmarkPath}`;

  console.log(`Команда запуска: ${fullCommand}`);
  console.log(`Установлен таймаут: ${timeoutMs}ms (${timeoutMs/1000} сек)`);

  try {
    // Запускаем бенчмарк и получаем его вывод
    const output = execSync(fullCommand, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024, // Увеличиваем размер буфера
      timeout: timeoutMs // Устанавливаем таймаут
    });

    console.log(`Бенчмарк завершен успешно. Время окончания: ${new Date().toISOString()}`);
    console.log(`Получено ${output.length} байт данных`);

    return output;
  } catch (error) {
    console.error(`Ошибка при запуске бенчмарка ${benchmarkPath}:`, error.message);
    if (error.code === 'ETIMEDOUT') {
      console.error(`Бенчмарк превысил время выполнения и был прерван`);
    }
    if (error.stdout) {
      console.log(`Частичный вывод бенчмарка (первые 500 символов):`);
      console.log(error.stdout.substring(0, 500));

      // Если у нас есть частичный вывод, используем его вместо прекращения работы
      // Это помогает обновить документацию хотя бы частично
      console.log(`Используем частичный вывод бенчмарка для обновления документации`);
      return error.stdout;
    }
    return null;
  }
}

// Функция для очистки ANSI-кодов цветов из строки
function stripAnsi(str) {
  // Регулярное выражение для удаления ANSI escape последовательностей
  return str.replace(/\x1B\[\d+m/g, '');
}

// Функция для создания таблицы из результатов бенчмарка
function createMarkdownTable(benchmarkOutput) {
  // Очищаем от ANSI-кодов цветов
  const cleanOutput = stripAnsi(benchmarkOutput);

  // Разбиваем на строки
  const lines = cleanOutput.split('\n');

  // Найдем информационные строки
  let systemInfo = [];
  let tableData = [];
  let processedNames = new Set(); // Для исключения дубликатов

  // Добавим отладочную информацию
  console.log(`Обрабатываем ${lines.length} строк вывода бенчмарка`);

  // Режим отладки можно включить через переменную окружения
  const isDebugMode = process.env.DEBUG === 'true';

  // Если включен режим отладки, выведем все строки, содержащие ops/sec или ops/s
  if (isDebugMode) {
    console.log('Все строки, содержащие ops/sec, ops/s, s/iter или ms/iter:');
    lines.forEach((line, i) => {
      if (line.includes('ops/sec') || line.includes('ops/s') ||
          line.includes('s/iter') || line.includes('ms/iter')) {
        console.log(`[${i}]: ${line}`);
      }
    });
  }

  // Собираем системную информацию
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('Darwin') || line.includes('Node.JS:') || line.includes('V8:') ||
        line.includes('CPU:') || line.includes('Memory:')) {
      systemInfo.push(line.trim());
    }
  }

  // Ищем строки с результатами для последующей обработки
  const checkmarkLines = [];
  const allResults = [];
  let suiteForLine = {};
  let currentLineIndex = 0;

  // Сначала проходим и находим все сьюты и их индексы
  const suiteRanges = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Определение текущего сьюта - ищем строки вида "Suite: имя_сьюта" или "имя_сьюта\n========"
    if (line.includes('Suite:')) {
      const suiteName = line.replace('Suite:', '').trim();
      suiteRanges.push({ start: i, name: suiteName });
      console.log(`Найден сьют: ${suiteName} (строка ${i})`);
    }
    else if (i < lines.length - 1 && lines[i+1].match(/^=+$/)) {
      // Формат benchmarkify: название сьюта и следующая строка с ====
      const suiteName = line.trim();
      suiteRanges.push({ start: i, name: suiteName });
      console.log(`Найден сьют в формате benchmarkify: ${suiteName} (строка ${i})`);
    }

    // Ищем строки с результатами для последующей обработки
    if (line.includes('ops/sec') || line.includes('ops/s') ||
        line.includes('s/iter') || line.includes('ms/iter')) {
      checkmarkLines.push({ index: i, content: line });
    }
  }

  // Сортируем сьюты по порядку их появления
  suiteRanges.sort((a, b) => a.start - b.start);

  // Определяем текущий сьют для каждой строки с результатами
  for (const { index, content } of checkmarkLines) {
    // Находим, к какому сьюту относится строка
    let suiteName = "Основной";
    for (let i = suiteRanges.length - 1; i >= 0; i--) {
      if (index > suiteRanges[i].start) {
        suiteName = suiteRanges[i].name;
        break;
      }
    }

    // Формат 1: "test_name -XX.XX% (123,456 ops/sec)" (benchmarkify)
    let match = content.match(/^\s*(.*?)\s+[\-\d\.]+%\s+\(([\d,]+)\s+ops\/sec\)/);

    // Формат 2: "✓ test_name 123,456 ops/sec" (mitata со значком ✓)
    if (!match) {
      match = content.match(/^[✓✔]\s+(.*?)\s+([\d,]+)\s+ops\/sec/);
    }

    // Формат 3: "test_name 123,456 ops/sec" (mitata без значка)
    if (!match) {
      match = content.match(/^\s*(.*?)\s+([\d,]+)\s+ops\/sec/);
    }

    // Формат 4: "test_name 123,456 ops/s (xx ns)" (вариант mitata)
    if (!match) {
      match = content.match(/^\s*(.*?)\s+([\d,]+)\s+ops\/s/);
    }

    // Формат 5: "test_name XX.XX s/iter" (mitata время в секундах)
    if (!match) {
      const timeMatch = content.match(/^\s*(.*?)\s+([\d,.]+)\s+s\/iter/);
      if (timeMatch) {
        const name = timeMatch[1].trim();
        const timeInSeconds = parseFloat(timeMatch[2].replace(/,/g, '.'));
        if (timeInSeconds > 0) {
          match = [null, name, Math.round(1 / timeInSeconds)];
          if (isDebugMode) {
            console.log(`Преобразовано из s/iter: ${name} -> ${match[2]} ops/sec`);
          }
        }
      }
    }

    // Формат 6: "test_name XX.XX ms/iter" (mitata время в миллисекундах)
    if (!match) {
      const timeMatch = content.match(/^\s*(.*?)\s+([\d,.]+)\s+ms\/iter/);
      if (timeMatch) {
        const name = timeMatch[1].trim();
        const timeInMs = parseFloat(timeMatch[2].replace(/,/g, '.'));
        if (timeInMs > 0) {
          match = [null, name, Math.round(1000 / timeInMs)];
          if (isDebugMode) {
            console.log(`Преобразовано из ms/iter: ${name} -> ${match[2]} ops/sec`);
          }
        }
      }
    }

    // Формат 7: "test_name XX.XX µs/iter" (mitata время в микросекундах)
    if (!match) {
      const timeMatch = content.match(/^\s*(.*?)\s+([\d,.]+)\s+µs\/iter/);
      if (timeMatch) {
        const name = timeMatch[1].trim();
        const timeInUs = parseFloat(timeMatch[2].replace(/,/g, '.'));
        if (timeInUs > 0) {
          match = [null, name, Math.round(1000000 / timeInUs)];
          if (isDebugMode) {
            console.log(`Преобразовано из µs/iter: ${name} -> ${match[2]} ops/sec`);
          }
        }
      }
    }

    if (match) {
      const name = match[1].trim();
      const fullName = `${suiteName}: ${name}`;

      if (processedNames.has(fullName)) continue; // Пропускаем дубликаты

      // Удаляем запятые из числа перед преобразованием в Integer
      const opsPerSec = typeof match[2] === 'number' ? match[2] : parseInt(match[2].replace(/,/g, ''), 10);

      console.log(`Найден результат: "${fullName}" -> ${opsPerSec} ops/sec (строка ${index})`);

      // Пропускаем тесты с wildcard подписками для Events
      if ((fullName.includes('Events:') || fullName.includes('EventEmitter:')) &&
          (fullName.includes('wildcard') || fullName.includes('Wildcard'))) {
        console.log(`  Пропускаем wildcard тест: ${fullName}`);
        continue;
      }

      // Вычисляем среднее время выполнения
      const avgInMicroseconds = 1000000 / opsPerSec;
      const avg = avgInMicroseconds.toFixed(2);

      tableData.push({ name: fullName, avg, unit: 'µs', opsPerSec });
      processedNames.add(fullName);
    } else {
      console.log(`Не удалось разобрать строку ${index}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
    }
  }

  console.log(`Найдено ${tableData.length} тестов для включения в таблицу`);

  // Создаем таблицу Markdown
  let markdown = '';

  // Добавляем информацию о системе
  if (systemInfo.length > 0) {
    markdown += "**Информация о системе:**\n\n";
    for (const info of systemInfo) {
      markdown += `- ${info}\n`;
    }
    markdown += "\n";
  }

  if (tableData.length === 0) {
    markdown += "*Не удалось получить результаты бенчмарка. Проверьте вывод скрипта.*\n\n";
  } else {
    // Создаем заголовок таблицы
    markdown += "| Тест | Среднее время выполнения | Операций в секунду |\n";
    markdown += "|------|--------------------------|--------------------|\n";

    // Добавляем строки таблицы
    for (const data of tableData) {
      markdown += `| ${data.name} | ${data.avg} ${data.unit}/итер | ${data.opsPerSec.toLocaleString('ru-RU')} опер/сек |\n`;
    }
  }

  return { markdown, tableData, systemInfo };
}

// Функция для создания сравнительной таблицы для Memory
function createMemoryComparisonTable(tableData, systemInfo) {
  // Создаем таблицу сравнения для Memory
  let markdown = "";

  // Определяем необходимые операции для сравнения
  const operationsToCompare = [
    { pattern: 'создание', name: 'Создание 1000 связей' },
    { pattern: 'получение 1000 one', name: 'Получение 1000 one-связей' },
    { pattern: 'получение 100 many|получение 10 many', name: 'Получение many-связей' },
    { pattern: 'обновление', name: 'Обновление 1000 связей' },
    { pattern: 'удаление', name: 'Удаление 1000 связей' }
  ];

  // Создаем объект для хранения данных по каждой операции
  const operationData = {};

  // Заполняем данными из тестов
  for (const operation of operationsToCompare) {
    operationData[operation.name] = {
      memory: null,
      map: null,
      mapSet: null
    };

    // Ищем соответствующие тесты для каждой операции
    for (const data of tableData) {
      const name = data.name.toLowerCase();
      const pattern = new RegExp(operation.pattern, 'i');

      if (pattern.test(name)) {
        if (name.startsWith('memory:')) {
          operationData[operation.name].memory = `${data.avg} ${data.unit}`;
        } else if (name.startsWith('map:')) {
          operationData[operation.name].map = `${data.avg} ${data.unit}`;
        } else if (name.startsWith('map+set:')) {
          operationData[operation.name].mapSet = `${data.avg} ${data.unit}`;
        }
      }
    }
  }

  // Добавляем информацию о системе
  markdown += "**Информация о системе:**\n\n";
  for (const info of systemInfo) {
    markdown += `- ${info}\n`;
  }
  markdown += "\n";

  // Создаем таблицу сравнения
  markdown += "| Операция | Memory | Map | Map+Set (для двунаправленных связей) |\n";
  markdown += "|----------|--------|-----|--------------------------------------|\n";

  for (const [operation, data] of Object.entries(operationData)) {
    markdown += `| ${operation} | ${data.memory || '-'} | ${data.map || '-'} | ${data.mapSet || '-'} |\n`;
  }

  return markdown;
}

// Функция для обновления раздела производительности в MD файле
function updateMarkdownFile(mdFilePath, benchmarkOutput, benchmarkName) {
  console.log(`Обновление файла документации: ${mdFilePath}`);
  try {
    if (!fs.existsSync(mdFilePath)) {
      console.error(`Файл документации не найден: ${mdFilePath}`);
      return false;
    }

    // Читаем содержимое файла
    let content = fs.readFileSync(mdFilePath, 'utf8');
    console.log(`Размер файла ${mdFilePath}: ${content.length} байт`);

    // Перед поиском раздела, убедимся что мы используем правильный уровень заголовка
    // для разных документов
    let perfHeadingLevel = '##';
    if (mdFilePath.includes('EVENTS.md')) {
      // В EVENTS.md используется уровень # для заголовка "Производительность"
      perfHeadingLevel = '#';
    }

    // Используем очень простой подход - заменяем содержимое между заголовком "Производительность"
    // и следующим заголовком того же или более высокого уровня

    // Ищем позицию заголовка Производительность
    const perfTitle = `${perfHeadingLevel} Производительность`;
    const perfTitleIndex = content.indexOf(perfTitle);

    if (perfTitleIndex === -1) {
      console.error(`Раздел "${perfTitle}" не найден в файле ${mdFilePath}`);
      return false;
    }

    console.log(`Заголовок "${perfTitle}" найден в позиции ${perfTitleIndex}`);

    // Ищем следующий заголовок того же уровня
    const nextHeadingRegex = new RegExp(`\\n${perfHeadingLevel[0]}{1,${perfHeadingLevel.length}} `, 'g');
    nextHeadingRegex.lastIndex = perfTitleIndex + perfTitle.length;
    const match = nextHeadingRegex.exec(content);

    const endIndex = match ? match.index : content.length;
    console.log(`Следующий заголовок найден в позиции ${endIndex}`);

    // Создаем таблицу из результатов бенчмарка и получаем данные для анализа
    const { markdown: markdownTable, tableData, systemInfo } = createMarkdownTable(benchmarkOutput);
    console.log(`Создана таблица с ${tableData.length} строками результатов`);

    // Создаем содержимое раздела в зависимости от типа бенчмарка
    let newContent = '';
    if (benchmarkName === 'memory.benchmark.js') {
      // Для Memory используем специальную таблицу сравнения
      newContent = createMemoryComparisonTable(tableData, systemInfo);
    } else {
      // Для других бенчмарков используем обычную таблицу
      newContent = markdownTable;
    }

    // Формируем новое содержимое раздела с заголовком
    const newSection = `${perfTitle}\n\n${newContent}`;

    // Заменяем старый раздел на новый
    const updatedContent =
      content.substring(0, perfTitleIndex) +
      newSection +
      content.substring(endIndex);

    // Записываем обновленное содержимое в файл
    fs.writeFileSync(mdFilePath, updatedContent, 'utf8');

    console.log(`Файл ${mdFilePath} успешно обновлен, добавлено ${newContent.length} байт`);
    return true;
  } catch (error) {
    console.error(`Ошибка при обновлении файла ${mdFilePath}:`, error.message);
    console.error(error.stack);
    return false;
  }
}

// Основная функция
async function main() {
  console.log('Запуск обновления документации из результатов бенчмарков...');

  // Получаем список бенчмарков для обработки
  const targetBenchmark = process.env.BENCHMARK;
  const benchmarksToProcess = targetBenchmark
    ? { [targetBenchmark]: BENCHMARK_DOCS_MAP[targetBenchmark] }
    : BENCHMARK_DOCS_MAP;

  // Проверяем существование указанного бенчмарка
  if (targetBenchmark && !benchmarksToProcess[targetBenchmark]) {
    console.error(`Ошибка: Бенчмарк "${targetBenchmark}" не найден в списке поддерживаемых бенчмарков`);
    process.exit(1);
  }

  // Обрабатываем каждый бенчмарк
  for (const [benchmarkFile, mdFile] of Object.entries(benchmarksToProcess)) {
    console.log(`\nОбработка бенчмарка: ${benchmarkFile}`);

    // Запускаем бенчмарк и получаем результаты
    const benchmarkOutput = runBenchmark(benchmarkFile);

    if (benchmarkOutput) {
      // Обновляем документацию
      const success = updateMarkdownFile(mdFile, benchmarkOutput, benchmarkFile);

      if (success) {
        console.log(`✅ Документация успешно обновлена: ${mdFile}`);
      } else {
        console.error(`❌ Ошибка при обновлении документации: ${mdFile}`);
      }
    }
  }

  console.log('\nОбновление документации завершено!');
}

// Запускаем скрипт
main().catch(error => {
  console.error('Ошибка при выполнении скрипта:', error);
  process.exit(1);
});
