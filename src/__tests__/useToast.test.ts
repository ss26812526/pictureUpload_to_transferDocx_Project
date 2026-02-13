import { describe, it, expect, vi } from 'vitest';
import { useToast } from '../composables/useToast';

describe('useToast', () => {
  it('should add a success toast', () => {
    const { toasts, success } = useToast();
    const initialCount = toasts.value.length;
    success('Test success');
    expect(toasts.value.length).toBe(initialCount + 1);
    const last = toasts.value[toasts.value.length - 1];
    expect(last?.message).toBe('Test success');
    expect(last?.type).toBe('success');
  });

  it('should add an error toast', () => {
    const { toasts, error } = useToast();
    const initialCount = toasts.value.length;
    error('Test error');
    expect(toasts.value.length).toBe(initialCount + 1);
    const last = toasts.value[toasts.value.length - 1];
    expect(last?.message).toBe('Test error');
    expect(last?.type).toBe('error');
  });

  it('should add a warning toast', () => {
    const { toasts, warning } = useToast();
    const initialCount = toasts.value.length;
    warning('Test warning');
    expect(toasts.value.length).toBe(initialCount + 1);
    const last = toasts.value[toasts.value.length - 1];
    expect(last?.type).toBe('warning');
  });

  it('should remove toast by id', () => {
    const { toasts, success, removeToast } = useToast();
    success('To be removed');
    const toast = toasts.value[toasts.value.length - 1]!;
    const countBefore = toasts.value.length;
    removeToast(toast.id);
    expect(toasts.value.length).toBe(countBefore - 1);
  });

  it('should auto-remove toast after timeout', async () => {
    vi.useFakeTimers();
    const { toasts, info } = useToast();
    const initialCount = toasts.value.length;
    info('Auto remove');
    expect(toasts.value.length).toBe(initialCount + 1);

    vi.advanceTimersByTime(3100);
    expect(toasts.value.length).toBe(initialCount);
    vi.useRealTimers();
  });
});
