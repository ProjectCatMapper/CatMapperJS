import { describe, expect, it } from 'vitest';
import { parseTabularFile } from './tabularUpload';

function makeTextFile(name, contents) {
  return {
    name,
    text: async () => contents,
  };
}

describe('tabularUpload', () => {
  it('accepts a small two-column CSV when delimiter detection uses comma fallback', async () => {
    const parsed = await parseTabularFile(
      makeTextFile('small.csv', 'source_name,source_key\nAlpha,K1\n')
    );

    expect(parsed.headers).toEqual(['source_name', 'source_key']);
    expect(parsed.records).toEqual([
      { source_name: 'Alpha', source_key: 'K1' },
    ]);
  });

  it('still rejects fatal CSV syntax errors', async () => {
    await expect(parseTabularFile(
      makeTextFile('broken.csv', 'source_name,source_key\n"Alpha,K1\n')
    )).rejects.toThrow('Unable to parse the uploaded file.');
  });

  it('drops columns that are entirely empty and warns about them', async () => {
    const file = makeTextFile(
      'example.csv',
      [
        'CMName,EmptyCol,Key,WhitespaceOnly',
        'Node A,,alpha,   ',
        ',, ,',
        ',,beta,\t',
      ].join('\n')
    );

    const parsed = await parseTabularFile(file, {
      dropFullyEmptyColumns: true,
    });

    expect(parsed.headers).toEqual(['CMName', 'Key']);
    expect(parsed.rows2d).toEqual([
      ['Node A', 'alpha'],
      ['', 'beta'],
    ]);
    expect(parsed.warnings).toContain(
      'Empty column(s) removed: EmptyCol, WhitespaceOnly'
    );
  });

  it('keeps a sparsely populated column when at least one row has a value', async () => {
    const file = makeTextFile(
      'example.csv',
      [
        'CMName,MostlyEmpty,Key',
        'Node A,,alpha',
        'Node B,,beta',
        'Node C,retained,gamma',
      ].join('\n')
    );

    const parsed = await parseTabularFile(file, {
      dropFullyEmptyColumns: true,
    });

    expect(parsed.headers).toEqual(['CMName', 'MostlyEmpty', 'Key']);
    expect(parsed.rows2d).toEqual([
      ['Node A', '', 'alpha'],
      ['Node B', '', 'beta'],
      ['Node C', 'retained', 'gamma'],
    ]);
    expect(parsed.warnings).toEqual([]);
  });
});
