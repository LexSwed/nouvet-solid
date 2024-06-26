import { type ClassNameValue, extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
	extend: {
		theme: {
			spacing: ["font"],
		},
		classGroups: {
			overflow: ["overflow-snap"],
		},
	},
});

export function tw(...classNames: ClassNameValue[]) {
	return customTwMerge(...classNames);
}
