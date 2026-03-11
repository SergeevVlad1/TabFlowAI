import { handleRequest, MethodEnum } from "../../shared/api";
import type { Task } from "./store/taskStore";

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
	const response = await handleRequest<{ data: Task }, Partial<Task>>({
		url: "/tasks",
		method: MethodEnum.POST,
		data: taskData,
	});
	return response.data;
};

export const getTasks = async (): Promise<Task[]> => {
	const response = await handleRequest<{ data: Task[] }>({
		url: "/tasks",
		method: MethodEnum.GET,
	});
	return response.data;
};

export const deleteTask = async (id: string) => {
	return await handleRequest({
		url: `/task/${id}`,
		method: MethodEnum.DELETE,
	});
};

export const updateTask = async (
	id: string,
	taskData: Partial<Task>,
): Promise<Task> => {
	const response = await handleRequest<{ data: Task }, Partial<Task>>({
		url: `/task/${id}`,
		method: MethodEnum.PATCH,
		data: taskData,
	});
	return response.data;
};

export const getTask = async (id: string): Promise<Task> => {
	const response = await handleRequest<{ data: Task }>({
		url: `/task/${id}`,
		method: MethodEnum.GET,
	});
	return response.data;
};

export const toggleTask = async (id: string, completed: boolean) => {
	const response = await handleRequest<{ data: boolean }, boolean>({
		url: `/task/${id}`,
		method: MethodEnum.PATCH,
		data: completed,
	});
	return response.data;
};
