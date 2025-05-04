import React from 'react';

const Header = ({ title, leftChild, rightChild }) => {
    return (
        <div className="month-navigation">
            {leftChild}
            <span id="monthYear">{title}</span>
            {rightChild}
        </div>
    );
};

export default Header;

