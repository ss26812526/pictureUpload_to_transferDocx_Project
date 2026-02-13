import { describe, it, expect } from 'vitest';
import { dataUrlToUint8Array, calculateAspectRatioDimensions } from '../utils/docxGenerator';

describe('docxGenerator utils', () => {
  describe('dataUrlToUint8Array', () => {
    it('should convert a valid data URL to Uint8Array', () => {
      // "Hello" => base64: "SGVsbG8="
      const dataUrl = 'data:text/plain;base64,SGVsbG8=';
      const result = dataUrlToUint8Array(dataUrl);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(5); // "Hello" is 5 bytes
      expect(String.fromCharCode(...result)).toBe('Hello');
    });

    it('should throw for invalid data URL', () => {
      expect(() => dataUrlToUint8Array('invalid')).toThrow('Invalid data URL format');
    });
  });

  describe('calculateAspectRatioDimensions', () => {
    it('should not resize if within limits', () => {
      const result = calculateAspectRatioDimensions(200, 100, 500, 400);
      expect(result).toEqual({ width: 200, height: 100 });
    });

    it('should scale down by width', () => {
      const result = calculateAspectRatioDimensions(1000, 500, 500, 400);
      expect(result.width).toBe(500);
      expect(result.height).toBe(250);
    });

    it('should scale down by height', () => {
      const result = calculateAspectRatioDimensions(200, 1000, 500, 400);
      expect(result.height).toBe(400);
      expect(result.width).toBeCloseTo(80);
    });

    it('should handle both dimensions exceeding limits', () => {
      const result = calculateAspectRatioDimensions(2000, 2000, 500, 400);
      // First scales by width: 500x500, then by height: 400x400
      expect(result.width).toBe(400);
      expect(result.height).toBe(400);
    });
  });
});
