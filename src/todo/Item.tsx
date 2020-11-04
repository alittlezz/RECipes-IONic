import React from 'react';
import {IonButton, IonIcon, IonItem, IonLabel} from '@ionic/react';
import { ItemProps } from './ItemProps';
import {trash} from "ionicons/icons";
import {deleteItem} from "./itemApi";

interface ItemPropsExt extends ItemProps {
  onEdit: (id?: string) => void;
  onDelete: (id?: string) => void;
}

const Item: React.FC<ItemPropsExt> = ({ id, name, description, calories ,onEdit, onDelete }) => {
  return (
    <IonItem>
      <IonLabel onClick={() => onEdit(id)}>{name}</IonLabel>
      <IonIcon icon={trash} onClick={() => onDelete(id)}/>
    </IonItem>
  );
};

export default Item;
