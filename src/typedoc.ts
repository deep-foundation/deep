import * as fs from 'fs';
import * as path from 'path';

interface TypeDocJson {
  id: number;
  name: string;
  kind: number;
  kindString?: string;
  variant?: string;
  flags?: any;
  children?: TypeDocJson[];
  signatures?: TypeDocJson[];
  parameters?: TypeDocJson[];
  type?: any;
  comment?: {
    shortText?: string;
    text?: string;
    returns?: string;
    summary?: Array<{
      kind: string;
      text: string;
    }>;
    tags?: Array<{
      tag: string;
      text: string;
    }>;
  };
}

function getCommentText(comment?: TypeDocJson['comment']): string {
  if (!comment) return '';
  
  let text = '';
  
  if (comment.summary) {
    text += comment.summary.map(part => part.text).join('') + '\n\n';
  }
  
  if (comment.shortText) {
    text += comment.shortText + '\n\n';
  }
  
  if (comment.text) {
    text += comment.text + '\n\n';
  }
  
  if (comment.returns) {
    text += `**Returns:** ${comment.returns}\n\n`;
  }
  
  if (comment.tags) {
    comment.tags.forEach(tag => {
      if (tag.tag === 'example') {
        text += '**Example:**\n```typescript\n' + tag.text + '\n```\n\n';
      } else {
        text += `**@${tag.tag}** ${tag.text}\n\n`;
      }
    });
  }
  
  return text;
}

function generatePropertyDoc(property: TypeDocJson): string {
  let doc = `### ${property.name}\n\n`;
  
  doc += getCommentText(property.comment);

  if (property.type) {
    doc += `**Type:** \`${formatType(property.type)}\`\n\n`;
  }

  if (property.flags && property.flags.isOptional) {
    doc += '**Optional**\n\n';
  }

  return doc;
}

function generateMethodDoc(method: TypeDocJson): string {
  let doc = `### ${method.name}\n\n`;
  
  if (method.signatures && method.signatures[0]) {
    const signature = method.signatures[0];
    
    doc += getCommentText(signature.comment);
    
    // Add method signature
    doc += '```typescript\n';
    doc += formatMethodSignature(signature);
    doc += '\n```\n\n';

    // Add parameter descriptions
    if (signature.parameters && signature.parameters.length > 0) {
      doc += '**Parameters:**\n\n';
      signature.parameters.forEach(param => {
        doc += `- \`${param.name}\` (\`${formatType(param.type)}\`)`;
        if (param.comment) {
          doc += `: ${param.comment.text || param.comment.shortText || ''}`;
        }
        doc += '\n';
      });
      doc += '\n';
    }
  }

  return doc;
}

function formatType(type: any): string {
  if (typeof type === 'string') return type;
  if (type.type === 'reference') return type.name;
  if (type.type === 'reflection') {
    if (type.declaration && type.declaration.signatures) {
      const sig = type.declaration.signatures[0];
      const params = sig.parameters || [];
      const paramTypes = params.map((p: any) => `${p.name}: ${formatType(p.type)}`).join(', ');
      const returnType = sig.type ? formatType(sig.type) : 'void';
      return `(${paramTypes}) => ${returnType}`;
    }
    return 'object';
  }
  if (type.type === 'array') return `${formatType(type.elementType)}[]`;
  if (type.type === 'union') return type.types.map((t: any) => formatType(t)).join(' | ');
  if (type.type === 'intersection') return type.types.map((t: any) => formatType(t)).join(' & ');
  if (type.name) return type.name;
  if (type.types) return type.types.map(formatType).join(' | ');
  return 'any';
}

function formatMethodSignature(signature: TypeDocJson): string {
  const parameters = signature.parameters || [];
  const paramStr = parameters
    .map(p => {
      let str = p.name;
      if (p.flags && p.flags.isOptional) str += '?';
      str += ': ' + formatType(p.type);
      return str;
    })
    .join(', ');
  const returnType = signature.type ? `: ${formatType(signature.type)}` : '';
  return `${signature.name}(${paramStr})${returnType}`;
}

function generateClassDoc(classData: TypeDocJson): string {
  let doc = `## ${classData.name}\n\n`;
  
  doc += getCommentText(classData.comment);

  // Add constructor
  const constructor = classData.children?.find(child => 
    child.kindString === 'Constructor' || child.kind === 512
  );
  if (constructor && constructor.signatures) {
    doc += '### Constructor\n\n';
    doc += '```typescript\n';
    doc += `constructor${formatMethodSignature(constructor.signatures[0])}\n`;
    doc += '```\n\n';
    
    doc += getCommentText(constructor.signatures[0].comment);
  }

  // Group members by kind
  const properties = classData.children?.filter(child => 
    child.kindString === 'Property' || child.kind === 1024 || child.kind === 262144
  ) || [];
  const methods = classData.children?.filter(child => 
    child.kindString === 'Method' || child.kind === 2048
  ) || [];

  // Sort members alphabetically
  properties.sort((a, b) => a.name.localeCompare(b.name));
  methods.sort((a, b) => a.name.localeCompare(b.name));

  if (properties.length > 0) {
    doc += '### Properties\n\n';
    properties.forEach(prop => {
      doc += generatePropertyDoc(prop);
    });
  }

  if (methods.length > 0) {
    doc += '### Methods\n\n';
    methods.forEach(method => {
      doc += generateMethodDoc(method);
    });
  }

  return doc;
}

async function main() {
  try {
    const jsonPath = path.join(process.cwd(), 'typedoc', 'documentation.json');
    const apiPath = path.join(process.cwd(), 'API.md');
    
    const jsonContent = await fs.promises.readFile(jsonPath, 'utf8');
    const documentation = JSON.parse(jsonContent);

    let apiContent = '# Deep API Reference\n\n';
    apiContent += '## Overview\n\n';
    apiContent += 'Deep is a powerful semantic computing framework that enables the creation and manipulation of semantic graphs.\n';
    apiContent += 'This API documentation covers the core functionality of the Deep framework.\n\n';
    
    apiContent += '## Installation\n\n';
    apiContent += '```bash\n';
    apiContent += 'npm install @deep-foundation/deep\n';
    apiContent += '```\n\n';
    
    apiContent += '## Table of Contents\n\n';
    
    // Generate table of contents
    const classes = documentation.children?.filter(child => 
      child.kindString === 'Class' || child.kind === 128
    ) || [];
    
    classes.sort((a, b) => a.name.localeCompare(b.name));
    
    classes.forEach(classData => {
      apiContent += `- [${classData.name}](#${classData.name.toLowerCase()})\n`;
    });
    
    apiContent += '\n## API Documentation\n\n';

    // Generate documentation for each class
    classes.forEach(child => {
      apiContent += generateClassDoc(child);
    });

    await fs.promises.writeFile(apiPath, apiContent);
    console.log('API documentation has been generated successfully!');
  } catch (error) {
    console.error('Error generating documentation:', error);
    process.exit(1);
  }
}

main();
