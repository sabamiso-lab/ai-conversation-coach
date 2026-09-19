import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Alert from '../Alert';

describe('Alert component', () => {
  it('renders title and children with error role', () => {
    render(
      <Alert variant="error" title="エラーが発生しました">
        詳細なエラーメッセージ
      </Alert>
    );

    const alertBox = screen.getByRole('alert');
    expect(alertBox).toBeInTheDocument();
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.getByText('詳細なエラーメッセージ')).toBeInTheDocument();
  });

  it('renders warning variant without title', () => {
    render(
      <Alert variant="warning">
        警告メッセージ
      </Alert>
    );

    expect(screen.getByText('警告メッセージ')).toBeInTheDocument();
  });
});
