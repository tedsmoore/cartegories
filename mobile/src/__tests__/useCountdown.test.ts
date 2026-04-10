/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '../hooks/useCountdown';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('counts down every second', () => {
  const onExpire = jest.fn();
  const { result } = renderHook(() =>
    useCountdown({ initialSeconds: 10, paused: false, onExpire })
  );

  expect(result.current.timeLeft).toBe(10);

  act(() => { jest.advanceTimersByTime(3000); });
  expect(result.current.timeLeft).toBe(7);
});

test('does not tick when paused', () => {
  const onExpire = jest.fn();
  const { result } = renderHook(() =>
    useCountdown({ initialSeconds: 10, paused: true, onExpire })
  );

  act(() => { jest.advanceTimersByTime(5000); });
  expect(result.current.timeLeft).toBe(10);
});

test('resumes after unpause', () => {
  const onExpire = jest.fn();
  let paused = true;
  const { result, rerender } = renderHook(() =>
    useCountdown({ initialSeconds: 10, paused, onExpire })
  );

  act(() => { jest.advanceTimersByTime(3000); });
  expect(result.current.timeLeft).toBe(10);

  paused = false;
  rerender({});
  act(() => { jest.advanceTimersByTime(3000); });
  expect(result.current.timeLeft).toBe(7);
});

test('calls onExpire when timer reaches 0', () => {
  const onExpire = jest.fn();
  renderHook(() =>
    useCountdown({ initialSeconds: 3, paused: false, onExpire })
  );

  act(() => { jest.advanceTimersByTime(3000); });
  expect(onExpire).toHaveBeenCalledTimes(1);
});

test('does not tick past 0', () => {
  const onExpire = jest.fn();
  const { result } = renderHook(() =>
    useCountdown({ initialSeconds: 2, paused: false, onExpire })
  );

  act(() => { jest.advanceTimersByTime(5000); });
  expect(result.current.timeLeft).toBeLessThanOrEqual(0);
  expect(onExpire).toHaveBeenCalledTimes(1);
});

test('stop() halts the countdown', () => {
  const onExpire = jest.fn();
  const { result } = renderHook(() =>
    useCountdown({ initialSeconds: 10, paused: false, onExpire })
  );

  act(() => { jest.advanceTimersByTime(2000); });
  expect(result.current.timeLeft).toBe(8);

  act(() => { result.current.stop(); });
  act(() => { jest.advanceTimersByTime(5000); });
  expect(result.current.timeLeft).toBe(8);
  expect(onExpire).not.toHaveBeenCalled();
});

test('only one interval runs at a time (no double-tick)', () => {
  const onExpire = jest.fn();
  const { result } = renderHook(() =>
    useCountdown({ initialSeconds: 10, paused: false, onExpire })
  );

  // After 1 second, should decrement by exactly 1, not 2
  act(() => { jest.advanceTimersByTime(1000); });
  expect(result.current.timeLeft).toBe(9);
});
