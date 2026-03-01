import type { JSX } from "react";
import { PathEnum } from "./routers.types";
import { Dashboard } from "../../pages/Dashboard/Dashboard";
import { TasksPage } from "../../pages/Tasks/TasksPage";
import { StatsPage } from "../../pages/Stats/StatsPage";

interface Router<T> {
    path: PathEnum;
    element: T;
}

export const routers: Router<JSX.Element>[] = [
    {
        path: PathEnum.DASHBOARD,
        element: <Dashboard />
    },
    {
        path: PathEnum.TASKS,
        element: <TasksPage />
    },
    {
        path: PathEnum.STATS,
        element: <StatsPage />
    }
]

