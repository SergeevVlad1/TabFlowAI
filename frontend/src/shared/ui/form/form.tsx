import type { FormProps } from "./form.type";

export const Form = ({ children, onSubmit, className }: FormProps) => {
	return (
		<>
			<form className={className} onSubmit={onSubmit}>
				{children}
			</form>
		</>
	);
};
