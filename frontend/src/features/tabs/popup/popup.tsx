import { useEffect } from "react";
import {
	useTabStore,
	type CategoryType,
} from "../../../shared/stores/popup.store";
import styles from "./popup.module.scss";
import { Sparkles, Loader2 } from "lucide-react";
import clsx from "clsx";
import { groupTabs } from "./utils/getAllTabs";

export const Popup = () => {
	const {
		tabs,
		loading,
		modalState,
		selectedCategories,
		fetchTabs,
		setModalState,
		toggleCategory,
		processTabsWithAI,
		reset,
	} = useTabStore();

	useEffect(() => {
		fetchTabs();
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

	const handleGroupTabs = async () => {
		try {
			const classifiedTabs = await processTabsWithAI();
			if (classifiedTabs && Array.isArray(classifiedTabs)) {
				await groupTabs(classifiedTabs);
			}
		} catch (error) {
			console.error("Grouping failed:", error);
		}
	};

	return (
		<div className={styles.popup}>
			<h3>TabFlow AI</h3>
			<p>Организуйте свои вкладки с помощью искусственного интеллекта.</p>

			<button
				className={styles.mainButton}
				onClick={() => setModalState("selecting_param")}
				disabled={loading || tabs.length === 0}
			>
				<Sparkles size={18} />
				{loading ? "Загрузка..." : "Сгруппировать вкладки"}
			</button>

			<div className={styles.stats}>
				{loading ? (
					<Loader2 size={14} className={styles.spin} />
				) : (
					<span>Найдено {tabs.length} вкладок</span>
				)}
			</div>

			{modalState !== "closed" && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						{modalState === "selecting_param" ? (
							<>
								<h4>Выберите категории</h4>
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
											onClick={() => toggleCategory(cat)}
										>
											{categoryLabels[cat]}
										</div>
									))}
								</div>
								<div className={styles.modalActions}>
									<button
										className={styles.cancelBtn}
										onClick={reset}
									>
										Отмена
									</button>
									<button
										className={styles.confirmBtn}
										onClick={handleGroupTabs}
										disabled={
											selectedCategories.length === 0
										}
									>
										Начать
									</button>
								</div>
							</>
						) : (
							<div className={styles.sendingState}>
								<div className={styles.loadingSpinner}></div>
								<p>ИИ анализирует вкладки...</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
