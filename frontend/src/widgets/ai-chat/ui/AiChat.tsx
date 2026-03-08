import React, { useState, useRef, useEffect } from "react";
import styles from "./AiChat.module.scss";
import clsx from "clsx";
import { Send, Bot, Sparkles, Minus, Maximize2 } from "lucide-react";
import { useTaskStore } from "../../../features/tasks/store/taskStore";
import { useTrackingStore } from "../../../features/tracking/store/trackingStore";
import { Input } from "../../../shared/ui/input/input";

interface Message {
	id: string;
	text: string;
	sender: "user" | "ai";
	timestamp: number;
}

export const AiChat: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			text: "Hi! I'm your TabAI assistant. How can I help you optimize your flow today?",
			sender: "ai",
			timestamp: Date.now(),
		},
	]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { tasks } = useTaskStore();
	const { currentSession } = useTrackingStore();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isTyping]);

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMsg: Message = {
			id: crypto.randomUUID(),
			text: input,
			sender: "user",
			timestamp: Date.now(),
		};

		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsTyping(true);

		// Simulate AI processing
		setTimeout(() => {
			const aiResponse = generateResponse(userMsg.text);
			const aiMsg: Message = {
				id: crypto.randomUUID(),
				text: aiResponse,
				sender: "ai",
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, aiMsg]);
			setIsTyping(false);
		}, 1500);
	};

	const generateResponse = (text: string): string => {
		const lower = text.toLowerCase();

		if (lower.includes("status") || lower.includes("progress")) {
			const pending = tasks.filter((t) => !t.completed).length;
			return `You currently have ${pending} tasks pending. ${currentSession ? "You're doing great in your focus session!" : "Would you like to start a focus timer?"}`;
		}

		if (lower.includes("suggest") || lower.includes("do")) {
			const highPri = tasks.find(
				(t) => t.priority === "high" && !t.completed,
			);
			if (highPri)
				return `Based on your priority list, I suggest focusing on "${highPri.title}". It's your top goal for today.`;
			return "You've cleared your high priorities! How about tackling a smaller task or taking a quick 5-minute break?";
		}

		return "I'm here to help you manage your tabs and tasks with AI. Ask me for a progress report or task suggestion!";
	};

	return (
		<>
			<div
				className={clsx(styles.chatContainer, {
					[styles.minimized]: isMinimized,
				})}
			>
				<div className={styles.chatHeader}>
					<div className={styles.headerTitle}>
						<Sparkles size={16} />
						<span>AI Assistant</span>
					</div>
					<button
						className={styles.minimizeBtn}
						onClick={() => setIsMinimized(!isMinimized)}
					>
						{isMinimized ? (
							<Maximize2 className={styles.iconOpen} size={16} />
						) : (
							<Minus className={styles.iconClose} size={16} />
						)}
					</button>
				</div>

				{!isMinimized && (
					<>
						<div className={styles.messages}>
							{messages.map((msg) => (
								<div
									key={msg.id}
									className={clsx(
										styles.message,
										styles[msg.sender],
									)}
								>
									{msg.sender === "ai" && (
										<Bot
											size={18}
											className={styles.botIcon}
										/>
									)}
									<div className={styles.messageContent}>
										{msg.text}
									</div>
								</div>
							))}
							{isTyping && (
								<div
									className={clsx(styles.message, styles.ai)}
								>
									<Bot size={18} className={styles.botIcon} />
									<div className={styles.typingIndicator}>
										<span />
										<span />
										<span />
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>

						<div className={styles.inputArea}>
							<div className={styles.inputWrapper}>
								<Input
									type="text"
									value={input}
									onChange={setInput}
									onKeyDown={(e) =>
										e.key === "Enter" && handleSend()
									}
									placeholder="Message AI Assistant..."
									disabled={isTyping}
									fullWidth
								/>
							</div>
							<button
								onClick={handleSend}
								disabled={!input.trim() || isTyping}
							>
								<Send size={18} />
							</button>
						</div>
					</>
				)}
			</div>
		</>
	);
};
