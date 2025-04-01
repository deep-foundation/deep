/**
 * Утилита для преобразования результатов бенчмарков в Markdown
 */

import fs from 'node:fs';
import path from 'node:path';
import { markdownTable } from 'markdown-table';

/**
 * Преобразует результаты бенчмарков в Markdown и сохраняет в файл
 * @param {Object} benchmarkResults - Результаты бенчмарков из Benchmarkify
 * @param {string} outputPath - Путь для сохранения MD файла
 */
export function saveBenchmarkToMarkdown(benchmarkResults, outputPath) {
  try {
    console.log(`🔄 Генерация Markdown отчета для: ${benchmarkResults.name || 'безымянного бенчмарка'}`);
    console.log(`🔄 Количество сьютов: ${benchmarkResults.suites ? benchmarkResults.suites.length : 0}`);

    // Проверяем структуру данных
    if (!benchmarkResults || !benchmarkResults.suites) {
      console.error('❌ Некорректная структура данных бенчмарка:', benchmarkResults);
      console.error('❌ Отсутствует свойство suites');
      return;
    }

    const mdContent = generateMarkdownReport(benchmarkResults);
    fs.writeFileSync(outputPath, mdContent, 'utf8');
    console.log(`✅ Markdown отчет сохранен в: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Ошибка при создании Markdown отчета:`, error);
  }
}

/**
 * Создает содержимое Markdown отчета
 * @param {Object} benchmarkResults - Результаты бенчмарков
 * @returns {string} - Markdown содержимое
 */
export function generateMarkdownReport(benchmarkResults) {
  let markdown = `# ${benchmarkResults.name || 'Результаты бенчмарка'}\n\n`;

  if (benchmarkResults.description) {
    markdown += `${benchmarkResults.description}\n\n`;
  }

  // Добавляем системную информацию
  markdown += '## Информация о системе\n\n';

  const systemInfo = getSystemInfo(benchmarkResults);
  markdown += systemInfoToMarkdown(systemInfo);

  // Добавляем результаты каждого сьюта
  for (const suite of benchmarkResults.suites) {
    // Пропускаем пустые сьюты
    if (!suite || !suite.tests || suite.tests.length === 0) {
      continue;
    }

    markdown += `\n## ${suite.name}\n\n`;

    if (suite.description) {
      markdown += `${suite.description}\n\n`;
    }

    markdown += testsToMarkdownTable(suite.tests);
    markdown += '\n\n';
  }

  // Добавляем информацию о времени выполнения
  markdown += `\n## Время выполнения\n\n`;
  markdown += `- Дата запуска: ${benchmarkResults.generated || benchmarkResults.timestamp ? new Date(benchmarkResults.timestamp).toISOString() : new Date().toISOString()}\n`;
  markdown += `- Общее время выполнения: ${formatTime(benchmarkResults.elapsedMs)}\n`;

  return markdown;
}

/**
 * Преобразует системную информацию в Markdown
 * @param {Object} systemInfo - Информация о системе
 * @returns {string} - Markdown разметка
 */
function systemInfoToMarkdown(systemInfo) {
  let markdown = '';

  for (const [key, value] of Object.entries(systemInfo)) {
    markdown += `- **${key}:** ${value}\n`;
  }

  return markdown;
}

/**
 * Извлекает системную информацию из результатов бенчмарка
 * @param {Object} benchmarkResults - Результаты бенчмарков
 * @returns {Object} - Объект с системной информацией
 */
function getSystemInfo(benchmarkResults) {
  console.log('🔄 Получение системной информации');

  // Извлекаем информацию из Benchmarkify результатов
  // Поля могут отличаться в зависимости от версии benchmarkify
  const info = {
    'Операционная система': process.platform + ' ' + process.arch,
    'Node.JS': process.version,
    'V8': process.versions.v8
  };

  // Добавляем информацию о CPU, если она доступна в результатах
  if (benchmarkResults.environment?.cpu) {
    info['CPU'] = benchmarkResults.environment.cpu;
  }

  // Добавляем информацию о памяти, если она доступна в результатах
  if (benchmarkResults.environment?.memory) {
    info['Memory'] = benchmarkResults.environment.memory;
  }

  return info;
}

/**
 * Преобразует тесты в Markdown таблицу
 * @param {Array} tests - Массив тестов
 * @returns {string} - Markdown таблица
 */
function testsToMarkdownTable(tests) {
  // Если тестов нет, выводим сообщение
  if (!tests || tests.length === 0) {
    return "*Нет данных для отображения*";
  }

  console.log(`🔄 Создание таблицы для ${tests.length} тестов`);

  // Создаем заголовок таблицы
  const tableData = [
    ['Тест', 'Операций/сек', 'Среднее время (мкс)', 'Относительная производительность']
  ];

  // Находим самый быстрый тест для расчета относительной производительности
  let fastestRps = 0;
  for (const test of tests) {
    const rps = test.stat?.rps || 0;
    if (rps > fastestRps) {
      fastestRps = rps;
    }
  }

  // Заполняем таблицу данными тестов
  for (const test of tests) {
    if (!test || !test.name) {
      continue; // Пропускаем некорректные тесты
    }

    const rps = test.stat?.rps || 0;
    const avg = test.stat?.avg || 0;
    const relativePerf = fastestRps > 0 ? (rps / fastestRps * 100).toFixed(2) + '%' : 'N/A';

    tableData.push([
      test.name,
      formatNumber(rps),
      formatNumber(avg * 1000000), // Переводим в микросекунды
      relativePerf
    ]);
  }

  try {
    // Создаем таблицу с выравниванием столбцов
    return markdownTable(tableData, {
      align: ['l', 'r', 'r', 'r']
    });
  } catch (error) {
    console.error('❌ Ошибка при создании Markdown таблицы:', error);
    // Возвращаем простой текст вместо таблицы в случае ошибки
    return "Ошибка при создании таблицы результатов";
  }
}

/**
 * Форматирует число с разделением разрядов
 * @param {number} value - Число для форматирования
 * @param {number} digits - Количество знаков после запятой
 * @returns {string} - Форматированное число
 */
function formatNumber(value, digits = 2) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'N/A';
  }

  try {
    return value.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: digits
    });
  } catch (error) {
    return value.toString();
  }
}

/**
 * Форматирует время выполнения в удобный формат
 * @param {number} ms - Время в миллисекундах
 * @returns {string} - Форматированное время
 */
function formatTime(ms) {
  if (!ms || typeof ms !== 'number' || isNaN(ms)) return 'неизвестно';

  if (ms < 1000) {
    return `${ms} мс`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)} сек`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(2);
    return `${minutes} мин ${seconds} сек`;
  }
}
