import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { Network } from 'vis-network';
import {
  buildNodeNetworkPath,
  getNetworkRootCmid,
  navigateToNetworkNode,
} from './VisNet';
import Neo4jVisualization from './VisNet';

vi.mock('vis-network', () => ({
  Network: vi.fn(),
}));

describe('VisNet navigation helpers', () => {
  test('buildNodeNetworkPath creates the expected route', () => {
    expect(buildNodeNetworkPath('sociomap', 'SM2')).toBe('/sociomap/SM2/network');
  });

  test('getNetworkRootCmid safely handles an empty graph during route changes', () => {
    expect(getNetworkRootCmid([])).toBe('');
    expect(getNetworkRootCmid([null, { CMID: 'SM2' }])).toBe('SM2');
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

describe('VisNet layout lifecycle', () => {
  let container;
  let root;
  let handlers;

  beforeEach(() => {
    vi.useFakeTimers();
    handlers = {};
    Network.mockImplementation(function MockNetwork() {
      return {
        destroy: vi.fn(),
        on: vi.fn((event, handler) => {
          handlers[event] = handler;
        }),
        once: vi.fn((event, handler) => {
          handlers[event] = handler;
        }),
        setOptions: vi.fn(),
      };
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('opening node details does not recreate and restabilize the network', () => {
    const visData = {
      nodes: [{
        id: 1,
        CMID: 'SM1',
        CMName: 'Example',
        domain: ['LANGUAGE'],
        tooltipcon: ['CMID: SM1', 'CMName: Example'],
      }],
      edges: [],
    };

    act(() => {
      root.render(
        <MemoryRouter>
          <Neo4jVisualization
            visData={visData}
            dropdownNodeLimit={500}
            database="sociomap"
          />
        </MemoryRouter>
      );
    });

    expect(Network).toHaveBeenCalledTimes(1);

    act(() => {
      handlers.click({
        nodes: [1],
        pointer: { DOM: { x: 100, y: 80 } },
      });
      vi.advanceTimersByTime(200);
    });

    expect(container.textContent).toContain('CMID: SM1');
    expect(Network).toHaveBeenCalledTimes(1);
  });

  test('never renders internal ownership metadata from a prebuilt tooltip', () => {
    const visData = {
      nodes: [{
        id: 1,
        CMID: 'SM1',
        CMName: 'Example',
        domain: ['LANGUAGE'],
        tooltipcon: [
          'CMID: SM1',
          'ownerUserId: user-123',
          'modifiedByOtherUser: false',
        ],
      }],
      edges: [],
    };

    act(() => {
      root.render(
        <MemoryRouter>
          <Neo4jVisualization
            visData={visData}
            dropdownNodeLimit={500}
            database="sociomap"
          />
        </MemoryRouter>
      );
    });

    act(() => {
      handlers.click({
        nodes: [1],
        pointer: { DOM: { x: 100, y: 80 } },
      });
      vi.advanceTimersByTime(200);
    });

    expect(container.textContent).toContain('CMID: SM1');
    expect(container.textContent).not.toContain('ownerUserId');
    expect(container.textContent).not.toContain('modifiedByOtherUser');
  });
});
