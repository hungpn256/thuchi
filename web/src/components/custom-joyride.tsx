import React from 'react';
import Joyride, { Props as JoyrideProps, TooltipRenderProps } from 'react-joyride';
import { Button } from '@/components/ui/button';

interface CustomTooltipProps extends TooltipRenderProps {
  primaryProps: {
    'aria-label': string;
    'data-action': string;
    onClick: React.MouseEventHandler<HTMLElement>;
    role: string;
    title: string;
  };
  backProps: {
    'aria-label': string;
    'data-action': string;
    onClick: React.MouseEventHandler<HTMLElement>;
    role: string;
    title: string;
  };
  skipProps: {
    'aria-label': string;
    'data-action': string;
    onClick: React.MouseEventHandler<HTMLElement>;
    role: string;
    title: string;
  };
}

// Custom tooltip component using our UI Button
const CustomTooltip = ({
  index,
  size,
  step,
  backProps,
  skipProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: CustomTooltipProps) => (
  <div
    {...tooltipProps}
    className="bg-background text-foreground border-border max-w-md rounded-lg border p-4 shadow-lg"
  >
    {step.title && <div className="mb-2 text-lg font-medium">{step.title}</div>}
    <div className="mb-4 text-sm">{step.content}</div>
    <div className="flex items-center justify-between">
      {index > 0 && (
        <Button size="sm" variant="outline" onClick={backProps.onClick} className="mr-2">
          {backProps.title}
        </Button>
      )}
      {!isLastStep ? (
        <>
          <Button size="sm" variant="ghost" onClick={skipProps.onClick} className="mr-auto">
            {skipProps.title}
          </Button>
          <Button size="sm" onClick={primaryProps.onClick}>
            {primaryProps.title}
          </Button>
        </>
      ) : (
        <Button size="sm" onClick={primaryProps.onClick}>
          {primaryProps.title}
        </Button>
      )}
    </div>
    {size > 1 && (
      <div className="text-muted-foreground mt-2 text-center text-xs">
        {index + 1} / {size}
      </div>
    )}
  </div>
);

interface CustomJoyrideProps extends Omit<JoyrideProps, 'tooltipComponent'> {
  locale?: {
    back?: string;
    close?: string;
    last?: string;
    next?: string;
    skip?: string;
  };
}

export const CustomJoyride = ({
  steps,
  run,
  continuous = true,
  showSkipButton = true,
  locale = {
    back: 'Quay lại',
    close: 'Đóng',
    last: 'Hoàn thành',
    next: 'Tiếp theo',
    skip: 'Bỏ qua',
  },
  ...rest
}: CustomJoyrideProps) => {
  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={continuous}
      showSkipButton={showSkipButton}
      tooltipComponent={CustomTooltip}
      locale={locale}
      styles={{
        options: {
          zIndex: 10000,
          arrowColor: 'var(--background)',
        },
        spotlight: {
          borderRadius: '4px',
          boxShadow: '0 0 0 999em rgba(0, 0, 0, 0.7)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
      {...rest}
    />
  );
};
