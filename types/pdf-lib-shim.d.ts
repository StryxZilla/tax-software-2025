declare module 'pdf-lib' {
  export type RGB = { r: number; g: number; b: number };
  export function rgb(r: number, g: number, b: number): RGB;

  export const StandardFonts: {
    Helvetica: string;
    HelveticaBold: string;
  };

  export class PDFPage {
    getSize(): { width: number; height: number };
    drawText(text: string, options: Record<string, unknown>): void;
    drawLine(options: Record<string, unknown>): void;
    drawRectangle(options: Record<string, unknown>): void;
  }

  export class PDFDocument {
    static create(): Promise<PDFDocument>;
    static load(data: Uint8Array): Promise<PDFDocument>;
    addPage(sizeOrPage?: [number, number] | PDFPage): PDFPage;
    getPageIndices(): number[];
    copyPages(srcDoc: PDFDocument, indices: number[]): Promise<PDFPage[]>;
    embedFont(fontName: string): Promise<unknown>;
    save(): Promise<Uint8Array>;
  }
}
