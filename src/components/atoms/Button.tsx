import type { ButtonHTMLAttributes, CSSProperties } from 'react';

type ButtonVariant = 'primary' | 'success' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, CSSProperties> = {
  primary: { backgroundColor: '#5383e8', color: '#fff', border: 'none' },
  success: { backgroundColor: '#2ecc71', color: '#fff', border: 'none' },
  ghost: {
    backgroundColor: '#1f2026',
    color: '#5383e8',
    border: '1px solid #2c2d33',
  },
};

export function Button({ variant = 'primary', disabled, style, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        borderRadius: '6px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...variants[variant],
        ...(disabled && variant === 'primary' ? { backgroundColor: '#2c2d33' } : {}),
        ...style,
      }}
    />
  );
}
