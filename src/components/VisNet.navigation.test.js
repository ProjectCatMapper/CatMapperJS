import { buildNodeNetworkPath, navigateToNetworkNode } from './VisNet';

describe('VisNet navigation helpers', () => {
  test('buildNodeNetworkPath creates the expected route', () => {
    expect(buildNodeNetworkPath('sociomap', 'SM2')).toBe('/sociomap/SM2/network');
  });

  test('navigateToNetworkNode navigates and signals loading for a different node', () => {
    const navigate = jest.fn();
    const onNavigateStart = jest.fn();

    const didNavigate = navigateToNetworkNode({
      cmid: 'SM2',
      currentid: 'SM1',
      database: 'sociomap',
      navigate,
      onNavigateStart,
    });

    expect(didNavigate).toBe(true);
    expect(onNavigateStart).toHaveBeenCalledWith('SM2');
    expect(navigate).toHaveBeenCalledWith({ pathname: '/sociomap/SM2/network' });
  });

  test('navigateToNetworkNode ignores the current node', () => {
    const navigate = jest.fn();
    const onNavigateStart = jest.fn();

    const didNavigate = navigateToNetworkNode({
      cmid: 'SM1',
      currentid: 'SM1',
      database: 'sociomap',
      navigate,
      onNavigateStart,
    });

    expect(didNavigate).toBe(false);
    expect(onNavigateStart).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  test('navigateToNetworkNode ignores empty CMID', () => {
    const navigate = jest.fn();
    const onNavigateStart = jest.fn();

    const didNavigate = navigateToNetworkNode({
      cmid: '',
      currentid: 'SM1',
      database: 'sociomap',
      navigate,
      onNavigateStart,
    });

    expect(didNavigate).toBe(false);
    expect(onNavigateStart).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
