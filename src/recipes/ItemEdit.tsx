import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons, IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { ItemProps } from './ItemProps';

const log = getLogger('ItemEdit');

interface ItemEditProps extends RouteComponentProps<{
  _id?: string;
}> {}

const ItemEdit: React.FC<ItemEditProps> = ({ history, match }) => {
  const { items, saving, savingError, saveItem } = useContext(ItemContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [isGood, setIsGood] = useState(false);
  const [version, setVersion] = useState(1);
  const [item, setItem] = useState<ItemProps>();
  useEffect(() => {
    const routeId = match.params._id || '';
    const item = items?.find(it => it._id === routeId);
    setItem(item);
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setCalories(item.calories.toString());
      setIsGood(item.isGood);
      setVersion(item.version!);
    }
  }, [match.params._id, items]);
  const handleSave = () => {
    const editedItem = item ? { ...item, name, description, isGood, calories, version } : { name, description, isGood, calories };
    saveItem && saveItem(editedItem).then(() => history.goBack());
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonTitle>Name</IonTitle>
        <IonInput value={name} onIonChange={e => setName(e.detail.value || '')} />
        <IonTitle>Description</IonTitle>
        <IonInput value={description} onIonChange={e => setDescription(e.detail.value || '')} />
        <IonTitle>Is good</IonTitle>
        <IonCheckbox checked={isGood} onIonChange={e => setIsGood(e.detail.checked)} />
        <IonTitle>Calories</IonTitle>
        <IonInput value={calories} onIonChange={e => setCalories(e.detail.value || '')} />
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ItemEdit;
