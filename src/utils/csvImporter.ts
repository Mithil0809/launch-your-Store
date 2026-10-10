import Papa from 'papaparse';
import { Product, ImportRowError } from '../types/store';

export interface ColumnMapping {
  name: string;
  description: string;
  price: string;
  sku: string;
  category: string;
  stock: string;
  imageUrl: string;
  compareAtPrice?: string;
  variants?: string;
}

export const STANDARD_COLUMNS = [
  { key: 'name', label: 'Product Name', required: true, aliases: ['name', 'title', 'product name', 'item'] },
  { key: 'description', label: 'Description', required: false, aliases: ['description', 'desc', 'details', 'body'] },
  { key: 'price', label: 'Price', required: true, aliases: ['price', 'retail price', 'unit price', 'cost'] },
  { key: 'sku', label: 'SKU', required: true, aliases: ['sku', 'item code', 'product code', 'barcode'] },
  { key: 'category', label: 'Category', required: true, aliases: ['category', 'department', 'type', 'group'] },
  { key: 'stock', label: 'Stock / Inventory', required: true, aliases: ['stock', 'inventory', 'qty', 'quantity', 'stock quantity'] },
  { key: 'imageUrl', label: 'Image URL', required: false, aliases: ['image', 'image url', 'photo', 'picture', 'images'] },
  { key: 'compareAtPrice', label: 'Compare at Price', required: false, aliases: ['compare at price', 'msrp', 'original price'] },
  { key: 'variants', label: 'Variants (e.g. Size:S,M,L)', required: false, aliases: ['variants', 'options', 'sizes', 'variant'] },
];

export function autoDetectColumnMappings(headers: string[]): ColumnMapping {
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  const mapping: any = {};

  STANDARD_COLUMNS.forEach(col => {
    const matchIdx = normalizedHeaders.findIndex(h =>
      col.aliases.some(alias => h === alias || h.includes(alias))
    );
    if (matchIdx !== -1) {
      mapping[col.key] = headers[matchIdx];
    } else {
      mapping[col.key] = '';
    }
  });

  return mapping as ColumnMapping;
}

export function generateCSVTemplate(): string {
  const sampleRows = [
    {
      'Product Name': 'Artisanal Ceramic Pour-Over Dripper',
      'Description': 'Handmade stoneware coffee dripper with spiral ribbed interior for optimal extraction flow.',
      'Price': '38.00',
      'Compare At Price': '45.00',
      'SKU': 'DRP-CRM-001',
      'Category': 'Home and Living',
      'Stock Quantity': '25',
      'Image URL': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'Variants': 'Color:Speckled Cream,Matte Black',
    },
    {
      'Product Name': 'Single Origin Natural Process Geisha Beans',
      'Description': 'Panama Geisha light roast with floral jasmine aromas and honeysuckle sweetness.',
      'Price': '42.00',
      'Compare At Price': '',
      'SKU': 'COF-GSH-002',
      'Category': 'Grocery and Food',
      'Stock Quantity': '40',
      'Image URL': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
      'Variants': 'Grind:Whole Bean,Filter',
    },
    {
      'Product Name': 'Heavy Brass Desk Ruler 30cm',
      'Description': 'Solid unlacquered raw brass architectural metric and imperial ruler.',
      'Price': '29.50',
      'Compare At Price': '34.00',
      'SKU': 'STN-RLR-003',
      'Category': 'Books and Stationery',
      'Stock Quantity': '18',
      'Image URL': 'https://images.unsplash.com/photo-1585336261026-7f416301fa38?auto=format&fit=crop&w=800&q=80',
      'Variants': '',
    },
  ];

  return Papa.unparse(sampleRows);
}

