import React, { forwardRef } from "react";
import type { InputProps } from "./input.type";
import style from "./input.module.scss";
import clsx from "clsx";

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, fullWidth, onChange, className, ...props }, ref) => {
		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			if (onChange) {
				onChange(e.target.value);
			}
		};

		return (
			<div
				className={clsx(
					style.inputWrapper,
					{ [style.fullWidth]: fullWidth },
					className,
				)}
			>
				{label && <label className={style.label}>{label}</label>}
				<div className={style.fieldWrapper}>
					<input
						{...props}
						ref={ref}
						onChange={handleInputChange}
						className={clsx(style.input, {
							[style.error]: !!error,
						})}
					/>
					{error && <span className={style.errorText}>{error}</span>}
				</div>
			</div>
		);
	},
);

Input.displayName = "Input";
