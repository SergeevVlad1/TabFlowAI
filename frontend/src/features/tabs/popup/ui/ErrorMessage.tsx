import { memo } from "react";
import { AlertCircle, X } from "lucide-react";
import styles from "./ErrorMessage.module.scss";

interface ErrorMessageProps {
	message: string | null;
	onClose?: () => void;
}

export const ErrorMessage = memo(({ message, onClose }: ErrorMessageProps) => {
	if (!message) return null;

	const handleClose = () => {
		if (onClose) onClose();
	};

	return (
		<div className={styles.container} role="alert">
			<div className={styles.icon}>
				<AlertCircle size={16} />
			</div>
			<div className={styles.content}>
				<span className={styles.text}>{message}</span>
			</div>
			{onClose && (
				<button 
					className={styles.closeBtn} 
					onClick={handleClose}
					aria-label="Close error"
				>
					<X size={12} />
				</button>
			)}
		</div>
	);
});

ErrorMessage.displayName = "ErrorMessage";
