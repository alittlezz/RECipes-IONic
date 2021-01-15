import React from 'react';
import {createAnimation, IonButton, IonIcon, IonItem, IonLabel, IonToggle} from '@ionic/react';
import {ItemProps} from './ItemProps';
import {trash} from "ionicons/icons";

interface ItemPropsExt extends ItemProps {
    onEdit: (id?: string) => void;
    onDelete: (id?: string) => void;
}

const Item: React.FC<ItemPropsExt> = ({
                                          _id,
                                          name,
                                          description,
                                          isGood,
                                          calories,
                                          photo,
                                          lat,
                                          lng,
                                          onEdit,
                                          onDelete
                                      }) => {
    function onMaps(lat: number, lng: number) {
        const win = window.open(`https://www.google.ro/maps/@${lat},${lng},14z`, '_blank');
        win?.focus();
    }

    function simpleAnimation(id: string, onEnd: (id?: string) => void) {
        const el = document.querySelector(`#${id}`);
        if (el) {
            const animation = createAnimation()
                .addElement(el)
                .duration(1000)
                .fromTo('opacity', '1', '0');
            (async () => {
                await animation.play();
                onEnd(id);
            })();
        }
    }

    function toggleAnimation(_id: string) {
        const el = document.querySelector(`#${_id}`);
        if (el) {
            const animationA = createAnimation()
                .addElement(el)
                .duration(2000)
                .fromTo('transform', 'scale(1)', 'scale(0.25)');
            const animationB = createAnimation()
                .addElement(el)
                .duration(3000)
                .fromTo('transform', 'scale(0.25)', 'scale(1)');
            (async () => {
                await animationA.play();
                await animationB.play();
            })();
        }
    }

    function toggleOffAnimation(_id: string) {
        const el = document.querySelector(`#${_id}`);
        const fab = document.querySelector('.fab');
        if (el && fab) {
            const animationA = createAnimation()
                .addElement(el)
                .direction('normal')
                .iterations(1)
                .keyframes([
                    {offset: 0, transform: 'rotate(0deg)'},
                    {offset: 1, transform: 'rotate(360deg)'},
                ]);
            const animationB = createAnimation()
                .addElement(fab)
                .direction('alternate')
                .iterations(2)
                .keyframes([
                    {offset: 0, left: '95%'},
                    {offset: 1, left: '0%'},
                ]);
            const parentAnimation = createAnimation()
                .duration(3000)
                .addAnimation([animationA, animationB]);
            parentAnimation.play();
        }
    }

    return (<div className="item" id={_id}>
        <IonItem>
            <IonLabel onClick={() => onEdit(_id)}>{name}</IonLabel>
            <IonButton onClick={() => onMaps(lat, lng)}>Take me to coords
                ({lat.toFixed(2)}, {lng.toFixed(2)})</IonButton>
            {photo && (<img src={photo} width={'100px'} height={'100px'}/>)}
            {!photo && (
                <img src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}
            <IonToggle checked={isGood} onIonChange={e => {
                if (e.detail.checked) toggleAnimation(_id as string); else toggleOffAnimation(_id as string)
            }}/>
            <IonIcon icon={trash} onClick={() => simpleAnimation(_id as string, onDelete)}/>
        </IonItem>
    </div>);
};

export default Item;