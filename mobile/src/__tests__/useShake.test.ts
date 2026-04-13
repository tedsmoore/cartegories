/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useShake } from '../hooks/useShake';
import { Accelerometer } from 'expo-sensors';

jest.mock('expo-sensors', () => ({
  Accelerometer: {
    addListener: jest.fn(),
    setUpdateInterval: jest.fn(),
    removeSubscription: jest.fn(),
  },
}));

describe('useShake', () => {
  let mockListener: ((data: { x: number; y: number; z: number }) => void) | null = null;

  beforeEach(() => {
    mockListener = null;
    (Accelerometer.addListener as jest.Mock).mockImplementation((cb) => {
      mockListener = cb;
      return { remove: jest.fn() };
    });
  });

  it('calls onShake when acceleration exceeds threshold', () => {
    const onShake = jest.fn();
    renderHook(() => useShake(onShake));

    expect(mockListener).not.toBeNull();

    act(() => {
      mockListener!({ x: 3.0, y: 0, z: 0 });
    });

    expect(onShake).toHaveBeenCalledTimes(1);
  });

  it('does not call onShake for normal movement', () => {
    const onShake = jest.fn();
    renderHook(() => useShake(onShake));

    act(() => {
      mockListener!({ x: 0.1, y: 0.2, z: 1.0 });
    });

    expect(onShake).not.toHaveBeenCalled();
  });

  it('debounces rapid shakes but fires again after debounce window', () => {
    jest.useFakeTimers();
    jest.spyOn(Date, 'now')
      .mockReturnValueOnce(2000)  // first shake (2s after epoch, clears initial lastShake=0)
      .mockReturnValueOnce(2100)  // second shake (within debounce window)
      .mockReturnValueOnce(3100); // third shake (1s after first, past debounce)

    const onShake = jest.fn();
    renderHook(() => useShake(onShake));

    act(() => { mockListener!({ x: 3.0, y: 0, z: 0 }); });
    act(() => { mockListener!({ x: 3.0, y: 0, z: 0 }); });
    expect(onShake).toHaveBeenCalledTimes(1);

    act(() => { mockListener!({ x: 3.0, y: 0, z: 0 }); });
    expect(onShake).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });
});
