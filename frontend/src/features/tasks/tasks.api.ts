import { handleRequest, MethodEnum, type BaseResponse } from "../../shared/api";
import type { Task } from "./store/taskStore";

interface TaskListResponse extends BaseResponse {
	data: Task[];
}

interface TaskResponse extends BaseResponse {
	data: Task;
}

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
	const response = await handleRequest<TaskResponse, Partial<Task>>({
		url: "/tasks",
		method: MethodEnum.POST,
		data: taskData,
	});
	return response.data;
};

export const getTasks = async (): Promise<Task[]> => {
	const response = await handleRequest<TaskListResponse>({
		url: "/tasks",
		method: MethodEnum.GET,
	});
	return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
	await handleRequest({
		url: `/task/${id}`,
		method: MethodEnum.DELETE,
	});
};

export const updateTask = async (
	id: string,
	taskData: Partial<Task>,
): Promise<Task> => {
	const response = await handleRequest<TaskResponse, Partial<Task>>({
		url: `/task/${id}`,
		method: MethodEnum.PATCH,
		data: taskData,
	});
	return response.data;
};

export const getTask = async (id: string): Promise<Task> => {
	const response = await handleRequest<TaskResponse>({
		url: `/task/${id}`,
		method: MethodEnum.GET,
	});
	return response.data;
};

export const toggleTask = async (id: string, completed: boolean): Promise<Task> => {
	const response = await handleRequest<TaskResponse, { completed: boolean }>({
		url: `/task/${id}`,
		method: MethodEnum.PATCH,
		data: { completed },
	});
	return response.data;
};
