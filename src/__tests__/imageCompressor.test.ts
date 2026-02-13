import { describe, it, expect } from 'vitest';
import { getDataUrlSize, formatFileSize } from '../utils/imageCompressor';

describe('imageCompressor utils', () => {
  describe('getDataUrlSize', () => {
    it('should return 0 for empty data URL', () => {
      expect(getDataUrlSize('')).toBe(0);
    });

    it('should return 0 for data URL without base64 part', () => {
      expect(getDataUrlSize('data:image/png;base64')).toBe(0);
    });

    it('should calculate correct size from base64', () => {
      // "Hello" in base64 is "SGVsbG8=" (8 chars) => ~6 bytes
      const dataUrl = 'data:text/plain;base64,SGVsbG8=';
      const size = getDataUrlSize(dataUrl);
      expect(size).toBe(6);
    });
  });

  describe('formatFileSize', () => {
    it('should return "0 Bytes" for 0', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('should format MB correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should handle decimal values', () => {
      const result = formatFileSize(1536);
      expect(result).toBe('1.5 KB');
    });
  });
});
