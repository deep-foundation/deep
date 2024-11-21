import * as fs from 'fs';
import * as path from 'path';

interface TypeDocJson {
  id: number;
  name: string;
  kind: number;
  kindString?: string;
  children?: TypeDocJson[];
  signatures?: TypeDocJson[];
  type?: any;
  sources?: any[];
  flags?: any;
  comment?: {
    shortText?: string;
    text?: string;
    returns?: string;
    tags?: Array<{
      tag: string;
      text: string;
    }>;
  };
  parameters?: TypeDocJson[];
  getSignature?: TypeDocJson[];
  setSignature?: TypeDocJson[];
}

// Путь к JSON файлу с документацией
const docsJsonPath = path.join(__dirname, '../docs/documentation.json');
// Путь к итоговому API.md
const apiMdPath = path.join(__dirname, '../API.md');

// Проверяем существование JSON файла
if (!fs.existsSync(docsJsonPath)) {
  console.error('Documentation JSON not found. Please run TypeDoc first.');
  process.exit(1);
}

// Функция для форматирования типа
function formatType(type: any): string {
  if (!type) return 'any';
  
  if (type.type === 'reference') {
    return `\`${type.name}\``;
  } else if (type.type === 'intrinsic') {
    return `\`${type.name}\``;
  } else if (type.type === 'union') {
    return type.types.map(formatType).join(' | ');
  } else if (type.type === 'array') {
    return `${formatType(type.elementType)}[]`;
  } else if (type.type === 'reflection') {
    return '`object`';
  }
  
  return `\`${type.type || 'any'}\``;
}

// Функция для форматирования параметров
function formatParameters(parameters?: TypeDocJson[]): string {
  if (!parameters || parameters.length === 0) return '';
  
  let result = '\n\n#### Parameters\n\n';
  result += '| Name | Type | Description |\n';
  result += '|------|------|-------------|\n';
  
  for (const param of parameters) {
    const type = param.type ? formatType(param.type) : 'any';
    const desc = param.comment?.shortText || '';
    result += `| \`${param.name}\` | ${type} | ${desc} |\n`;
  }
  
  return result;
}

// Функция для форматирования возвращаемого значения
function formatReturns(signature: TypeDocJson): string {
  const returnType = signature.type ? formatType(signature.type) : 'void';
  const returnDesc = signature.comment?.returns || '';
  
  return `\n\n#### Returns\n\n${returnType}${returnDesc ? ` - ${returnDesc}` : ''}`;
}

// Функция для форматирования сигнатуры метода
function formatMethodSignature(signature: TypeDocJson): string {
  const parameters = signature.parameters?.map(p => `${p.name}: ${formatType(p.type)}`).join(', ') || '';
  const returnType = signature.type ? formatType(signature.type) : 'void';
  return `(${parameters}): ${returnType}`;
}

// Функция для генерации документации члена класса
function generateMemberDoc(member: TypeDocJson): string {
  let doc = `### ${member.name}\n\n`;
  
  if (member.comment?.shortText) {
    doc += `${member.comment.shortText}\n\n`;
  }
  
  if (member.comment?.text) {
    doc += `${member.comment.text}\n\n`;
  }
  
  if (member.kindString === 'Method') {
    if (member.signatures) {
      const signature = member.signatures[0];
      doc += `\`\`\`typescript\n${member.name}${formatMethodSignature(signature)}\n\`\`\``;
      doc += formatParameters(signature.parameters);
      doc += formatReturns(signature);
    }
  } else if (member.kindString === 'Property') {
    doc += `Type: ${formatType(member.type)}\n\n`;
  } else if (member.kindString === 'Accessor') {
    if (member.getSignature) {
      const signature = member.getSignature[0];
      doc += `Getter Type: ${formatType(signature.type)}\n\n`;
      if (signature.comment?.shortText) {
        doc += `${signature.comment.shortText}\n\n`;
      }
    }
    if (member.setSignature) {
      const signature = member.setSignature[0];
      doc += `Setter Type: ${formatType(signature.parameters?.[0].type)}\n\n`;
    }
  }
  
  return doc;
}

// Функция для генерации документации класса
function generateClassDoc(classData: TypeDocJson): string {
  let doc = `## Class: ${classData.name}\n\n`;
  
  if (classData.comment?.shortText) {
    doc += `${classData.comment.shortText}\n\n`;
  }
  
  if (classData.comment?.text) {
    doc += `${classData.comment.text}\n\n`;
  }
  
  // Группируем члены по категориям
  const properties: TypeDocJson[] = [];
  const methods: TypeDocJson[] = [];
  const accessors: TypeDocJson[] = [];
  
  classData.children?.forEach(child => {
    if (child.kindString === 'Property') {
      properties.push(child);
    } else if (child.kindString === 'Method') {
      methods.push(child);
    } else if (child.kindString === 'Accessor') {
      accessors.push(child);
    }
  });
  
  // Добавляем свойства
  if (properties.length > 0) {
    doc += '## Properties\n\n';
    properties.forEach(prop => {
      doc += generateMemberDoc(prop) + '\n\n---\n\n';
    });
  }
  
  // Добавляем методы
  if (methods.length > 0) {
    doc += '## Methods\n\n';
    methods.forEach(method => {
      doc += generateMemberDoc(method) + '\n\n---\n\n';
    });
  }
  
  // Добавляем аксессоры
  if (accessors.length > 0) {
    doc += '## Accessors\n\n';
    accessors.forEach(accessor => {
      doc += generateMemberDoc(accessor) + '\n\n---\n\n';
    });
  }
  
  return doc;
}

// Читаем JSON файл
const jsonContent = JSON.parse(fs.readFileSync(docsJsonPath, 'utf8'));

// Генерируем документацию
let apiContent = `# Deep API Reference

## Overview

Deep is a powerful semantic computing framework that enables the creation and manipulation of semantic graphs.
This API documentation covers the core functionality of the Deep framework.

## Installation

\`\`\`bash
npm install @deep-foundation/deep
\`\`\`

## API Documentation

`;

// Находим все классы в документации
jsonContent.children.forEach((child: TypeDocJson) => {
  if (child.kindString === 'Class') {
    apiContent += generateClassDoc(child);
  }
});

// Записываем итоговый API.md
fs.writeFileSync(apiMdPath, apiContent);

console.log('API documentation has been generated successfully!');
