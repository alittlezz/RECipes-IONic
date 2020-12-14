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
  IonToolbar,
    IonImg,
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { RouteComponentProps } from 'react-router';
import { ItemProps } from './ItemProps';
import {usePhotoGallery} from "../photos/usePhotoGallery";

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
  const [photo, setPhoto] = useState('');
  const [item, setItem] = useState<ItemProps>();
  const {takePhoto} = usePhotoGallery();
  useEffect(() => {
    const routeId = match.params._id || '';
    const item = items?.find(it => it._id === routeId);
    setItem(item);
    if (item) {
      setName(item.name);
      setDescription(item.description);
      setCalories(item.calories.toString());
      setIsGood(item.isGood);
      setPhoto(item.photo);
      setVersion(item.version!);
    }
  }, [match.params._id, items]);
  const handleSave = () => {
    const editedItem = item ? { ...item, name, description, isGood, calories, photo, version } : { name, description, isGood, calories, photo };
    saveItem && saveItem(editedItem).then(() => history.goBack());
  };

  async function handlePhotoChange() {
    const image = await takePhoto();
    if (!image) {
      setPhoto('');
    } else {
      setPhoto(image);
    }
  }

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
        {photo && (<img onClick={handlePhotoChange} src={photo} width={'100px'} height={'100px'}/>)}
        {!photo && (<img onClick={handlePhotoChange} src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ItemEdit;
