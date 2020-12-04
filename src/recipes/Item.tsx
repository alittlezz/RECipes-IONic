import React from 'react';
import {IonCheckbox, IonIcon, IonItem, IonLabel, IonToggle} from '@ionic/react';
import {ItemProps} from './ItemProps';
import {trash} from "ionicons/icons";

interface ItemPropsExt extends ItemProps {
    onEdit: (id?: string) => void;
    onDelete: (id?: string) => void;
}

const Item: React.FC<ItemPropsExt> = ({_id, name, description, isGood, calories, onEdit, onDelete}) => {
    return (
        <IonItem>
            <IonLabel onClick={() => onEdit(_id)}>{name}</IonLabel>
            <IonToggle checked={isGood}></IonToggle>
            <IonIcon icon={trash} onClick={() => onDelete(_id)}/>
        </IonItem>
    );
};

export default Item;