import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * 모바일에서는 하단 시트, 데스크탑에서는 중앙 오버레이로 표시되는 모달.
 * 모바일: 하단에서 슬라이드 업 (h-[80vh], rounded-t-3xl, bg-gray-200).
 * 데스크탑: 중앙 정렬, rounded-xl, max-w-3xl, 최대 90vh 스크롤.
 * 배경 클릭 또는 Escape 키로 닫힘.
 *
 * @param {{ isOpen: boolean, onClose: () => void, title?: string, children: import('react').ReactNode, mobileActions?: import('react').ReactNode }} props
 */
export function Modal({ isOpen, onClose, title, children, mobileActions }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeIn' }}
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeIn' }}
            className="w-full h-[80vh] rounded-t-3xl lg:rounded-xl lg:max-w-3xl lg:h-auto lg:max-h-[90vh] lg:overflow-y-auto bg-gray-200 dark:bg-gray-900 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모바일 헤더 (드래그 바 + 닫기 + 액션) */}
            <div className="lg:hidden relative w-full py-6">
              <button
                onClick={onClose}
                className="absolute top-3 left-6 p-1 text-indigo-600 dark:text-indigo-300 transition-colors"
              >
                닫기
              </button>
              <div className="w-12 h-1.5 mx-auto bg-gray-400 dark:bg-gray-300 rounded-full" />
              {mobileActions && (
                <div className="absolute top-3 right-6 flex items-center gap-2">
                  {mobileActions}
                </div>
              )}
            </div>

            {/* 스크롤 영역 */}
            <div className="h-[calc(80vh-4rem)] overflow-y-auto lg:h-auto lg:overflow-visible">
              <div className="px-4 py-4 lg:px-8 lg:py-8">
                {/* 데스크탑 헤더 */}
                {(title) && (
                  <div className="hidden lg:flex items-center justify-between mb-4 gap-2">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-1 w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {!title && (
                  <div className="hidden lg:flex justify-end mb-4">
                    <button
                      onClick={onClose}
                      className="p-1 w-8 h-8 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full active:bg-gray-200 mouse:hover:bg-gray-200 dark:active:bg-gray-700 dark:mouse:hover:bg-gray-700 transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {children}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
