import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavbarApp from './NavbarApp';

vi.mock('./AuthContext', () => ({
    useAuth: () => ({ authLevel: 0, logout: vi.fn() }),
}));

describe('NavbarApp help link', () => {
    let container;
    let root;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => {
            root.unmount();
        });
        container.remove();
        vi.clearAllMocks();
    });

    it('points the Help menu item at the help subdomain', async () => {
        await act(async () => {
            root.render(
                React.createElement(
                    MemoryRouter,
                    null,
                    React.createElement(NavbarApp, { database: 'sociomap' })
                )
            );
        });

        const helpLink = Array.from(container.querySelectorAll('a')).find(
            (node) => node.textContent?.trim() === 'Help'
        );

        expect(helpLink).toBeTruthy();
        expect(helpLink?.getAttribute('href')).toBe('https://help.catmapper.org/');
        expect(helpLink?.getAttribute('target')).toBe('_blank');
        expect(helpLink?.getAttribute('rel')).toBe('noopener noreferrer');
    });
});