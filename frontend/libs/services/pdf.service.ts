import { Injectable } from '@angular/core';
import { Invoice, InvoiceLine } from '../models/invoice.model';
import { Application } from '../models/application.model';
import { Client } from '../models/client.model';
import { Operation } from '../models/operation.model';

type RGB = [number, number, number];

@Injectable({ providedIn: 'root' })
export class PdfService {

  // ─── Invoice PDF ─────────────────────────────────────────────────────────────
  async generateInvoicePdf(
    invoice: Invoice,
    lines: InvoiceLine[],
    app: Application
  ): Promise<Blob> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const W = 210, H = 297;
    const ML = 12, MR = 12;
    const CW = W - ML - MR; // 186 mm

    const BLACK:    RGB = [26,  26,  26];
    const BODY:     RGB = [28,  31,  44];
    const MUTED:    RGB = [107, 107, 107];
    const RED:      RGB = [230, 57,  70];
    const BLUEBG:   RGB = [232, 233, 239];
    const TABLEHDR: RGB = [37,  40,  56];
    const DIVIDER:  RGB = [229, 231, 235];
    const WHITE:    RGB = [255, 255, 255];

    const f  = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
    const d  = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
    const tc = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

    const client = invoice.client_id as Client;

    // ── HEADER ───────────────────────────────────────────────────
    // Pre-load logo so it can be redrawn on every continuation page
    const logoUrl = app.logo || 'assets/defaultImages/logo.png';
    let logoImgData = '', logoFmt = 'PNG';
    let logoDrawX = 0, logoDrawY = 0, logoDrawW = 0, logoDrawH = 0, logoLoaded = false;
    try {
      logoImgData = await this.loadImageBase64(logoUrl);
      logoFmt = logoUrl.toLowerCase().includes('.png') ? 'PNG' : 'JPEG';
      const dims = await this.getImageDimensions(logoUrl);
      const maxW = 46, maxH = 28;
      const ratio = Math.min(maxW / dims.w, maxH / dims.h);
      logoDrawW = dims.w * ratio;
      logoDrawH = dims.h * ratio;
      logoDrawX = ML + (maxW - logoDrawW) / 2;
      logoDrawY = 12 + (maxH - logoDrawH) / 2;
      logoLoaded = true;
    } catch { /* drawLogoFallback used below */ }

