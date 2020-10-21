import React from 'react';
import './ExploreContainer.css';

interface ContainerProps {
}

const ExploreContainer: React.FC<ContainerProps> = () => {
    return (
        <div className="container">
            <strong>Welcome to RECipes</strong>
            <p>The best recipes recommendation engine!</p>
        </div>
    );
};

export default ExploreContainer;
