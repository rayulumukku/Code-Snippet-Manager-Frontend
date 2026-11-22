import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FavoriteButton from '../components/FavoriteButton';
import { ToastProvider } from '../context/ToastContext';
import * as AuthContext from '../context/AuthContext';
import { favoritesAPI } from '../services/api';

vi.mock('../services/api', () => ({
  favoritesAPI: {
    favorite: vi.fn().mockResolvedValue({ data: { message: 'Favorited' } }),
    unfavorite: vi.fn().mockResolvedValue({ data: { message: 'Unfavorited' } }),
    getFavoriteIds: vi.fn().mockResolvedValue({ data: ['snip-1', 'snip-2'] }),
  },
}));

describe('Favorites Hydration & Button Toggling', () => {
  it('renders initial favorited state when initialFavorited is true', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { _id: 'user-1', username: 'testuser' },
      isFavorited: () => true,
      toggleFavoriteId: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ToastProvider>
          <FavoriteButton
            snippetId="snip-1"
            initialFavorited={true}
            initialCount={5}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /remove from favorites/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('optimistically increments count and calls favorite API on click', async () => {
    const toggleSpy = vi.fn();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { _id: 'user-1', username: 'testuser' },
      isFavorited: () => false,
      toggleFavoriteId: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ToastProvider>
          <FavoriteButton
            snippetId="snip-99"
            initialFavorited={false}
            initialCount={0}
            onToggle={toggleSpy}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(button);

    // Optimistic increment
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(toggleSpy).toHaveBeenCalledWith('snip-99', true, 1);

    await waitFor(() => {
      expect(favoritesAPI.favorite).toHaveBeenCalledWith('snip-99');
    });
  });

  it('optimistically decrements count and calls unfavorite API on click', async () => {
    const toggleSpy = vi.fn();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { _id: 'user-1', username: 'testuser' },
      isFavorited: () => true,
      toggleFavoriteId: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ToastProvider>
          <FavoriteButton
            snippetId="snip-1"
            initialFavorited={true}
            initialCount={3}
            onToggle={toggleSpy}
          />
        </ToastProvider>
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /remove from favorites/i });
    fireEvent.click(button);

    // Optimistic decrement
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(toggleSpy).toHaveBeenCalledWith('snip-1', false, 2);

    await waitFor(() => {
      expect(favoritesAPI.unfavorite).toHaveBeenCalledWith('snip-1');
    });
  });
});
