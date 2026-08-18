import {
  generateNetworkTooltipContent,
  getNetworkExplorerPropertyEntries,
  filterNetworkExplorerTooltipLines,
  isNetworkExplorerPropertyVisible,
  isNetworkExplorerTooltipLineVisible,
} from './networkExplorerProperties';

const ownershipMetadata = {
  createdByUserId: 'user-123',
  ownerUserId: 'user-123',
  createdAt: '2026-07-21T12:00:00Z',
  contributionId: 'contribution_123',
  modifiedByOtherUser: false,
};

describe('network explorer property visibility', () => {
  test.each(Object.keys(ownershipMetadata))('hides internal ownership property %s', (property) => {
    expect(isNetworkExplorerPropertyVisible(property)).toBe(false);
  });

  test('keeps public node properties in tooltips', () => {
    expect(generateNetworkTooltipContent({
      CMID: 'SM1',
      CMName: 'Example',
      ...ownershipMetadata,
    })).toEqual([
      'CMID: SM1\n',
      'CMName: Example\n',
    ]);
  });

  test('keeps public USES properties while removing ownership metadata', () => {
    expect(Object.fromEntries(getNetworkExplorerPropertyEntries({
      Name: ['Example'],
      Key: ['1'],
      ...ownershipMetadata,
    }))).toEqual({
      Name: ['Example'],
      Key: ['1'],
    });
  });

  test.each([
    ' ownerUserId: user-123',
    'MODIFIEDBYOTHERUSER: false',
  ])('hides internal metadata tooltip line %s', (line) => {
    expect(isNetworkExplorerTooltipLineVisible(line)).toBe(false);
  });

  test('filters every internal property from prebuilt tooltip lines', () => {
    expect(filterNetworkExplorerTooltipLines([
      'CMID: SM1',
      ...Object.keys(ownershipMetadata).map((property) => ` ${property.toUpperCase()} : hidden`),
    ])).toEqual(['CMID: SM1']);
  });
});
