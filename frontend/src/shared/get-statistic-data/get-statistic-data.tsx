import type { Task } from "../../features/tasks/store/taskStore";
import { eachDayOfInterval, isSameDay, format, subDays } from "date-fns";

export const getStatisticsData = (tasks: Task[]) => {
	const today = new Date();
	const dateRange = eachDayOfInterval({
		start: subDays(today, 6),
		end: today,
	});
	const taskCompletedData = dateRange?.map((date) => {
		const taskDate: Date = new Date(date);

		const tasksInDate = tasks?.filter(
			(task) =>
				task.completed_at &&
				isSameDay(new Date(task.completed_at), taskDate),
		);

		return {
			name: format(taskDate, "E, d MMM"),
			completedTasks: tasksInDate.length,
		};
	});
	console.log("Сгруппированные данные для графика:", taskCompletedData);
	return taskCompletedData;
};
