import { ref, computed } from 'vue';
import { zhTW } from './zhTW';
import { en } from './en';

export type Locale = 'zh-TW' | 'en';
type Messages = typeof zhTW;

const messages: Record<Locale, Messages> = {
  'zh-TW': zhTW,
  en,
};

const currentLocale = ref<Locale>(
  (localStorage.getItem('locale') as Locale) || 'zh-TW'
);

/**
 * 輕量 i18n 組合式函數
 */
export function useI18n() {
  const locale = computed({
    get: () => currentLocale.value,
    set: (val: Locale) => {
      currentLocale.value = val;
      localStorage.setItem('locale', val);
    },
  });

  function t(key: string): string {
    const keys = key.split('.');
    let result: unknown = messages[currentLocale.value];
    for (const k of keys) {
      if (result && typeof result === 'object') {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key; // 找不到就返回 key
      }
    }
    return typeof result === 'string' ? result : key;
  }

  return { locale, t };
}
