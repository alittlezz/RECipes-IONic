import React from 'react';
import {IonCheckbox, IonContent, IonIcon, IonItem, IonLabel, IonLoading, IonToggle} from '@ionic/react';
import {ItemProps} from './ItemProps';
import {trash} from "ionicons/icons";

interface ItemPropsExt extends ItemProps {
    onEdit: (id?: string) => void;
    onDelete: (id?: string) => void;
}

const Item: React.FC<ItemPropsExt> = ({_id, name, description, isGood, calories, photo, onEdit, onDelete}) => {
    return (
        <IonItem>
            <IonLabel onClick={() => onEdit(_id)}>{name}</IonLabel>
            {photo && (<img src={photo} width={'100px'} height={'100px'}/>)}
            {!photo && (<img src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}
            <IonToggle checked={isGood}></IonToggle>
            <IonIcon icon={trash} onClick={() => onDelete(_id)}/>
        </IonItem>
    );
};

export default Item;