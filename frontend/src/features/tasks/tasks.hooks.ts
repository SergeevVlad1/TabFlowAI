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
		queryFn: getTasks,
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
		mutationFn: (taskData: Partial<Task>) => createTask(taskData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
};

export const useDeleteTaskMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteTask(id),
		onMutate: async (deletedId) => {
			await queryClient.cancelQueries({ queryKey: ["tasks"] });
			const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

			queryClient.setQueryData<Task[]>(["tasks"], (old) =>
				old ? old.filter((task) => task.id !== deletedId) : [],
			);
			return { previousTasks };
		},
		onError: (_err, _id, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(["tasks"], context.previousTasks);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
};

interface ToggleTaskParams {
	id: string;
	completed: boolean;
	timeSpent?: number;
}

export const useToggleTaskMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, completed, timeSpent }: ToggleTaskParams) =>
			updateTask(id, { completed, timeSpent }),
		onMutate: async ({ id: updatedId, ...updates }) => {
			await queryClient.cancelQueries({ queryKey: ["tasks"] });
			const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

			queryClient.setQueryData<Task[]>(["tasks"], (old) =>
				old
					? old.map((task) =>
							task.id === updatedId ? { ...task, ...updates } : task,
						)
					: [],
			);
			return { previousTasks };
		},
		onError: (_err, _vars, context) => {
			if (context?.previousTasks) {
				queryClient.setQueryData(["tasks"], context.previousTasks);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
};

export const useUpdateTaskMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, taskData }: { id: string; taskData: Partial<Task> }) =>
			updateTask(id, taskData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
		},
	});
};
