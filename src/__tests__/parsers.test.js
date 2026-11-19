import { describe, it, expect } from 'vitest';
import { parseVietnameseMoneyText } from '../utils/currency.js';
import { parseQuickTextExpenses } from '../utils/textParser.js';
import { parsePastedExpenses, parsePastedMembers } from '../utils/tsvParser.js';

describe('Vietnamese Money Text Parser', () => {
  it('parses various Vietnamese text formats accurately', () => {
    expect(parseVietnameseMoneyText('1tr350')).toBe(1350000);
    expect(parseVietnameseMoneyText('1tr350k')).toBe(1350000);
    expect(parseVietnameseMoneyText('450k')).toBe(450000);
    expect(parseVietnameseMoneyText('1.5tr')).toBe(1500000);
    expect(parseVietnameseMoneyText('1,5tr')).toBe(1500000);
    expect(parseVietnameseMoneyText('2tr')).toBe(2000000);
    expect(parseVietnameseMoneyText('150.000đ')).toBe(150000);
    expect(parseVietnameseMoneyText('630,000')).toBe(630000);
    expect(parseVietnameseMoneyText('30000')).toBe(30000);
    expect(parseVietnameseMoneyText('1ty')).toBe(1000000000);
    expect(parseVietnameseMoneyText('')).toBe(0);
    expect(parseVietnameseMoneyText(null)).toBe(0);
  });
});

describe('Natural Language Quick Expense Parser', () => {
  it('parses comma-separated expenses string correctly', () => {
    const input = 'Thuê xe 1tr350, vé tham quan 450k, ăn trưa 630k, nước uống 150k';
    const parsed = parseQuickTextExpenses(input, 'Nguyễn Văn An');

    expect(parsed.length).toBe(4);
    expect(parsed[0].title).toBe('Thuê xe');
    expect(parsed[0].amount).toBe(1350000);
    expect(parsed[0].representative).toBe('Nguyễn Văn An');

    expect(parsed[1].title).toBe('Vé tham quan');
    expect(parsed[1].amount).toBe(450000);

    expect(parsed[2].title).toBe('Ăn trưa');
    expect(parsed[2].amount).toBe(630000);

    expect(parsed[3].title).toBe('Nước uống');
    expect(parsed[3].amount).toBe(150000);
  });

  it('handles newline separated input', () => {
    const input = "Thuê lều 360k\nBBQ tối 360k\nCà phê 180k";
    const parsed = parseQuickTextExpenses(input);

    expect(parsed.length).toBe(3);
    expect(parsed[0].title).toBe('Thuê lều');
    expect(parsed[0].amount).toBe(360000);
    expect(parsed[1].title).toBe('BBQ tối');
    expect(parsed[1].amount).toBe(360000);
    expect(parsed[2].title).toBe('Cà phê');
    expect(parsed[2].amount).toBe(180000);
  });
});

describe('Spreadsheet TSV / Multi-row Paste Parser', () => {
  it('parses Excel copied expenses table rows', () => {
    const tsv = `2026-11-20\tThuê xe 16 chỗ\tNguyễn Văn An\t1.350.000\tNhà xe Tuấn Anh
2026-11-20\tVé tham quan\tNguyễn Văn An\t450.000\tVé 9 người
2026-11-20\tĂn trưa cơm niêu\tNguyễn Văn An\t630.000\t`;

    const parsed = parsePastedExpenses(tsv, 'Nguyễn Văn An');
    expect(parsed.length).toBe(3);
    expect(parsed[0].description).toBe('Thuê xe 16 chỗ');
    expect(parsed[0].amount).toBe(1350000);
    expect(parsed[0].representative).toBe('Nguyễn Văn An');
    expect(parsed[0].valid).toBe(true);

    expect(parsed[1].description).toBe('Vé tham quan');
    expect(parsed[1].amount).toBe(450000);

    expect(parsed[2].description).toBe('Ăn trưa cơm niêu');
    expect(parsed[2].amount).toBe(630000);
  });

  it('parses Excel copied members list', () => {
    const tsv = `Trần Hoàng Vinh\t450000\tChuyển khoản
Lê Ngọc Bích\t450000\tChuyển khoản
Phạm Mạnh Cường\t450000\tTiền mặt`;

    const parsed = parsePastedMembers(tsv, 450000);
    expect(parsed.length).toBe(3);
    expect(parsed[0].name).toBe('Trần Hoàng Vinh');
    expect(parsed[0].contributionAmount).toBe(450000);
    expect(parsed[0].paymentStatus).toBe('paid');
    expect(parsed[0].valid).toBe(true);

    expect(parsed[1].name).toBe('Lê Ngọc Bích');
    expect(parsed[2].name).toBe('Phạm Mạnh Cường');
  });

  it('ignores header row when pasted', () => {
    const tsvWithHeader = `STT\tNội dung\tSố tiền
1\tThuê xe\t1350000`;

    const parsed = parsePastedExpenses(tsvWithHeader);
    expect(parsed.length).toBe(1);
    expect(parsed[0].description).toBe('Thuê xe');
    expect(parsed[0].amount).toBe(1350000);
  });
});