export function downloadTemplateFile() {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'launchyourstore_product_template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadErrorReport(errors: ImportRowError[]) {
  const csvContent = Papa.unparse(
    errors.map(err => ({
      'Row Number': err.row,
      'Field': err.field,
      'Original Value': err.originalValue || '',
      'Error Reason': err.error,
      'Suggested Correction': err.suggestedCorrection,
    }))
  );
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'import_validation_errors.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportProductsToCSV(products: Product[], storeName: string) {
  const exportData = products.map(p => ({
    'Name': p.name,
    'SKU': p.sku,
    'Category': p.category,
    'Price': p.price,
    'Compare At Price': p.compareAtPrice || '',
    'Stock': p.stockQuantity,
    'Low Stock Alert': p.lowStockThreshold,
    'Status': p.isPublished ? 'Published' : 'Draft',
    'Description': p.description,
    'Image URL': p.images[0] || '',
  }));

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${storeName.toLowerCase().replace(/\s+/g, '_')}_catalog_export.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface ValidationResult {
  validProducts: Product[];
  invalidRows: { rowNumber: number; row: any; errors: ImportRowError[] }[];
  duplicateSKUs: { sku: string; rows: number[] }[];
  allErrors: ImportRowError[];
}

export function validateAndParseRows(
  rows: any[],
  mapping: ColumnMapping,
  storeId: string,
  existingProducts: Product[] = []
): ValidationResult {
  const validProducts: Product[] = [];
  const invalidRows: { rowNumber: number; row: any; errors: ImportRowError[] }[] = [];
  const allErrors: ImportRowError[] = [];
  const seenSKUsInFile: Map<string, number[]> = new Map();
  const existingSKUSet = new Set(existingProducts.map(p => p.sku.toLowerCase()));
  const duplicateSKUs: { sku: string; rows: number[] }[] = [];

  rows.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1
    const rowErrors: ImportRowError[] = [];

    const name = String(row[mapping.name] || '').trim();
    const rawPrice = String(row[mapping.price] || '').replace(/[^0-9.]/g, '');
    const price = parseFloat(rawPrice);
    const sku = String(row[mapping.sku] || '').trim();
    const category = String(row[mapping.category] || '').trim();
    const rawStock = String(row[mapping.stock] || '').replace(/[^0-9]/g, '');
    const stock = parseInt(rawStock, 10);
    const description = String(row[mapping.description] || '').trim();
    const imageUrl = String(row[mapping.imageUrl] || '').trim();
    const compareAtRaw = mapping.compareAtPrice ? String(row[mapping.compareAtPrice] || '').replace(/[^0-9.]/g, '') : '';
    const compareAtPrice = compareAtRaw ? parseFloat(compareAtRaw) : undefined;

    // Validate Name
    if (!name) {
      rowErrors.push({
        row: rowNum,
        field: 'Product Name',
        error: 'Product name is required',
        suggestedCorrection: 'Enter a valid product title (e.g. "Ceramic Mug")',
        originalValue: row[mapping.name],
      });
    }

    // Validate Price
    if (isNaN(price) || price < 0) {
      rowErrors.push({
        row: rowNum,
        field: 'Price',
        error: 'Price must be a positive number',
        suggestedCorrection: 'Specify a valid monetary amount like 24.50',
        originalValue: row[mapping.price],
      });
    }

    // Validate SKU
    if (!sku) {
      rowErrors.push({
        row: rowNum,
        field: 'SKU',
        error: 'SKU is required and cannot be empty',
        suggestedCorrection: 'Assign a unique inventory code like "PROD-001"',
        originalValue: row[mapping.sku],
      });
    } else {
      const lowerSku = sku.toLowerCase();
      // Track file duplicate
      if (seenSKUsInFile.has(lowerSku)) {
        seenSKUsInFile.get(lowerSku)!.push(rowNum);
      } else {
        seenSKUsInFile.set(lowerSku, [rowNum]);
      }

      // Check existing store duplicate
      if (existingSKUSet.has(lowerSku)) {
        rowErrors.push({
          row: rowNum,
          field: 'SKU',
          error: `SKU "${sku}" already exists in store catalog`,
          suggestedCorrection: 'Use a unique SKU or choose to overwrite existing products',
          originalValue: sku,
        });
      }
    }

    // Validate Category
    if (!category) {
      rowErrors.push({
        row: rowNum,
        field: 'Category',
        error: 'Category is required',
        suggestedCorrection: 'Enter a department name like "Home and Living"',
        originalValue: row[mapping.category],
      });
    }

    // Validate Stock
    if (isNaN(stock) || stock < 0) {
      rowErrors.push({
        row: rowNum,
        field: 'Stock',
        error: 'Stock quantity must be zero or a positive integer',
        suggestedCorrection: 'Enter integer units like 15 or 0',
        originalValue: row[mapping.stock],
      });
    }

    if (rowErrors.length > 0) {
      invalidRows.push({ rowNumber: rowNum, row, errors: rowErrors });
      allErrors.push(...rowErrors);
    } else {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      validProducts.push({
        id: `prod-imp-${Date.now()}-${index}`,
        storeId,
        name,
        slug,
        description: description || 'High quality craft product.',
        price,
        compareAtPrice,
        sku,
        category,
        images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
        stockQuantity: stock,
        lowStockThreshold: 5,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });

  // Collect duplicate SKUs found within the uploaded spreadsheet itself
  seenSKUsInFile.forEach((rowsList, sku) => {
    if (rowsList.length > 1) {
      duplicateSKUs.push({ sku, rows: rowsList });
    }
  });

  return { validProducts, invalidRows, duplicateSKUs, allErrors };
}
