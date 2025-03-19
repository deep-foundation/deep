/**
 * Скрипт для обновления документации из результатов бенчмарков
 *
 * Находит все файлы *.benchmark.js в корне проекта,
 * запускает их и вставляет вывод в соответствующие разделы документации.
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
  'sets.benchmark.js': 'SETS.md'
};

// Функция для запуска бенчмарка и получения результатов
function runBenchmark(benchmarkPath) {
  console.log(`Запуск бенчмарка: ${benchmarkPath}`);

  try {
    // Запускаем бенчмарк и получаем его вывод
    const output = execSync(`node ${benchmarkPath}`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024 // Увеличиваем размер буфера
    });

    return output;
  } catch (error) {
    console.error(`Ошибка при запуске бенчмарка ${benchmarkPath}:`, error.message);
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
  let inTable = false;

  for (const line of lines) {
    // Сначала собираем информацию о системе
    if (line.includes('clk:') || line.includes('cpu:') || line.includes('runtime:')) {
      systemInfo.push(line.trim());
    }
    // Находим заголовок таблицы
    else if (line.includes('benchmark') && line.includes('avg (min … max)')) {
      inTable = true;
      // Пропускаем заголовок и разделительную линию
      continue;
    }
    // Если мы внутри таблицы и строка не пустая
    else if (inTable && line.trim()) {
      // Пропускаем разделительные линии в таблице
      if (line.startsWith('---')) continue;

      // Извлекаем название бенчмарка и результаты
      const benchmarkRegex = /^(.*?)\s+(\d+\.\d+)\s+(µs|ms|ns|s)\/iter/;
      const match = line.match(benchmarkRegex);

      if (match) {
        const name = match[1].trim();
        const avg = match[2];
        const unit = match[3];

        // Пропускаем тесты с wildcard подписками для Events
        if ((name.includes('Events:') || name.includes('EventEmitter:')) &&
            (name.includes('wildcard') || name.includes('Wildcard'))) {
          continue;
        }

        tableData.push({ name, avg, unit });
      }
    }
  }

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

  // Создаем заголовок таблицы
  markdown += "| Тест | Среднее время выполнения | Операций в секунду |\n";
  markdown += "|------|--------------------------|--------------------|\n";

  // Добавляем строки таблицы
  for (const data of tableData) {
    // Вычисляем операции в секунду
    const opsPerSec = (1 / parseFloat(data.avg)) * (
      data.unit === 'ns' ? 1e9 :
      data.unit === 'µs' ? 1e6 :
      data.unit === 'ms' ? 1e3 : 1
    );

    markdown += `| ${data.name} | ${data.avg} ${data.unit}/итер | ${opsPerSec.toLocaleString('ru-RU')} опер/сек |\n`;
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

    // Перед поиском раздела, убедимся что мы используем правильный уровень заголовка
    // для разных документов
    let perfHeadingLevel = '##';
    if (mdFilePath.includes('EVENTS.md')) {
      // В EVENTS.md используется уровень # для заголовка "Производительность"
      perfHeadingLevel = '#';
    }

    // Ищем раздел с производительностью с учетом уровня заголовка
    const perfSectionRegex = new RegExp(`(${perfHeadingLevel} Производительность[\\s\\S]*?)(?=\\n${perfHeadingLevel[0]}|$)`, 'i');
    const perfSection = content.match(perfSectionRegex);

    if (!perfSection) {
      console.error(`Раздел "${perfHeadingLevel} Производительность" не найден в файле ${mdFilePath}`);
      return false;
    }

    // Создаем таблицу из результатов бенчмарка и получаем данные для анализа
    const { markdown: markdownTable, tableData, systemInfo } = createMarkdownTable(benchmarkOutput);

    // Нормализуем все значения к микросекундам для корректного сравнения
    tableData.forEach(data => {
      let avgInMicroseconds = parseFloat(data.avg);
      if (data.unit === 'ns') {
        avgInMicroseconds /= 1000;
      } else if (data.unit === 'ms') {
        avgInMicroseconds *= 1000;
      } else if (data.unit === 's') {
        avgInMicroseconds *= 1000000;
      }

      data.avgInMicroseconds = avgInMicroseconds;
    });

    // Создаем содержимое раздела в зависимости от типа бенчмарка
    let newContent = '';
    if (benchmarkName === 'memory.benchmark.js') {
      // Для Memory используем специальную таблицу сравнения
      newContent = createMemoryComparisonTable(tableData, systemInfo);
    } else {
      // Для других бенчмарков используем обычную таблицу
      newContent = markdownTable;
    }

    // Формируем новое содержимое раздела с сохранением заголовка
    const newPerfSection = `${perfHeadingLevel} Производительность\n\n${newContent}`;

    // Заменяем старый раздел на новый
    const updatedContent = content.replace(perfSectionRegex, newPerfSection);

    // Записываем обновленное содержимое в файл
    fs.writeFileSync(mdFilePath, updatedContent, 'utf8');

    console.log(`Файл ${mdFilePath} успешно обновлен`);
    return true;
  } catch (error) {
    console.error(`Ошибка при обновлении файла ${mdFilePath}:`, error.message);
    return false;
  }
}

// Основная функция
async function main() {
  console.log('Запуск процесса обновления документации...');

  // Находим все файлы бенчмарков в корне проекта
  const files = fs.readdirSync('.');
  const benchmarkFiles = files.filter(file => file.endsWith('.benchmark.js'));

  console.log(`Найдено ${benchmarkFiles.length} файлов бенчмарков`);

  // Обрабатываем каждый файл бенчмарка
  for (const benchmarkFile of benchmarkFiles) {
    // Определяем соответствующий файл документации
    const mdFile = BENCHMARK_DOCS_MAP[benchmarkFile];

    if (!mdFile) {
      console.log(`Для файла ${benchmarkFile} не найден соответствующий файл документации. Пропускаем.`);
      continue;
    }

    // Запускаем бенчмарк
    const benchmarkOutput = runBenchmark(benchmarkFile);

    if (benchmarkOutput) {
      // Обновляем файл документации
      updateMarkdownFile(mdFile, benchmarkOutput, benchmarkFile);
    }
  }

  console.log('Процесс обновления документации завершен');
}

// Запускаем скрипт
main().catch(error => {
  console.error('Ошибка при выполнении скрипта:', error);
  process.exit(1);
});
