import axios from 'axios';
import {authConfig, getLogger} from '../core';
import { ItemProps } from './ItemProps';
import {Plugins} from "@capacitor/core";

const {Storage} = Plugins;

const log = getLogger('itemApi');

const baseUrl = 'localhost:3000';
const itemUrl = `http://${baseUrl}/api/item`;

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  return promise
    .then(res => {
      return Promise.resolve(res.data);
    })
    .catch(err => {
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const handleRecipesConflicts: (token: string, storageRecipes: any[]) => Promise<ItemProps[]> = async (token: string, storageRecipes: any[]) => {
  const result = axios.post(itemUrl + '/conflicts', storageRecipes, authConfig(token));
  return withLogs(result, 'handleConflicts');
}

export const getItems: (token: string, offset: number, size: number, isGood: boolean | undefined, searchName: string) => Promise<ItemProps[]> = (token, offset, size, isGood, searchName) => {
  const result = axios.get(itemUrl + `?offset=${offset}&size=${size}&isGood=${isGood}&nameFilter=${searchName}`, authConfig(token));
  result.then(function (result) {
    result.data.forEach(async (item: ItemProps) => {
      await Storage.set({
        key: String(item._id!),
        value: JSON.stringify(item),
      });
    });
  })

  return withLogs(result, 'getItems');
}

export const createItem: (token: string, item: ItemProps, userID: string) => Promise<ItemProps[]> = (token, item, userID) => {
  const result = axios.post(itemUrl, item, authConfig(token));
  result.then(async function (result) {
    await Storage.set({
      key: result.data._id!,
      value: JSON.stringify(result.data),
    });
  }).catch(async () => {
    item._id = Math.floor(Math.random() * 1e9).toString();
    item.userId = userID;
    await Storage.set({
      key: item._id,
      value: JSON.stringify(item),
    });
  });
  return withLogs(result, 'createItem');
}

export const updateItem: (token: string, item: ItemProps) => Promise<{savedItem: ItemProps[], updated: boolean}> = async (token, item) => {
  const result = axios.put(`${itemUrl}/${item._id}`, item, authConfig(token));
  result.then(async function (result) {
    if (result.status === 200) {
      await Storage.set({
        key: result.data._id!,
        value: JSON.stringify(result.data),
      });
    }
  });
  const response = await result;
  if(response.status === 200){
    await Storage.set({
      key: response.data._id!,
      value: JSON.stringify(response.data),
    });
    return {savedItem: response.data, updated: true};
  }else if(response.status === 201){
    return {savedItem: response.data, updated: false};
  }
  return {savedItem: {}, updated: false};
}

export const deleteItem: (token: string, itemID: string) => Promise<ItemProps[]> = (token, itemID) => {
  const result = axios.delete(`${itemUrl}/${itemID}`, authConfig(token));
  result.then(async function () {
    await Storage.remove({key: String(itemID!)});
  });
  return withLogs(result, 'deleteItem');
}

interface MessageData {
  type: string;
  payload: ItemProps;
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`)
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({type: 'authorization', payload: {token}}));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
