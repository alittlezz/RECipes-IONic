import React from 'react';
import {IonIcon, IonItem, IonLabel} from '@ionic/react';
import {ItemProps} from "../recipes/ItemProps";
import {add, remove, trash} from "ionicons/icons";
import {RemoveConflictFn, SaveItemFn} from "../recipes/ItemProvider";

export interface ConflictExt {
    previousRecipe: ItemProps;
    newRecipe: ItemProps;
    saveRecipe: SaveItemFn;
    removeConflict: RemoveConflictFn;
}

const Conflict: React.FC<ConflictExt> = ({previousRecipe, newRecipe, saveRecipe, removeConflict}) => {
    return (
        <IonItem>
            <IonLabel>{previousRecipe.name}</IonLabel>
            <IonLabel>{newRecipe.name}</IonLabel>
            <IonIcon icon={add} onClick={() => {saveRecipe(newRecipe); removeConflict(previousRecipe)}}/>
            <IonIcon icon={remove} onClick={() => removeConflict(previousRecipe)}/>
        </IonItem>
    );
};

export default Conflict;