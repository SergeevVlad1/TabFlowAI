import { memo } from "react";

interface TimerProps {
	spentSoFar: number;
	estimatedTime: number;
}

// formatMs helper to format milliseconds
export const formatMs = (ms: number) => {
	const isNegative = ms < 0;
	const absMs = Math.abs(ms);
	const totalSeconds = Math.floor(absMs / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	const sign = isNegative ? "-" : "";
	return `${sign}${hours > 0 ? hours + ":" : ""}${minutes
		.toString()
		.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Purely functional Timer component.
 * It does not maintain state or intervals.
 * It is driven entirely by props from the parent (TaskItem).
 */
export const Timer = memo(({
	spentSoFar,
	estimatedTime,
}: TimerProps) => {
	const estimatedMs = estimatedTime * 60 * 1000;
	const remainingMs = estimatedMs - spentSoFar;

	return (
		<span style={{ color: remainingMs < 0 ? "var(--danger-color)" : "inherit" }}>
			{formatMs(remainingMs)}
		</span>
	);
});

Timer.displayName = "Timer";