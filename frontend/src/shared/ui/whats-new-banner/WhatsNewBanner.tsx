import React, { useState, useEffect } from "react";
import { X, Sparkles, Layers, Database, BarChart3 } from "lucide-react";
import { storage } from "../../api/storage";
import styles from "./WhatsNewBanner.module.scss";

const UPDATE_KEY = "seen_update_v1_1";

interface UpdateFeature {
	icon: React.ReactNode;
	title: string;
	description: string;
}

const FEATURES: UpdateFeature[] = [
	{
		icon: <Layers size={14} />,
		title: "Smart Tab Subgroups",
		description: "AI now automatically groups your open tabs into conceptual workflow categories (like \"Code Repositories\" or \"Databases\"), eliminating clutter and keeping related tasks organized.",
	},
	{
		icon: <BarChart3 size={14} />,
		title: "Activity Dashboard",
		description: "A brand new interactive statistics page featuring a dynamic area chart. Track your daily task time, sessions, and completion rates to visualize your productivity trends.",
	},
	{
		icon: <Database size={14} />,
		title: "Secure Cloud Sync & OAuth",
		description: "We've completely rewritten our authentication system. All registration bugs have been eliminated, and we've added robust OAuth authorization for enhanced security and seamless cross-device cloud synchronization. Please log in again to securely reconnect.",
	},
];

export const WhatsNewBanner: React.FC = () => {
	const [visible, setVisible] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [animateOut, setAnimateOut] = useState(false);

	useEffect(() => {
		const check = async () => {
			const seen = await storage.get(UPDATE_KEY);
			if (!seen) {
				setVisible(true);
			}
		};
		check();
	}, []);

	const handleDismiss = async () => {
		setAnimateOut(true);
		await storage.set(UPDATE_KEY, "true");
		setTimeout(() => setVisible(false), 350);
	};

	if (!visible) return null;

	return (
		<div
			className={`${styles.banner} ${animateOut ? styles.exit : styles.enter}`}
		>
			<div className={styles.accentBar} />

			<div className={styles.header}>
				<div className={styles.titleRow}>
					<div className={styles.iconWrap}>
						<Sparkles size={14} />
					</div>
					<span className={styles.version}>v1.1</span>
					<h3 className={styles.title}>What&apos;s New</h3>
				</div>

				<div className={styles.actions}>
					<button
						className={styles.expandBtn}
						onClick={() => setExpanded((p) => !p)}
						aria-label="Toggle details"
					>
						{expanded ? "Less" : "Details"}
					</button>
					<button
						className={styles.closeBtn}
						onClick={handleDismiss}
						aria-label="Dismiss update banner"
					>
						<X size={14} />
					</button>
				</div>
			</div>

			{expanded && (
				<div className={styles.features}>
					{FEATURES.map((f) => (
						<div key={f.title} className={styles.feature}>
							<div className={styles.featureIcon}>{f.icon}</div>
							<div className={styles.featureText}>
								<span className={styles.featureTitle}>{f.title}</span>
								<span className={styles.featureDesc}>{f.description}</span>
							</div>
						</div>
					))}
					<div className={styles.previewImageContainer}>
						<img src="/dashboard-preview.png" alt="Activity Dashboard Preview" className={styles.previewImage} />
					</div>
				</div>
			)}

			<p className={styles.subtext}>
				Tap <strong>Details</strong> to see all changes · Tap <X size={10} /> to dismiss
			</p>
		</div>
	);
};
