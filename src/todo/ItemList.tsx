import React, {useContext} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import Item from './Item';
import {getLogger} from '../core';
import {ItemContext} from './ItemProvider';
import {deleteItem} from "./itemApi";

const log = getLogger('ItemList');

const ItemList: React.FC<RouteComponentProps> = ({history}) => {
    const {items, fetching, fetchingError} = useContext(ItemContext);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items"/>
                {items && (
                    <IonList>
                        {
                            items.map(({id, name, description, calories}) =>
                                <Item key={id} id={id} name={name} description={description} calories={calories}
                                      onEdit={id => history.push(`/item/${id}`)} onDelete={id => {
                                    deleteItem(id as string);
                                    // eslint-disable-next-line no-restricted-globals
                                    location.reload();
                                }}/>
                            )
                        }
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
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
