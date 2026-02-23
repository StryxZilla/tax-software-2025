import fs from 'fs';
import path from 'path';

const formsDir = 'components/forms';
const files = fs.readdirSync(formsDir).filter(f => f.endsWith('.tsx') && f !== 'W2Form.tsx');

// First, update CurrencyInput to support optional prefix
// Then transform all number inputs that handle currency values

for (const file of files) {
  const filePath = path.join(formsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('type="number"')) continue;
  
  let changed = false;
  
  // Add CurrencyInput import if not present
  if (!content.includes("CurrencyInput")) {
    // Try different import anchor points
    if (content.includes("import ValidationError")) {
      content = content.replace(
        /import ValidationError from ['"][^'"]+['"];?/,
        match => `${match}\nimport CurrencyInput from '../common/CurrencyInput';`
      );
      changed = true;
    } else if (content.includes("from 'lucide-react'")) {
      content = content.replace(
        /from 'lucide-react';/,
        match => `${match}\nimport CurrencyInput from '../common/CurrencyInput';`
      );
      changed = true;
    }
  }
  
  // Pattern 1: Dollar-prefixed inputs with div.relative wrapper
  // <div className="relative">
  //   <span ...>$</span>
  //   <input type="number" value={X || ''} onChange={...} onBlur={...} ... />
  // </div>
  const dollarWrapperPattern = /<div className="relative">\s*<span[^>]*>\$<\/span>\s*<input\s+([\s\S]*?)\s*\/>\s*<\/div>/g;
  content = content.replace(dollarWrapperPattern, (match, attrs) => {
    const result = transformInput(attrs, true);
    if (result) { changed = true; return result; }
    return match;
  });
  
  // Pattern 2: Dollar sign in a separate div (like InterestIncomeForm)
  // The dollar is in a separate div, input is adjacent
  // Just transform the <input type="number"> directly
  
  // Pattern 3: Plain <input type="number"> with parseFloat - these are currency inputs
  const plainInputPattern = /<input\s+([\s\S]*?type="number"[\s\S]*?)\s*\/>/g;
  content = content.replace(plainInputPattern, (match, attrs) => {
    // Only transform if it uses parseFloat (currency pattern)
    if (!attrs.includes('parseFloat')) return match;
    // Skip non-currency fields (like dependents count, year)
    if (attrs.includes('numberOfDependents') || attrs.includes('year') || attrs.includes('Age')) return match;
    const result = transformInput(attrs, false);
    if (result) { changed = true; return result; }
    return match;
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${file}`);
  } else {
    console.log(`Skipped: ${file} (no matching patterns)`);
  }
}

function transformInput(attrs, hasDollarPrefix) {
  // Extract value expression
  const valueMatch = attrs.match(/value=\{([^}]+)\}/);
  if (!valueMatch) return null;
  let valueExpr = valueMatch[1].trim();
  // Remove || '' or || 0
  valueExpr = valueExpr.replace(/\s*\|\|\s*(?:''|0)\s*$/, '').trim();
  
  // Extract onChange handler to get the update call
  const onChangeMatch = attrs.match(/onChange=\{[^=]*=>\s*([\s\S]*?)\}\s*(?:onBlur|min|max|step|className|placeholder)/);
  if (!onChangeMatch) return null;
  let onChangeBody = onChangeMatch[1].trim();
  // Transform parseFloat(e.target.value) || 0 -> v
  onChangeBody = onChangeBody.replace(/parseFloat\([^)]+\)\s*\|\|\s*0/g, 'v');
  // Clean trailing }
  if (onChangeBody.endsWith('}')) onChangeBody = onChangeBody.slice(0, -1).trim();
  
  // Extract onBlur
  const onBlurMatch = attrs.match(/onBlur=\{([^}]+)\}/);
  const onBlurExpr = onBlurMatch ? onBlurMatch[1].trim() : null;
  
  // Extract ref
  const refMatch = attrs.match(/ref=\{([^}]+)\}/);
  
  // Extract className for error detection
  const classMatch = attrs.match(/className=\{([^}]+)\}/);
  let hasErrorExpr = null;
  if (classMatch) {
    const classExpr = classMatch[1];
    const errorFieldMatch = classExpr.match(/getInputClassName\(['"]([^'"]+)['"]\)/);
    if (errorFieldMatch) {
      hasErrorExpr = `!!getFieldError('${errorFieldMatch[1]}')`;
    }
  }
  
  // Extract touchField name from onBlur
  let touchFieldName = null;
  if (onBlurExpr) {
    const touchMatch = onBlurExpr.match(/touchField\(['"]([^'"]+)['"]\)/);
    if (touchMatch) touchFieldName = touchMatch[1];
  }
  
  // Build CurrencyInput
  let parts = [];
  if (refMatch) parts.push(`ref={${refMatch[1]}}`);
  parts.push(`value={${valueExpr}}`);
  parts.push(`onValueChange={(v) => ${onChangeBody}}`);
  if (onBlurExpr) parts.push(`onBlur={${onBlurExpr}}`);
  if (hasErrorExpr) parts.push(`hasError={${hasErrorExpr}}`);
  if (!hasDollarPrefix) parts.push(`showPrefix={false}`);
  
  const indent = '                ';
  return `<CurrencyInput\n${parts.map(p => indent + p).join('\n')}\n${indent.slice(2)}/>`;
}

console.log('\nDone. Run typecheck to verify.');
