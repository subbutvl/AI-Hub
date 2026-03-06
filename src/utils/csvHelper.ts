
export function exportToCsv<T>(data: T[], filename: string) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0] as object);
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => {
      let value = (row as any)[fieldName];
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }

      // Handle objects/arrays by stringifying
      if (typeof value === 'object') {
         value = JSON.stringify(value);
      }
      
      // Convert to string
      const stringValue = String(value);

      // Escape quotes and wrap in quotes if it contains comma, quote or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function parseCsv<T>(csvText: string): T[] {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const result: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i];
    const values: string[] = [];
    let inQuote = false;
    let currentValue = '';
    
    for (let j = 0; j < currentLine.length; j++) {
        const char = currentLine[j];
        if (char === '"') {
            // Check for escaped quote ("")
            if (inQuote && currentLine[j+1] === '"') {
                currentValue += '"';
                j++; // Skip next quote
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            values.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    values.push(currentValue); // Last value

    const obj: any = {};
    headers.forEach((header, index) => {
        let val = values[index]?.trim();
        
        // Try to parse JSON if it looks like an array/object
        // This is a heuristic and might need adjustment based on actual data
        if (val && (val.startsWith('[') || val.startsWith('{'))) {
             try {
                 val = JSON.parse(val);
             } catch (e) {
                 // ignore, keep as string
             }
        } else if (val === 'true') {
            val = true as any;
        } else if (val === 'false') {
            val = false as any;
        } else if (!isNaN(Number(val)) && val !== '') {
            // Check if it's a number (careful with IDs that look like numbers but should be strings? 
            // Usually IDs in JSON are numbers if they are numbers.
            val = Number(val) as any;
        }
        
        obj[header] = val;
    });
    result.push(obj);
  }
  
  return result;
}
