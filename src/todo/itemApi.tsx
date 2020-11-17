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
  log(`${fnName} - started`);
  return promise
    .then(res => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch(err => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const getItems: (token: string, offset: number, size: number, isGood: boolean | undefined, searchName: string) => Promise<ItemProps[]> = (token, offset, size, isGood, searchName) => {
  const result = axios.get(itemUrl + `?offset=${offset}&size=${size}&isGood=${isGood}&nameFilter=${searchName}`, authConfig(token));
  result.then(function (result) {
    console.log("Entering itemApi - getItems - No Network Will Throw HERE!");
    result.data.forEach(async (item: ItemProps) => {
      await Storage.set({
        key: String(item._id!),
        value: JSON.stringify(item),
      });
    });
  })

  return withLogs(result, 'getItems');
}

export const createItem: (token: string, item: ItemProps) => Promise<ItemProps[]> = (token, item) => {
  const result = axios.post(itemUrl, item, authConfig(token));
  result.then(async function (result) {
    await Storage.set({
      key: result.data._id!,
      value: JSON.stringify(result.data),
    });
  });
  return withLogs(result, 'createItem');
}

export const updateItem: (token: string, item: ItemProps) => Promise<ItemProps[]> = (token, item) => {
  const result = axios.put(`${itemUrl}/${item._id}`, item, authConfig(token));
  result.then(async function (result) {
    await Storage.set({
      key: result.data._id!,
      value: JSON.stringify(result.data),
    });
  });
  return withLogs(result, 'updateItem');
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
