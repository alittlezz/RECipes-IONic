import React, {useContext, useState} from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
    IonButton, IonCheckbox,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
    IonList,
    IonLoading,
    IonPage, IonRow, IonSearchbar, IonSelect, IonSelectOption,
    IonTitle,
    IonToolbar, useIonViewDidEnter, useIonViewWillEnter
} from '@ionic/react';
import {add} from 'ionicons/icons';
import Item from './Item';
import {getLogger} from '../core';
import {ItemContext} from './ItemProvider';
import {deleteItem} from "./itemApi";
import {AuthContext} from "../auth";

const log = getLogger('ItemList');
// Here starts the magic.
const size = 15;
let offset = 0;
let remaining = 5;
let currentVal: boolean | undefined = undefined;
let searchName: string = '';
// Here ends the magic.

const ItemList: React.FC<RouteComponentProps> = ({history}) => {
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const {items, fetching, fetchingError, _deleteItem, fetchItems, reloadItems} = useContext(ItemContext);
    const {token, logout} = useContext(AuthContext);
    const [filter, setFilter] = useState<string | undefined>(undefined);

    useIonViewDidEnter(async () => {
        console.log('[useIon] calling fetch');
        remaining--;
        if(remaining === 0)
            await fetchItems?.(offset, size, undefined, searchName);
    });

    async function searchNext($event: CustomEvent<void>) {
        offset = offset + size;
        console.log('[SearchNext] calling fetch with offset=', offset);
        await fetchItems?.(offset, size, currentVal, searchName);
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }
    async function selectVal(val: string){
        setFilter(val);
        if(val === 'any')
            currentVal = undefined;
        else
            currentVal = val === "yes";
        await reloadItems?.(offset, size, currentVal, searchName);
    }

    async function typeSearchName(val: string){
        searchName = val;
        await reloadItems?.(offset, size, currentVal, searchName);
    }

    const handleLogout = () => {
        logout?.();
        return <Redirect to={{pathname: "/login"}}/>;
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>
                    <IonButton class="ion-margin-end" onClick={handleLogout}>Logout</IonButton>
                    <IonSelect value={filter} placeholder={"Select a filter"} onIonChange={e => selectVal(e.detail.value)}>
                        <IonSelectOption value="any">Any</IonSelectOption>
                        <IonSelectOption value="yes">Yes</IonSelectOption>
                        <IonSelectOption value="no">No</IonSelectOption>
                    </IonSelect>
                    <IonSearchbar
                        value={searchName}
                        debounce={1000}
                        onIonChange={e => typeSearchName(e.detail.value!)}>
                    </IonSearchbar>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="Fetching items"/>
                {items && (
                    <IonList>
                        {
                            items.map(({_id, name, description, isGood, calories}) =>
                                <Item key={_id} _id={_id} name={name} description={description} isGood={isGood} calories={calories}
                                      onEdit={_id => history.push(`/item/${_id}`)} onDelete={_id => {
                                    _deleteItem && _deleteItem({_id: _id, name: name, description: description, isGood: isGood, calories: calories});
                                }}/>
                            )
                        }
                        <IonInfiniteScroll threshold="10px" disabled={disableInfiniteScroll}
                                           onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                            <IonInfiniteScrollContent
                                loadingText="Loading more items...">
                            </IonInfiniteScrollContent>
                        </IonInfiniteScroll>

                    </IonList>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/item')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ItemList;
