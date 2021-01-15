import React, {useState} from 'react';
import {createAnimation, IonButton, IonModal} from '@ionic/react';

export function MyModal(props: { children: any; }) {
    const [showModal, setShowModal] = useState(false);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const modalWrapper = baseEl.querySelector('.modal-wrapper');
        modalWrapper.classList.add('myModal');
        const wrapperAnimation = createAnimation()
            .addElement(modalWrapper!)
            .keyframes([
                {offset: 0, opacity: '0', transform: 'scale(0)'},
                {offset: 1, opacity: '0.99', transform: 'scale(1)'}
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(1000)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    return (
        <>
            <IonModal cssClass="myModal" isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                {props.children}
                <IonButton onClick={() => setShowModal(false)}>Close Map</IonButton>
            </IonModal>
            <IonButton onClick={() => setShowModal(true)}>Open Map</IonButton>
        </>
    );
}