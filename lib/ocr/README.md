# OCR (Optical Character Recognition) for Tax Forms

Auto-extract data from tax document images (W-2, 1099-INT, 1099-DIV) using Tesseract.js.

## Features

- Upload photos or PDFs of tax documents
- Automatic text extraction via OCR
- Pattern matching to extract specific fields
- Pre-fill forms with extracted data
- Review and edit before saving

## Supported Forms

- **W-2**: Employer, EIN, wages, withholding (boxes 1-6)
- **1099-INT**: Payer, interest income
- **1099-DIV**: Payer, ordinary dividends, qualified dividends

## Usage

OCR upload buttons are integrated into each form:
1. Click "Upload Document"
2. Select image (JPG, PNG) or PDF
3. Click "Extract Data"
4. Review extracted data
5. Edit any incorrect fields
6. Save

## How It Works

### 1. OCR Engine (`ocr-engine.ts`)
Wrapper around Tesseract.js for text extraction.

```typescript
import { extractText } from './ocr-engine';

const { text, confidence } = await extractText(imageFile);
```

### 2. Extractors (`extractors/`)
Form-specific pattern matching to extract structured data.

**W-2 Extractor:**
```typescript
import { extractW2Data } from './extractors/w2-extractor';

const w2Data = await extractW2Data(imageFile);
// Returns: { employer, ein, wages, federalTaxWithheld, ... }
```

**1099-INT Extractor:**
```typescript
import { extract1099INTData } from './extractors/1099-int-extractor';

const intData = await extract1099INTData(imageFile);
// Returns: { payer, amount }
```

## Extraction Accuracy

- **Printed forms**: ~80-90% accuracy
- **Phone photos**: ~60-80% (varies by image quality)
- **Handwritten**: Not supported

## Tips for Best Results

1. **Good lighting**: Take photos in bright, even lighting
2. **Flat document**: Avoid wrinkles, folds, or shadows
3. **Full frame**: Capture the entire form
4. **Focus**: Make sure text is sharp and clear
5. **Contrast**: White paper on dark surface works best

## Limitations

- Tesseract.js is client-side (slower than server OCR)
- Processing time: 5-15 seconds per document
- Handwritten forms not supported
- Complex layouts may reduce accuracy

## Future Improvements

- [ ] Google Cloud Vision API integration (better accuracy)
- [ ] AWS Textract integration (form-aware extraction)
- [ ] Support for Schedule C, Schedule D
- [ ] Batch upload (multiple documents at once)
- [ ] Confidence scores per field
- [ ] Manual region selection for problem areas

## Dependencies

- `tesseract.js`: ^5.0.0 - OCR engine

## Testing

Use sample IRS forms for testing:
- Download from https://www.irs.gov/forms-pubs
- Or use test images in `/public/test-docs/`

## Troubleshooting

**"Failed to extract text from image"**
- Check image format (JPG, PNG, PDF supported)
- Ensure image is not corrupted
- Try re-taking photo with better lighting

**Low accuracy / missing fields**
- Improve image quality
- Ensure document is flat and fully visible
- Try uploading a PDF instead of photo

**Slow performance**
- Tesseract.js runs in browser (no server cost, but slower)
- Typical processing: 5-15 seconds
- Consider server-side OCR for production
