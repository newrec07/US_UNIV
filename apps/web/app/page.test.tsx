import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('HomePage', () => {
  it('frames an empty action list as a starting point, not a failure', () => {
    render(<HomePage />);

    expect(screen.getByText('지금 할 수 있는 행동')).toBeInTheDocument();
    expect(screen.getByText(/시작할 수 있는 지점/)).toBeInTheDocument();
  });
});
