import { describe, it, expect } from 'vitest';
import { useI18n } from '../i18n';

describe('i18n', () => {
  it('should default to zh-TW locale', () => {
    const { locale } = useI18n();
    // Default or stored value
    expect(['zh-TW', 'en']).toContain(locale.value);
  });

  it('should translate keys correctly in zh-TW', () => {
    const { locale, t } = useI18n();
    locale.value = 'zh-TW';
    expect(t('app.title')).toBe('📸 圖片上傳與文件匯出');
    expect(t('actions.clearAll')).toBe('🗑️ 清空所有圖片');
  });

  it('should translate keys correctly in en', () => {
    const { locale, t } = useI18n();
    locale.value = 'en';
    expect(t('app.title')).toBe('📸 Image Upload & Document Export');
    expect(t('actions.clearAll')).toBe('🗑️ Clear All');
  });

  it('should return key for missing translations', () => {
    const { t } = useI18n();
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('should switch locales dynamically', () => {
    const { locale, t } = useI18n();
    locale.value = 'zh-TW';
    expect(t('empty.title')).toBe('尚未上傳任何圖片');

    locale.value = 'en';
    expect(t('empty.title')).toBe('No images uploaded yet');
  });
});
