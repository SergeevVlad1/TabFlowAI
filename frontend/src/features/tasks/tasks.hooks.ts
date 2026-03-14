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
		mutationFn: ({ id, completed, timeSpent }: { id: string; completed: boolean; timeSpent?: number }) =>
			updateTask(id, { completed, timeSpent }),
		onMutate: async ({ id: updatedId, ...updates }) => {
			await queryClient.cancelQueries({ queryKey: ["tasks"] });
			const previousTasks = queryClient.getQueryData(["tasks"]);
			
			queryClient.setQueryData(["tasks"], (old: any) => {
				if (!old) return old;
				return old.map((task: any) =>
					task.id === updatedId ? { ...task, ...updates } : task,
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