    // Client info box — pre-compute wrapped text once
    const CLB_X = 118, CLB_Y = 10, CLB_W = 80;
    const TX = CLB_X + 4;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    const nameParts: string[]    = doc.splitTextToSize((client?.name || '').toUpperCase(), CLB_W - 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const companyParts: string[] = client?.company ? doc.splitTextToSize(client.company.toUpperCase(), CLB_W - 8) : [];
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const addrParts: string[]    = client?.address ? doc.splitTextToSize(client.address, CLB_W - 8) : [];
    const cityParts: string[]    = client?.city    ? doc.splitTextToSize(client.city,    CLB_W - 8) : [];
    const emailParts: string[]   = client?.email   ? doc.splitTextToSize(client.email,   CLB_W - 8) : [];

    let contentEndY = 9 + nameParts.length * 6;
    let lastLineH = 6;
    if (companyParts.length) { contentEndY += 2 + companyParts.length * 5; lastLineH = 5; }
    if (addrParts.length)    { contentEndY += 2 + addrParts.length    * 5; lastLineH = 5; }
    if (cityParts.length)    { contentEndY += 2 + cityParts.length    * 5; lastLineH = 5; }
    if (emailParts.length)   { contentEndY += 2 + emailParts.length   * 5; lastLineH = 5; }
    const CLB_H = Math.max(28, contentEndY - lastLineH + 7);

    // Info bar — pre-compute
    const IB_Y = 57;
    const ibCellDefs: Array<{ label: string; value: string; w: number }> = [
      { label: 'NUMERO',            value: invoice.numero,                                     w: 28 },
      { label: 'DATE',              value: new Date(invoice.date).toLocaleDateString('fr-MA'), w: 30 },
      { label: 'MODE DE REGLEMENT', value: invoice.payment_mode || '',                         w: 50 },
      { label: 'CODE CLIENT',       value: invoice.code_client || '',                          w: 32 },
      { label: 'I.C.E',             value: client?.ice || '',                                  w: 46 },
    ];
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    const ibCells = ibCellDefs.map(c => ({
      ...c,
      lines: doc.splitTextToSize(c.value, c.w - 6) as string[],
    }));
    const maxLines = Math.max(...ibCells.map(c => c.lines.length));
    const IB_H = 8.5 + maxLines * 5 + 3.5;

    // ── TABLE constants ───────────────────────────────────────────
    const TY = IB_Y + IB_H + 5;
    const isFacture = invoice.type === 'facture';

    const C_REF   = ML;
    const C_DESC  = ML + 22;
    const C_QTY   = ML + 99;
    const C_PU    = ML + 140;
    const C_TOTAL = W - MR - 4;

    // ── drawPageHeader: repeated on every page ───────────────────
    const drawPageHeader = () => {
      if (logoLoaded) {
        doc.addImage(logoImgData, logoFmt, logoDrawX, logoDrawY, logoDrawW, logoDrawH);
      } else {
        this.drawLogoFallback(doc, ML, BLACK);
      }

      // Client box
      f(WHITE); d(BLACK); doc.setLineWidth(0.5);
      doc.rect(CLB_X, CLB_Y, CLB_W, CLB_H, 'FD');
      let clbY = CLB_Y + 9;
      tc(BLACK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      for (const part of nameParts) { doc.text(part, TX, clbY); clbY += 6; }
      if (companyParts.length) {
        clbY += 2; doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
        for (const part of companyParts) { doc.text(part, TX, clbY); clbY += 5; }
      }
      if (addrParts.length) {
        clbY += 2; doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        for (const part of addrParts) { doc.text(part, TX, clbY); clbY += 5; }
      }
      if (cityParts.length) {
        clbY += 2; doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        for (const part of cityParts) { doc.text(part, TX, clbY); clbY += 5; }
      }
      if (emailParts.length) {
        clbY += 2; tc(MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        for (const part of emailParts) { doc.text(part, TX, clbY); clbY += 5; }
      }

      // Title
      tc(BLACK); doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
      doc.text(invoice.type === 'facture' ? 'FACTURE' : 'FACTURE PROFORMA', ML, 52);

      // Info bar
      d(BLACK); doc.setLineWidth(0.5);
      doc.rect(ML, IB_Y, CW, IB_H, 'D');
      let ibX = ML;
      for (let i = 0; i < ibCells.length; i++) {
        if (i > 0) { d(BLACK); doc.setLineWidth(0.4); doc.line(ibX, IB_Y, ibX, IB_Y + IB_H); }
        tc(MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
        doc.setCharSpace(0.3);
        doc.text(ibCells[i].label, ibX + 3, IB_Y + 5.5);
        doc.setCharSpace(0);
        tc(BLACK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        let valY = IB_Y + 12.5;
        for (const ln of ibCells[i].lines) { doc.text(ln, ibX + 3, valY); valY += 5; }
        ibX += ibCells[i].w;
      }

      // Table header row
      f(TABLEHDR); doc.rect(ML, TY, CW, 8, 'F');
      tc(WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      doc.setCharSpace(0.5);
      doc.text('RÉFÉRENCE',   C_REF  + 2, TY + 5.5);
      doc.text('DÉSIGNATION', C_DESC + 2, TY + 5.5);
      doc.setCharSpace(0);
      doc.text('QUANTITÉ',   C_QTY,   TY + 5.5, { align: 'center' });
      doc.text('PRIX U. HT', C_PU,    TY + 5.5, { align: 'right'  });
      doc.text('TOTAL HT',   C_TOTAL, TY + 5.5, { align: 'right'  });
    };

    drawPageHeader();
    let ry = TY + 8;

    for (const line of lines) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      const parts = doc.splitTextToSize(line.designation, 68);
      const rowH  = 10 + (parts.length - 1) * 5;
      const totalRowH = rowH + (!isFacture && line.discount_pct > 0 ? 8 : 0);

      if (ry + totalRowH > H - 25) { doc.addPage(); drawPageHeader(); ry = TY + 8; }

      d(DIVIDER); doc.setLineWidth(0.3);
      doc.line(ML, ry + rowH, W - MR, ry + rowH);

      // Ref
      tc(MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text(line.ref || '', C_REF + 2, ry + 6.5);

      // Designation — all lines same bold style
      tc(BODY); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      for (let p = 0; p < parts.length; p++) {
        doc.text(parts[p], C_DESC + 2, ry + 6.5 + p * 5);
      }

      // Qty
      tc(BODY); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      doc.text(String(line.quantity), C_QTY, ry + 6.5, { align: 'center' });

      // Prix U. HT — for facture show net unit price (after discount), for proforma show gross
      const displayUnitPrice = isFacture && line.discount_pct > 0
        ? line.line_total_ht / line.quantity
        : line.unit_price_ht;
      doc.text(this.fmtNum(displayUnitPrice), C_PU, ry + 6.5, { align: 'right' });

      // Total HT
      tc(BODY); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text(this.fmtNum(line.line_total_ht), C_TOTAL, ry + 6.5, { align: 'right' });

      ry += rowH;

      // Remise sub-row — inline below the product line, proforma only
      if (!isFacture && line.discount_pct > 0) {
        const remH = 8;
        d(DIVIDER); doc.setLineWidth(0.3);
        doc.line(ML, ry + remH, W - MR, ry + remH);
        tc(MUTED); doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
        doc.text(`Remise ${Math.round(line.discount_pct * 100)}%`, C_DESC + 2, ry + 5.5);
        tc(RED); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        doc.text(`- ${this.fmtNum(line.discount_amount)}`, C_TOTAL, ry + 5.5, { align: 'right' });
        ry += remH;
      }
    }

    ry += 6;

    // Enforce minimum table bottom so conditions section sits ~2/3 down the page
    const TABLE_MIN_BOTTOM_Y = 190;
    if (ry < TABLE_MIN_BOTTOM_Y) ry = TABLE_MIN_BOTTOM_Y;

    if (ry > H - 80) { doc.addPage(); ry = 20; }
    d(BLACK); doc.setLineWidth(1.2);
    doc.line(ML, ry, W - MR, ry);
    ry += 6;

    // ── ROW 1: AMOUNT IN WORDS (left) + TOTALS (right) ──────────
    const condW = 104, gap = 6;
    const totX  = ML + condW + gap;
    const totW  = W - MR - totX;
    const secY  = ry;

    const totPad  = 3;
    const totRowH = 8;
    const ttcRowH = 11;
    const totH    = totPad + totRowH + totRowH + 1 + ttcRowH + totPad;

    // Amount in words box (same height as totals)
    const amountInWords = this.numToWordsFr(invoice.total_ttc);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const amtWrapped: string[] = doc.splitTextToSize(amountInWords, condW - 8);

    f(BLUEBG); d(DIVIDER); doc.setLineWidth(0.4);
    doc.rect(ML, secY, condW, totH, 'FD');
    tc(MUTED); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5);
    doc.setCharSpace(0.4);
    doc.text('ARRETE A LA SOMME DE', ML + 4, secY + 6);
    doc.setCharSpace(0);
    tc(BODY); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
    for (let i = 0; i < amtWrapped.length; i++) {
      doc.text(amtWrapped[i], ML + 4, secY + 13 + i * 6);
    }

    // Totals block
    f(BLUEBG); doc.rect(totX, secY, totW, totH, 'F');

    const totLX = totX + totPad + 2;
    const totRX = totX + totW - totPad;

    const htY = secY + totPad + totRowH - 2;
    tc(BODY); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text('Total H.T', totLX, htY);
    doc.setFont('helvetica', 'normal');
    doc.text(this.fmtNum(invoice.total_ht), totRX, htY, { align: 'right' });

    const tvaY2 = htY + totRowH;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.text(`TVA ${Math.round(invoice.tva_rate * 100)}%`, totLX, tvaY2);
    doc.setFont('helvetica', 'normal');
    doc.text(this.fmtNum(invoice.tva_amount), totRX, tvaY2, { align: 'right' });

    const divY = tvaY2 + 3;
    d(DIVIDER); doc.setLineWidth(0.4);
    doc.line(totX + 2, divY, totX + totW - 2, divY);

    const ttcY = divY + ttcRowH - 2;
    tc(BLACK); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text('TOTAL T.T.C', totLX, ttcY);
    doc.text(this.fmtNum(invoice.total_ttc), totRX, ttcY, { align: 'right' });

    // ── ROW 2: CONDITIONS (left) + SIGNATURE (right) ─────────────
    const row2Y = secY + totH + 8;

    const condLines = invoice.payment_conditions
      ? invoice.payment_conditions.split('\n').map(l => l.trim()).filter(Boolean)
      : [];
    const hasConditions = condLines.length > 0 || !!invoice.notes;

    if (hasConditions) {
      tc(BODY); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
      doc.setCharSpace(0.5);
      doc.text('CONDITIONS DE PAIEMENT', ML, row2Y);
      doc.setCharSpace(0);
      let condY = row2Y + 7;
      tc(MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      for (const cl of condLines) {
        const wrapped = doc.splitTextToSize(`•  ${cl}`, condW - 4);
        doc.text(wrapped, ML, condY);
        condY += wrapped.length * 5 + 1.5;
      }
      if (invoice.notes) {
        const wrapped = doc.splitTextToSize(`•  ${invoice.notes}`, condW - 4);
        doc.text(wrapped, ML, condY);
      }
    }

    // Signature — right column, aligned with conditions label
    const sigY = row2Y;
    d(DIVIDER); doc.setLineWidth(0.4);
    doc.setLineDashPattern([1, 1.5], 0);
    doc.line(totX, sigY, totX + 60, sigY);
    doc.setLineDashPattern([], 0);
    tc(MUTED); doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
    doc.setCharSpace(0.8);
    doc.text('CACHET ET SIGNATURE', totX, sigY + 4);
    doc.setCharSpace(0);

    // ── FOOTER (all pages) ───────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);

      const fy = 275;
      d(DIVIDER); doc.setLineWidth(0.4);
      doc.line(ML, fy, W - MR, fy);

      tc(BLACK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      const cx = W / 2;

      // Line 1: company name + address
      const fl1Parts = [app.name, app.address].filter(Boolean).join('  ');
      doc.text(fl1Parts, cx, fy + 5, { align: 'center' });

      // Line 2: fiscal identifiers
      const fiscalParts: string[] = [];
      if (app.rc)   fiscalParts.push(`RC : ${app.rc}`);
      if (app.ice)  fiscalParts.push(`ICE : ${app.ice}`);
      if (app.if)   fiscalParts.push(`IF : ${app.if}`);
      if (app.cnss) fiscalParts.push(`CNSS : ${app.cnss}`);
      if (app.tp)   fiscalParts.push(`TP : ${app.tp}`);
      if (fiscalParts.length) doc.text(fiscalParts.join('  '), cx, fy + 10, { align: 'center' });

      // Line 3: bank
      if (app.bank_name && app.bank_rib) {
        doc.text(`${app.bank_name} : ${app.bank_rib}`, cx, fy + 15, { align: 'center' });
      }

      if (totalPages > 1) {
        doc.text(`${p} / ${totalPages}`, cx, H - 2, { align: 'center' });
      }
    }

    return doc.output('blob');
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private fmtNum(n: number): string {
    const [int, dec] = n.toFixed(2).split('.');
    return int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + dec;
  }

  private numToWordsFr(amount: number): string {
    const u = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
               'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
               'dix-sept', 'dix-huit', 'dix-neuf'];

    // noS=true suppresses trailing plural 's' on "quatre-vingts"/"cents" when followed by "mille"
    const say100 = (n: number, noS = false): string => {
      if (n < 20) return u[n];
      const t = Math.floor(n / 10), r = n % 10;
      if (t === 7) return r === 0 ? 'soixante-dix'
                       : r === 1 ? 'soixante et onze'
                       :           `soixante-${u[10 + r]}`;
      if (t === 8) return r === 0 ? (noS ? 'quatre-vingt' : 'quatre-vingts')
                       :             `quatre-vingt-${u[r]}`;
      if (t === 9) return `quatre-vingt-${u[10 + r]}`;
      const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'][t];
      if (r === 0) return tens;
      if (r === 1) return `${tens} et un`;
      return `${tens}-${u[r]}`;
    };

    const say1000 = (n: number, noS = false): string => {
      if (n === 0) return '';
      if (n < 100) return say100(n, noS);
      const h = Math.floor(n / 100), r = n % 100;
      const hStr = h === 1 ? 'cent' : `${u[h]} cent${r === 0 && !noS ? 's' : ''}`;
      return r === 0 ? hStr : `${hStr} ${say100(r, noS)}`;
    };

    const sayInt = (n: number): string => {
      if (n === 0) return 'zéro';
      const mil = Math.floor(n / 1_000_000);
      const th  = Math.floor((n % 1_000_000) / 1_000);
      const rem = n % 1_000;
      const parts: string[] = [];
      if (mil > 0) parts.push(mil === 1 ? 'un million' : `${say1000(mil, true)} millions`);
      if (th  > 0) parts.push(th  === 1 ? 'mille'      : `${say1000(th, true)} mille`);
      if (rem > 0) parts.push(say1000(rem));
      return parts.join(' ');
    };

    const rounded = Math.round(amount * 100);
    const dh = Math.floor(rounded / 100);
    const ct = rounded % 100;
    let result = `${sayInt(dh)} dirham${dh > 1 ? 's' : ''}`;
    if (ct > 0) result += ` et ${sayInt(ct)} centime${ct > 1 ? 's' : ''}`;
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  private drawLogoFallback(doc: any, ml: number, color: RGB): void {
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5);
    doc.text('SPECIALTY', ml + 23, 22, { align: 'center' });
    doc.text('COFFEE',    ml + 23, 27, { align: 'center' });
    doc.text('EQUIPMENT', ml + 23, 32, { align: 'center' });
  }

  private getImageDimensions(url: string): Promise<{ w: number; h: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = reject;
      img.src = url;
    });
  }

  private async loadImageBase64(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Image fetch failed');
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // ─── Operations PDF ──────────────────────────────────────────────────────────
  async generateOperationsPdf(
    operations: Operation[],
    labels: Record<string, string>
  ): Promise<Blob> {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // A4 landscape: 297×210mm
    const PW = 297, PH = 210;
    const ML = 14, MR = 14;

    type PRGB = [number, number, number];
    const BLACK:    PRGB = [26,  26,  26 ];
    const BODY:     PRGB = [28,  31,  44 ];
    const MUTED:    PRGB = [107, 107, 107];
    const GOLD:     PRGB = [212, 172, 0  ];

    const TABLEHDR: PRGB = [37,  40,  56 ];
    const STRIPE:   PRGB = [248, 245, 240];
    const DIVIDER:  PRGB = [229, 231, 235];
    const WHITE:    PRGB = [255, 255, 255];

    const pf  = (c: PRGB) => doc.setFillColor(c[0], c[1], c[2]);
    const pd  = (c: PRGB) => doc.setDrawColor(c[0], c[1], c[2]);
    const ptc = (c: PRGB) => doc.setTextColor(c[0], c[1], c[2]);

    // ── HEADER ────────────────────────────────────────────────────
    ptc(BODY); doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text(labels['title'] || 'Operations', PW / 2, 16, { align: 'center' });

    ptc(MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text(new Date().toLocaleDateString('fr-MA'), PW / 2, 23, { align: 'center' });

    // Thin gold accent line under title
    pf(GOLD); doc.rect(ML, 27, PW - ML - MR, 0.8, 'F');

    let y = 34;

    // ── TABLE HEADER ──────────────────────────────────────────────
    // Column x positions (left-edge unless noted as right-align)
    const C_DATE    = ML;          // left  14   slot ~30mm
    const C_NAME    = ML + 32;     // left  46   slot ~52mm
    const C_CTX     = ML + 86;     // left  100  slot ~60mm
    const C_MODE    = ML + 148;    // left  162  slot ~36mm
    const C_AMT     = PW - MR - 42; // RIGHT 241 slot ~38mm (203–241)
    const C_STATUS  = PW - MR - 32; // left  251 slot ~33mm (251–283)

    pf(TABLEHDR); doc.rect(ML, y, PW - ML - MR, 8, 'F');
    ptc(WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
    doc.setCharSpace(0.4);
    doc.text(labels['date']    || 'DATE',     C_DATE   + 2, y + 5.5);
    doc.text(labels['name']    || 'NOM',      C_NAME   + 2, y + 5.5);
    doc.text(labels['context'] || 'CONTEXTE', C_CTX    + 2, y + 5.5);
    doc.text(labels['mode']    || 'CATÉGORIE',C_MODE   + 2, y + 5.5);
    doc.setCharSpace(0);
    doc.text(labels['amount']  || 'MONTANT',  C_AMT,        y + 5.5, { align: 'right' });
    doc.text(labels['status']  || 'STATUT',   C_STATUS + 2, y + 5.5);
    y += 10;

    // ── ROWS ──────────────────────────────────────────────────────
    const ROW_H = 8;
    let grandTotal = 0;

    for (let i = 0; i < operations.length; i++) {
      if (y + ROW_H > PH - 18) { doc.addPage(); y = 16; }

      const op = operations[i];

      // Stripe
      if (i % 2 === 1) {
        pf(STRIPE); doc.rect(ML, y - 1, PW - ML - MR, ROW_H, 'F');
      }

      // Bottom divider
      pd(DIVIDER); doc.setLineWidth(0.25);
      doc.line(ML, y + ROW_H - 1, PW - MR, y + ROW_H - 1);

      const dateStr   = new Date(op.date).toLocaleDateString('fr-MA');
      const nameStr   = op.name || '';
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      const ctxStr    = op.context ? doc.splitTextToSize(op.context, 58)[0] : '';
      const modeStr   = op.category === 'personal' ? labels['personal'] : labels['business'];
      const amtStr    = this.formatAmount(op.amount, 'MAD');
      const statusStr = labels[op.status] || op.status;

      const textY = y + 5.5;

      ptc(MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text(dateStr, C_DATE + 2, textY);

      ptc(BODY); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.text(nameStr, C_NAME + 2, textY);

      ptc(MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      doc.text(ctxStr, C_CTX + 2, textY);

      ptc(BODY); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text(modeStr, C_MODE + 2, textY);

      ptc(BODY); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.text(amtStr, C_AMT, textY, { align: 'right' });

      ptc(MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      doc.text(statusStr, C_STATUS + 2, textY);

      grandTotal += op.amount;
      y += ROW_H;
    }

    // ── TOTAL ROW ─────────────────────────────────────────────────
    y += 4;
    pd(BLACK); doc.setLineWidth(0.6);
    doc.line(ML, y, PW - MR, y);
    y += 7;

    ptc(BODY); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5);
    doc.text(labels['total'] || 'TOTAL', C_MODE + 2, y);
    doc.text(this.formatAmount(grandTotal, 'MAD'), C_AMT, y, { align: 'right' });

    // ── FOOTER ────────────────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      pd(DIVIDER); doc.setLineWidth(0.3);
      doc.line(ML, PH - 8, PW - MR, PH - 8);
      ptc(MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      doc.text(`${p} / ${totalPages}`, PW / 2, PH - 4, { align: 'center' });
    }

    return doc.output('blob');
  }

  private formatAmount(amount: number, currency: string): string {
    const formatted = new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(amount);
    return `${formatted} ${currency}`;
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
