import { useEffect, useCallback } from "react";
import {
	useTabStore,
	type CategoryType,
} from "../../../shared/stores/popup.store";
import styles from "./popup.module.scss";
import {
	Sparkles,
	Briefcase,
	BookOpen,
	Gamepad2,
	DollarSign,
	ShoppingCart,
	Newspaper,
	Users,
	Code,
	Zap,
	Heart,
	Plane,
	Palette,
	Box
} from "lucide-react";
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
				setLocalError("Failed to load tab list");
			}
		};
		init();
	}, [fetchTabs]);

	const categories: CategoryType[] = [
		"work",
		"study",
		"entertainment",
		"finance",
		"shopping",
		"news",
		"social",
		"development",
		"productivity",
		"health",
		"travel",
		"design",
		"other",
	];

	const categoryLabels: Record<CategoryType, string> = {
		work: "Work",
		study: "Study",
		entertainment: "Entertainment",
		finance: "Finance",
		shopping: "Shopping",
		news: "News & Media",
		social: "Social Networks",
		development: "Development",
		productivity: "Productivity",
		health: "Health",
		travel: "Travel",
		design: "Design",
		other: "Other",
	};

	const categoryIcons: Record<CategoryType, React.ReactNode> = {
		work: <Briefcase size={16} />,
		study: <BookOpen size={16} />,
		entertainment: <Gamepad2 size={16} />,
		finance: <DollarSign size={16} />,
		shopping: <ShoppingCart size={16} />,
		news: <Newspaper size={16} />,
		social: <Users size={16} />,
		development: <Code size={16} />,
		productivity: <Zap size={16} />,
		health: <Heart size={16} />,
		travel: <Plane size={16} />,
		design: <Palette size={16} />,
		other: <Box size={16} />,
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
				Organize Tabs
			</button>

			{(modalState !== "closed" || loading) && (
				<div className={styles.modalOverlay}>
					<div className={styles.modalContent}>
						{loading ? (
							<div className={styles.sendingState}>
								<div className={styles.aiLoader}>
									<div className={styles.loaderGlow}></div>
									<div className={styles.loaderRing}></div>
									<div className={styles.loaderRingInner}></div>
									<Sparkles className={styles.loaderIcon} size={32} />
								</div>
								<p>Preparing your workspace...</p>
							</div>
						) : modalState === "selecting_param" ? (
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
											<div className={styles.iconWrapper}>
												{categoryIcons[cat]}
											</div>
											<span>{categoryLabels[cat]}</span>
										</div>
									))}
								</div>

							
								<ErrorMessage
									message={
										(error instanceof Error ? error.message : null) || localError
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
								<div className={styles.aiLoader}>
									<div className={styles.loaderGlow}></div>
									<div className={styles.loaderRing}></div>
									<div className={styles.loaderRingInner}></div>
									<Sparkles className={styles.loaderIcon} size={32} />
								</div>
								<p>AI is analyzing your tabs...</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
