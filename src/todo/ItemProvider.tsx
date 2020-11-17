import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {ItemProps} from './ItemProps';
import {createItem, deleteItem, getItems, newWebSocket, updateItem} from './itemApi';
import {AuthContext} from "../auth";
import {Storage} from "@capacitor/core";

const log = getLogger('ItemProvider');

type SaveItemFn = (item: ItemProps) => Promise<any>;
type DeleteItemFn = (item: ItemProps) => Promise<any>;
type FetchItemsFn = (offset: number, size: number, isGood: boolean | undefined, searchName: string) => Promise<any>;
type ReloadItemsFn = (offset: number, size: number, isGood: boolean | undefined, searchName: string) => Promise<any>;

export interface ItemsState {
    items?: ItemProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveItem?: SaveItemFn,
    deleting: boolean,
    deletingError?: Error | null,
    _deleteItem?: DeleteItemFn
    fetchItems?: FetchItemsFn,
    reloadItems?: ReloadItemsFn
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ItemsState = {
    fetching: false,
    saving: false,
    deleting: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const RELOAD_ITEMS_SUCCEEDED = 'RELOAD_ITEMS_SUCCEEDED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const DELETE_ITEM_STARTED = 'DELETE_ITEM_STARTED';
const DELETE_ITEM_FAILED = 'DELETE_ITEM_FAILED';
const DELETE_ITEM_SUCCEEDED = 'DELETE_ITEM_SUCCEEDED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_ITEMS_SUCCEEDED: {
                const items = [...(state.items || [])];
                return {...state, items: items.concat(payload.items), fetching: false};
            }
            case RELOAD_ITEMS_SUCCEEDED: {
                return {...state, items: payload.items, fetching: false};
            }
            case FETCH_ITEMS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_ITEM_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_ITEM_SUCCEEDED:
                const items = [...(state.items || [])];
                const item = payload.item;
                const index = items.findIndex(it => it._id === item._id);
                if (index === -1) {
                    items.splice(0, 0, item);
                } else {
                    items[index] = item;
                }
                return {...state, items, saving: false};
            case SAVE_ITEM_FAILED:
                return {...state, savingError: payload.error, saving: false};
            case DELETE_ITEM_STARTED:
                return {...state, deletingError: null, deleting:true};
            case DELETE_ITEM_SUCCEEDED: {
                const items = [...(state.items || [])];
                const item = payload.item;
                const index = items.findIndex(it => it._id === item._id);
                if (index !== -1) {
                    items.splice(index, 1);
                }
                return {...state, items, deleting: false};
            }
            default:
                return state;
        }
    };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({children}) => {
    const {token, _id} = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {items, fetching, fetchingError, saving, savingError, deleting, deletingError} = state;
    useEffect(getItemsEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token]);
    const _deleteItem = useCallback<DeleteItemFn>(deleteItemCallback, [token]);
    const value = {items, fetching, fetchingError, saving, savingError, saveItem, deleting, deletingError, _deleteItem, fetchItems, reloadItems};
    log('returns');
    return (
        <ItemContext.Provider value={value}>
            {children}
        </ItemContext.Provider>
    );


    async function fetchItems(offset: number, size: number, isGood: boolean | undefined, searchName: string) {
        if(!token?.trim()){
            return;
        }
        try {
            log('fetchItems started');
            dispatch({type: FETCH_ITEMS_STARTED});
            const items = await getItems(token, offset, size, isGood, searchName);
            log('fetchItems succeeded');
            dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items}});
        } catch (error) {
            log('fetchItems failed');
            alert("OFFLINE!");
            const storageItems: any[] = [];
            await Storage.keys().then(function (allKeys) {
                allKeys.keys.forEach((key) => {
                    Storage.get({key}).then(function (it) {
                        try {
                            const object = JSON.parse(it.value);
                            let isGoodFilter = true;
                            if(isGood !== undefined){
                                isGoodFilter = object.isGood === isGood;
                            }
                            let nameFilter = true;
                            if(searchName !== ''){
                                nameFilter = new RegExp(`^${searchName}`).test(object.name);
                            }
                            if (String(object.userId) === String(_id) && isGoodFilter && nameFilter)
                                storageItems.push(object);
                        } catch (e) {
                        }
                    });
                })
            });
            dispatch({type: RELOAD_ITEMS_SUCCEEDED, payload: {items: storageItems}});
        }
    }

    async function reloadItems(offset: number, size: number, isGood: boolean | undefined, searchName: string) {
        if(!token?.trim()){
            return;
        }
        try {
            log(`reloadItems started with searchName = ${searchName}`);
            dispatch({type: FETCH_ITEMS_STARTED});
            const items = await getItems(token, 0, offset + size, isGood, searchName);
            log('reloadItems succeeded');
            dispatch({type: RELOAD_ITEMS_SUCCEEDED, payload: {items}});
        } catch (error) {
            log('reloadItems failed');
            alert("OFFLINE!");
            const storageItems: any[] = [];
            await Storage.keys().then(function (allKeys) {
                allKeys.keys.forEach((key) => {
                    Storage.get({key}).then(function (it) {
                        try {
                            const object = JSON.parse(it.value);
                            let isGoodFilter = true;
                            if(isGood !== undefined){
                                isGoodFilter = object.isGood === isGood;
                            }
                            let nameFilter = true;
                            if(searchName !== ''){
                                nameFilter = new RegExp(`^${searchName}`).test(object.name);
                            }
                            if (String(object.userId) === String(_id) && isGoodFilter && nameFilter)
                                storageItems.push(object);
                        } catch (e) {
                        }
                    });
                })
            });
            dispatch({type: RELOAD_ITEMS_SUCCEEDED, payload: {items: storageItems}});
        }
    }

    function getItemsEffect() {
        let canceled = false;
        // fetchItems(0, 100000);
        return () => {
            canceled = true;
        }

    }

    async function saveItemCallback(item: ItemProps) {
        try {
            log('saveItem started');
            dispatch({type: SAVE_ITEM_STARTED});
            const savedItem = await (item._id ? updateItem(token, item) : createItem(token, item));
            log('saveItem succeeded');
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: savedItem}});
        } catch (error) {
            log('saveItem failed');
            alert("OFFLINE!");
            item._id = item._id ? item._id : String(Date.now())
            await Storage.set({
                key: String(item._id),
                value: JSON.stringify(item)
            });
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item}});
        }
    }

    async function deleteItemCallback(item: ItemProps) {
      try {
        log('deleteItem started');
        dispatch({type: DELETE_ITEM_STARTED});
        const deletedItem = await deleteItem(token, item._id as string);
        log('deleteItem succeeded');
        dispatch({type: DELETE_ITEM_SUCCEEDED, payload: {item: deletedItem}});
      } catch (error) {
        log('deleteItem failed');
          alert("OFFLINE!");
          await Storage.remove({
              key: String(item._id)
          });
        dispatch({type: DELETE_ITEM_SUCCEEDED, payload: {item}});
      }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const {type, payload: item} = message;
                console.log('Message', JSON.stringify(message))
                log(`ws message, item ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item}});
                } else if (type === 'deleted') {
                    dispatch({type: DELETE_ITEM_SUCCEEDED, payload: {item}});
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};
