import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { IGenerateSpecRepository } from '../repositories/generate-spec/generate-spec.repository.interface';
import { GeneratedSpecEntity } from 'src/entities/generated-spec.entity';
import { SpecStatusCode } from 'src/types/spec-status-code.enum';

const MARGIN_PT = 40;
const COLOR_MUTED = '#6B7280';
const COLOR_BODY = '#111827';
const COLOR_SECTION_TITLE = '#1D4ED8';
const PLACEHOLDER = 'Not mentioned in the provided information (MOM)';

@Injectable()
export class SpecExportService {
  constructor(
    private readonly generateSpecRepository: IGenerateSpecRepository,
  ) {}

  async generatePdf(specId: string): Promise<Buffer> {
    const spec = await this.loadSpecForExport(specId);
    const doc = new PDFDocument({
      size: 'A4',
      margin: MARGIN_PT,
    });

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      try {
        this.renderPdf(doc, spec);
        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    return buffer;
  }

  private async loadSpecForExport(
    specId: string,
  ): Promise<GeneratedSpecEntity> {
    const spec = await this.generateSpecRepository.findByIdForExport(specId);
    if (!spec) {
      throw new NotFoundException('Spec not found');
    }

    const code = spec.status?.code as SpecStatusCode | undefined;
    if (
      code === SpecStatusCode.PENDING ||
      code === SpecStatusCode.PROCESSING ||
      code === SpecStatusCode.FAILED
    ) {
      throw new BadRequestException('Spec is not ready for export');
    }

    return spec;
  }

  private renderPdf(doc: PDFKit.PDFDocument, spec: GeneratedSpecEntity): void {
    const contentWidth = this.contentWidth(doc);

    doc.font('Helvetica-Bold').fontSize(20).fillColor('#000000');
    doc.text(spec.mainSpec.name, {
      width: contentWidth,
      align: 'left',
    });

    const description = spec.mainSpec.description?.trim();
    if (description) {
      doc.moveDown(0.35);
      doc
        .font('Helvetica-Oblique')
        .fontSize(11)
        .fillColor(COLOR_MUTED)
        .text(description, { width: contentWidth, align: 'left' });
    }

    doc.moveDown(0.5);
    const metaParts = [
      `Template: ${spec.templateVersion.name}`,
      `Language: ${spec.language.name}`,
      `Version: v${spec.version}`,
      `Generated: ${this.formatGeneratedDate(spec.createdOn)}`,
    ];
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLOR_MUTED)
      .text(metaParts.join('  |  '), { width: contentWidth, align: 'left' });

    doc.moveDown(0.6);
    const lineY = doc.y;
    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    doc
      .moveTo(left, lineY)
      .lineTo(right, lineY)
      .strokeColor('#D1D5DB')
      .lineWidth(0.75)
      .stroke();

    doc.moveDown(1.2);

    const sections = [...(spec.generatedSpecSections ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );

    sections.forEach((section, index) => {
      const title =
        section.templateSection?.title?.trim() || 'Untitled section';
      const heading = `${index + 1}. ${title}`;

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(COLOR_SECTION_TITLE)
        .text(heading, { width: contentWidth, align: 'left' });

      doc.moveDown(0.35);

      const detail = section.detail?.trim();
      if (!detail) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(11)
          .fillColor(COLOR_MUTED)
          .text(PLACEHOLDER, { width: contentWidth, align: 'left' });
      } else {
        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor(COLOR_BODY)
          .text(detail, { width: contentWidth, align: 'left' });
      }

      if (index < sections.length - 1) {
        doc.moveDown(1.25);
      }
    });
  }

  private contentWidth(doc: PDFKit.PDFDocument): number {
    return doc.page.width - doc.page.margins.left - doc.page.margins.right;
  }

  private formatGeneratedDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
