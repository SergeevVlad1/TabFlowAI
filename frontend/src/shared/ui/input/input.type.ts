import type { InputHTMLAttributes } from "react";

export interface InputProps extends Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"onChange"
> {
	label?: string;
	error?: string;
	fullWidth?: boolean;
	onChange?: (value: string) => void;
	className?: string;
}
