import {useContext, useEffect, useState} from 'react';
import {NetworkStatus, Plugins} from "@capacitor/core";
import {ItemContext} from "../recipes/ItemProvider";

const {Network} = Plugins;

const initialState = {
    connected: false,
    connectionType: 'unknown',
}

export const useNetwork = () => {
    const [networkStatus, setNetworkStatus] = useState(initialState)
    const {handleConflicts} = useContext(ItemContext);
    let i = 0;
    useEffect(() => {
        const handler = Network.addListener('networkStatusChange', handleNetworkStatusChange);
        Network.getStatus().then(handleNetworkStatusChange);
        let canceled = false;
        return () => {
            canceled = true;
            handler.remove();
        }

        function handleNetworkStatusChange(status: NetworkStatus) {
            i++;
            if (status.connected && i > 1)
                handleConflicts?.();
            if (!canceled) {
                setNetworkStatus(status);
            }
        }
    }, [])
    return {networkStatus};
};