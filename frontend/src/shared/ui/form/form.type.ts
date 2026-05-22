import type { FormEventHandler, ReactNode } from "react";

export interface FormProps {
	children?: ReactNode;
	onSubmit: FormEventHandler<HTMLFormElement>;
	className?: string;
}
