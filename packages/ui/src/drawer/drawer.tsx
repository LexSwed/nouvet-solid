import { Content as DrawerContent, Root as DrawerRoot } from "@corvu/drawer";
import { createMediaQuery } from "@solid-primitives/media";
import { mergeRefs } from "@solid-primitives/refs";
import {
	type ComponentProps,
	Show,
	type ValidComponent,
	children,
	createMemo,
	createSignal,
	splitProps,
} from "solid-js";

import { Popover, type PopoverProps } from "../popover";
import { Text } from "../text";
import { tw } from "../tw";
import { composeEventHandlers } from "../utils";

import css from "./drawer.module.css";

const MobileDrawer = <T extends ValidComponent = "div">(ownProps: PopoverProps<T>) => {
	const [open, setOpen] = createSignal(false);
	const [local, props] = splitProps(ownProps as PopoverProps<"div">, [
		"children",
		"class",
		"heading",
	]);
	let popoverEl: HTMLElement | null;

	const resolved = createMemo(() => {
		const child = local.children;
		return typeof child === "function" ? child(open) : child;
	});

	const heading = children(() => local.heading);

	return (
		<DrawerRoot
			open={open()}
			closeOnEscapeKeyDown={false}
			closeOnOutsidePointer={false}
			trapFocus={false}
			restoreFocus={false}
			role="dialog"
			onOpenChange={(open) => {
				// swiped away
				setOpen(open);
				// onOpenChange is executed on every state change, we only want to hide it
				if (!popoverEl?.matches(":popover-open")) popoverEl?.hidePopover();
			}}
		>
			<DrawerContent
				as="div"
				forceMount
				popover="auto"
				role="dialog"
				tabIndex={0}
				class={tw(css.drawer, local.class, "max-w-[640px]")}
				onToggle={composeEventHandlers(props.onToggle, (event) => {
					setOpen(event.newState === "open");
					if (event.newState === "open") {
						(event.currentTarget as HTMLElement).focus();
					}
				})}
				onFocusOut={composeEventHandlers(props.onFocusOut, (event) => {
					if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) {
						(event.currentTarget as HTMLElement).hidePopover();
					}
				})}
				{...(props as ComponentProps<typeof DrawerContent>)}
				ref={mergeRefs(ownProps.ref, (el: HTMLElement) => {
					popoverEl = el;
				})}
				aria-labelledby={heading() ? `${props.id}-heading` : undefined}
			>
				<Show when={open()}>
					<div class="grid w-full place-content-center pt-2 pb-3">
						<div class="h-1 w-8 rounded-full bg-on-surface/30" />
					</div>

					<Show when={heading()}>
						<Text with="headline-3" as="header" id={`${props.id}-heading`} class="mb-4">
							{heading()}
						</Text>
					</Show>
					{resolved()}
				</Show>
			</DrawerContent>
		</DrawerRoot>
	);
};

const Drawer = <T extends ValidComponent = "div">(ownProps: PopoverProps<T>) => {
	const isMobile = createMediaQuery(
		// @screen(sm)
		"(max-width: 640px)",
		true,
	);
	return (
		<Show
			when={isMobile()}
			children={<MobileDrawer {...ownProps} />}
			fallback={<Popover {...ownProps} />}
		/>
	);
};

export { Drawer };
