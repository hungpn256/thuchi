import { useState, useEffect } from 'react';
import { CallBackProps, STATUS, Step } from 'react-joyride';

// Storage key for the tour completion status
const TOUR_STORAGE_KEY = 'quick-input-tour-completed';

export const quickInputTourSteps: Step[] = [
  {
    target: '.quick-input-container',
    content:
      'Chào mừng bạn đến với tính năng nhập nhanh! Với tính năng này, bạn có thể tạo nhiều giao dịch cùng lúc chỉ bằng vài dòng văn bản.',
    placement: 'center',
    disableBeacon: true,
    title: 'Tính năng nhập nhanh',
  },
  {
    target: '.quick-input-textarea',
    content:
      'Nhập mỗi giao dịch trên một dòng. Thêm dấu "+" trước số tiền cho giao dịch thu nhập. Ví dụ: "+40k tiền lương" hoặc "40k đi ăn".',
    title: 'Cách nhập giao dịch',
    placement: 'bottom',
  },
  {
    target: '.quick-input-voice',
    content:
      'Bạn cũng có thể dùng giọng nói để nhập giao dịch. Nhấn vào đây và nói rõ nội dung giao dịch.',
    title: 'Nhập bằng giọng nói',
    placement: 'left',
  },
  {
    target: '.quick-input-preview',
    content:
      'Sau khi nhập xong, nhấn vào nút này để xem trước các giao dịch. Hệ thống sẽ tự động phân tích và phân loại giao dịch của bạn.',
    title: 'Xem trước giao dịch',
    placement: 'bottom',
  },
];

// Add new steps for form to quick input guidance
export const formToQuickInputSteps: Step[] = [
  {
    target: '[data-value="TEXT"]',
    content:
      'Chuyển qua tab "Nhập nhanh" để sử dụng tính năng tạo nhiều giao dịch cùng lúc một cách dễ dàng.',
    placement: 'bottom',
    disableBeacon: true,
    title: 'Chuyển sang Nhập nhanh',
  },
];

interface UseQuickInputTourProps {
  /**
   * Whether the tour should start automatically
   * Defaults to false to avoid automatic start
   */
  autoStart?: boolean;

  /**
   * Whether to show the form-to-quick-input tour first
   */
  fromFormInput?: boolean;
}

export function useQuickInputTour({
  autoStart = false,
  fromFormInput = false,
}: UseQuickInputTourProps = {}) {
  const [run, setRun] = useState(false);
  const [tourShown, setTourShown] = useState(false);

  // Use separate steps arrays rather than combining them to avoid step skipping
  const [steps] = useState(fromFormInput ? formToQuickInputSteps : quickInputTourSteps);

  useEffect(() => {
    // Check if this is the first time the user is seeing the tour
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';

    // Only start the tour automatically for first-time users if autoStart is true
    if (autoStart && !tourCompleted && !tourShown) {
      setRun(true);
      setTourShown(true);
    }
  }, [autoStart, tourShown]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    // Tour is finished or skipped
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      // Mark the tour as completed in localStorage
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }
  };

  const startTour = () => {
    setRun(true);
    setTourShown(true);
  };

  return {
    run,
    steps,
    startTour,
    handleJoyrideCallback,
  };
}
