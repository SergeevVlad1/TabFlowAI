import { useEffect, useCallback } from "react";
import {
	useTabStore,
	type CategoryType,
} from "../../../shared/stores/popup.store";
import styles from "./popup.module.scss";
import { Sparkles } from "lucide-react";
import clsx from "clsx";
import { groupTabs } from "./utils/getAllTabs";
import { useOrganizeTabsMutation } from "../hooks/hook";
import { ErrorMessage } from "./ui/ErrorMessage";
import { useState } from "react";

export const Popup = () => {
	const {
		tabs,
		loading,
		modalState,
		selectedCategories,
		fetchTabs,
		setModalState,
		toggleCategory,
		reset,
	} = useTabStore();

	const [localError, setLocalError] = useState<string | null>(null);

	const {
		mutateAsync: organizeTabs,
		error,
		isError,
		reset: resetMutation,
	} = useOrganizeTabsMutation();

	useEffect(() => {
		const init = async () => {
			try {
				setLocalError(null);
				await fetchTabs();
			} catch (err) {
				setLocalError("Не удалось загрузить список вкладок");
			}
		};
		init();
	}, [fetchTabs]);

	const categories: CategoryType[] = [
		"work",
		"study",
		"entertainment",
		"finance",
		"other",
	];

	const categoryLabels: Record<CategoryType, string> = {
		work: "Работа",
		study: "Обучение",
		entertainment: "Развлечения",
		finance: "Финансы",
		other: "Разное",
	};

	const handleGroupTabs = useCallback(async () => {
		try {
			const classifiedTabs = await organizeTabs({
				tabs,
				categories: selectedCategories,
			});
			if (classifiedTabs && Array.isArray(classifiedTabs)) {
				await groupTabs(classifiedTabs);
			}
		} catch (error) {
			// Error is already handled by useMutation.onError
			console.error("Grouping failed:", error);
		}
	}, [organizeTabs, tabs, selectedCategories]);

	return (
		<div className={styles.popup}>
			<button
				className={styles.primaryButton}
				onClick={() => setModalState("selecting_param")}
				disabled={loading || tabs.length === 0}
			>
				<Sparkles size={18} fill="currentColor" />
				{loading ? "Loading..." : "Organize Tabs"}
			</button>

			{modalState !== "closed" && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						{modalState === "selecting_param" ? (
							<>
								<h4>Select Categories</h4>
								<div className={styles.categoryGrid}>
									{categories.map((cat) => (
										<div
											key={cat}
											className={clsx(
												styles.categoryItem,
												selectedCategories.includes(
													cat,
												) && styles.active,
											)}
											onClick={() => {
												toggleCategory(cat);
												if (isError) resetMutation();
												if (localError)
													setLocalError(null);
											}}
										>
											{categoryLabels[cat]}
										</div>
									))}
								</div>

							
								<ErrorMessage
									message={
										(error as any)?.message || localError
									}
									onClose={() => {
										resetMutation();
										setLocalError(null);
									}}
								/>

								<div className={styles.modalActions}>
									<button
										className={styles.cancelBtn}
										onClick={() => {
											reset();
											resetMutation();
										}}
									>
										Cancel
									</button>
									<button
										className={styles.confirmBtn}
										onClick={handleGroupTabs}
										disabled={
											selectedCategories.length === 0
										}
									>
										Confirm
									</button>
								</div>
							</>
						) : (
							<div className={styles.sendingState}>
								<div className={styles.loadingSpinner}></div>
								<p>AI is analyzing your tabs...</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
