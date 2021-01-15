import React, {useContext, useState} from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonList,
    IonLoading,
    IonPage,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToggle,
    IonToolbar,
    useIonViewDidEnter
} from '@ionic/react';
import {add} from 'ionicons/icons';
import Item from './Item';
import {getLogger} from '../core';
import {ItemContext} from './ItemProvider';
import {AuthContext} from "../auth";
import {useNetwork} from "../utility/useNetwork";
import Conflict from "../conflicts/Conflict";

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
    const {items, fetching, fetchingError, _deleteItem, saveItem,fetchItems, reloadItems, handleConflicts, conflicts, removeConflict} = useContext(ItemContext);
    const {token, logout} = useContext(AuthContext);
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const {networkStatus} = useNetwork();

    useIonViewDidEnter(async () => {
        remaining--;
        if (remaining === 0)
            await fetchItems?.(offset, size, undefined, searchName);
    });

    async function searchNext($event: CustomEvent<void>) {
        offset = offset + size;
        await fetchItems?.(offset, size, currentVal, searchName);
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    async function selectVal(val: string) {
        setFilter(val);
        if (val === 'any')
            currentVal = undefined;
        else
            currentVal = val === "yes";
        await reloadItems?.(offset, size, currentVal, searchName);
    }

    async function typeSearchName(val: string) {
        searchName = val;
        await reloadItems?.(offset, size, currentVal, searchName);
    }

    const handleLogout = () => {
        logout?.();
        return <Redirect to={{pathname: "/login"}}/>;
    };
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>
                    <IonButton class="ion-margin-end" onClick={handleLogout}>Logout</IonButton>
                    <IonSelect value={filter} placeholder={"Select a filter"}
                               onIonChange={e => selectVal(e.detail.value)}>
                        <IonSelectOption value="any">Any</IonSelectOption>
                        <IonSelectOption value="yes">Yes</IonSelectOption>
                        <IonSelectOption value="no">No</IonSelectOption>
                    </IonSelect>
                    <IonSearchbar
                        value={searchName}
                        debounce={1000}
                        onIonChange={e => typeSearchName(e.detail.value!)}>
                    </IonSearchbar>

                    <div>Network status: <IonToggle disabled checked={networkStatus.connected}/></div>
                    {conflicts && conflicts.length > 0 && <div>Avem {conflicts?.length} conflicte</div>}
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="Fetching items"/>
                {items && (!conflicts || conflicts.length === 0) && (
                    <IonList>
                        {
                            items.map(({_id, name, description, isGood, calories, photo, lat, lng}) =>
                                <Item key={_id} _id={_id} name={name} description={description} isGood={isGood}
                                      calories={calories} photo={photo} lat={lat} lng={lng}
                                      onEdit={_id => history.push(`/item/${_id}`)} onDelete={_id => {
                                    _deleteItem && _deleteItem({
                                        _id: _id,
                                        name: name,
                                        description: description,
                                        isGood: isGood,
                                        calories: calories,
                                        photo: photo,
                                        lat: lat,
                                        lng: lng
                                    });
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
                {conflicts && conflicts.length > 0 && (
                    <IonList>
                        {
                            conflicts.map(({previousRecipe, newRecipe}) =>
                                <Conflict previousRecipe={previousRecipe} newRecipe={newRecipe} saveRecipe={saveItem!} removeConflict={removeConflict!}/>
                            )
                        }
                    </IonList>
                )}
                <IonFab className="fab" vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/item')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ItemList;
