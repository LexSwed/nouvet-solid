import { A } from '@solidjs/router';
import { Show, splitProps, type ValidComponent } from 'solid-js';
import { Dynamic, type DynamicProps } from 'solid-js/web';
import { cva, type VariantProps } from 'class-variance-authority';

import { Spinner } from '../spinner';
import { tw } from '../tw';
import { mergeDefaultProps } from '../utils';

export const buttonVariants = cva(
  `relative inline-flex cursor-default items-center justify-center rounded-xl text-sm font-medium transition focus-visible:outline-4 focus-visible:outline-offset-4 disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      size: {
        base: 'min-h-14 min-w-14 px-6 py-2 text-base sm:min-h-12 sm:min-w-12',
        sm: 'min-h-12 min-w-12 px-3 text-sm sm:min-h-10 sm:min-w-10',
        lg: 'min-h-16 min-w-16 px-8 text-lg sm:min-h-14 sm:min-w-14',
        cta: 'min-h-16 min-w-16 rounded-full px-8 text-lg',
      },
      variant: {
        default: 'bg-primary text-on-primary outline-primary',
        tonal: 'outline-on-surface',
        outline:
          'border-outline text-on-surface outline-on-surface rounded-full border bg-transparent focus-visible:outline-offset-0',
        secondary:
          'bg-tertiary-container text-on-tertiary-container outline-tertiary rounded-full',
        ghost: 'text-on-surface outline-on-surface',
        link: 'text-primary underline-offset-4',
      },
      loading: {
        true: '',
        false: '',
      },
      icon: {
        true: 'rounded-full p-0',
      },
      split: {
        true: 'flex w-fit p-0 [&>*]:rounded-[inherit]',
      },
      tone: {
        neutral: '',
        primary: '',
        secondary: '',
        success: '',
        destructive: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      tone: 'neutral',
      size: 'base',
      icon: false,
      split: false,
    },
    compoundVariants: [
      {
        split: false,
        variant: 'default',
        class: 'intent:filter-darker',
      },
      {
        split: false,
        variant: 'default',
        tone: 'destructive',
        class:
          'bg-error-container text-on-error-container outline-error intent:bg-error-container/90',
      },
      {
        split: false,
        variant: 'outline',
        class: 'intent:bg-on-surface/8',
      },
      {
        split: false,
        variant: 'outline',
        tone: 'destructive',
        class:
          'border-error text-error outline-error intent:bg-error-container/30',
      },
      {
        split: false,
        variant: 'tonal',
        tone: 'neutral',
        class: 'bg-on-surface/5 text-on-surface intent:bg-on-surface/8',
      },
      {
        split: false,
        variant: 'tonal',
        tone: 'primary',
        class:
          'bg-primary-container text-on-primary-container intent:bg-primary-container/90',
      },
      {
        split: false,
        variant: 'tonal',
        tone: 'secondary',
        class:
          'bg-secondary-container text-on-secondary-container intent:bg-secondary-container/90',
      },
      {
        split: false,
        variant: 'tonal',
        tone: 'destructive',
        class:
          'bg-error-container text-on-error-container intent:bg-error-container/90',
      },
      {
        split: false,
        variant: 'ghost',
        tone: 'neutral',
        class: 'hover:bg-on-surface/5 focus:bg-on-surface/8',
      },
      {
        split: false,
        variant: 'link',
        class: 'intent:underline',
      },
    ],
  },
);

type ButtonVariants = Omit<VariantProps<typeof buttonVariants>, 'icon'> &
  ({ icon: true; label: string } | { icon?: boolean; label?: string });
type BaseProps<T extends ValidComponent> = DynamicProps<T> & ButtonVariants;

const BaseComponent = <T extends ValidComponent>(ownProps: BaseProps<T>) => {
  const [local, props] = splitProps(ownProps as BaseProps<'button'>, [
    'size',
    'loading',
    'variant',
    'split',
    'tone',
    'icon',
    'label',
    'title',
  ]);
  return (
    <Dynamic
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
      aria-label={local.label}
      aria-busy={local.loading}
      title={local.title ?? local.label}
      class={tw(buttonVariants(local), props.class)}
      onClick={(event: MouseEvent) => {
        if (
          local.loading ||
          props.disabled ||
          (props['aria-disabled'] && props['aria-disabled'] !== 'false')
        ) {
          event.preventDefault();
          return;
        }
        if (typeof props.onClick === 'function') {
          props.onClick(
            event as MouseEvent & {
              currentTarget: HTMLButtonElement;
              target: Element;
            },
          );
        } else if (Array.isArray(props.onClick)) {
          props.onClick[1](props.onClick[0], event);
        }
      }}
      aria-disabled={local.loading || undefined}
    >
      {props.children}
      <Show when={local.loading}>
        <div class="absolute inset-0 isolate flex cursor-default items-center justify-center rounded-[inherit] bg-[radial-gradient(circle_at_50%_50%,theme(colors.surface/0.9),transparent)]">
          <Spinner size={local.size} />
        </div>
      </Show>
    </Dynamic>
  );
};

const Button = (ownProps: Omit<BaseProps<'button'>, 'component' | 'split'>) => {
  const props = mergeDefaultProps(ownProps, {
    type: 'button',
  });
  return <BaseComponent {...props} component="button" />;
};

const ButtonLink = (
  ownProps: Omit<BaseProps<typeof A>, 'component' | 'split'>,
) => {
  /**
   * When link={false} should use <a> without any link attribute
   * @link https://github.com/solidjs/solid-router/discussions/321
   */
  const [local, props] = splitProps(ownProps, ['link']);
  return (
    <BaseComponent {...props} component={local.link === false ? 'a' : A} />
  );
};

const SplitButton = (
  ownProps: Omit<BaseProps<'div'>, 'component' | 'icon' | 'split'>,
) => {
  return <BaseComponent {...ownProps} split component="div" />;
};
SplitButton.Inner = (ownProps: Omit<BaseProps<'button'>, 'component'>) => {
  return <Button {...ownProps} size="sm" class="gap-3 px-4" variant="ghost" />;
};

export { Button, ButtonLink, SplitButton };
