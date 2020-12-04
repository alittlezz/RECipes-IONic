import {useEffect} from "react";
import {Plugins} from "@capacitor/core";

const { BackgroundTask } = Plugins;

export const useBackgroundTask = (asyncTask: () => Promise<void>) => {
    useEffect(() => {
        let taskId = BackgroundTask.beforeExit(async  () => {
            await asyncTask();
            BackgroundTask.finish({taskId});
        });
    }, [])
    return {};
};