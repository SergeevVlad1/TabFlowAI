import {
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createTask,
	deleteTask,
	getTask,
	getTasks,
	toggleTask,
	updateTask,
} from "./tasks.api";
import type { Task } from "./store/taskStore";

export const useTasksQuery = () => {
	return useQuery({
		queryKey: ["tasks"],
		queryFn: () => getTasks(),
	});
};

export const useTaskQuery = (id: string) => {
	return useQuery({
		queryKey: ["task", id],
		queryFn: () => getTask(id),
	});
};

export const useCreateTaskMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		mutationFn: (taskData: Partial<Task>) => createTask(taskData),
	});
};

export const useDeleteTaskMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		mutationFn: (id: string) => deleteTask(id),
		onMutate: async (deletedId) => {
			const previousTasks = queryClient.cancelQueries({
				queryKey: ["tasks"],
			});
			queryClient.setQueryData(["tasks"], (old: any) => {
				if (!old) return old;
				return Array.isArray(old)
					? old.filter((task) => task.id !== deletedId)
					: old;
			});
			return { previousTasks };
		},
	});
};

export const useToggleTaskMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
			toggleTask(id, completed),
		onMutate: async ({ id: updatedId, completed }) => {
			// 1. Отменяем запросы
			await queryClient.cancelQueries({ queryKey: ["tasks"] });

			// 2. Берем старые данные
			const previousTasks = queryClient.getQueryData(["tasks"]);
			// 3. Обновляем кэш вручную (Оптимистично)
			queryClient.setQueryData(["tasks"], (old: any) => {
				if (!old) return old;
				return old.map((task: any) =>
					task.id === updatedId ? { ...task, completed } : task,
				);
			});
			return { previousTasks };
		},
	});
};

export const useUpdateTaskMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
		mutationFn: ({ id, taskData }: { id: string; taskData: Partial<Task> }) =>
			updateTask(id, taskData),
	});
};
