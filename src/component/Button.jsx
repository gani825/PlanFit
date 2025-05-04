import React from 'react';
// import './Button.css';

const Button = ({ text, type = 'default', onClick }) => {
    const btnType = ['positive', 'negative'].includes(type) ? type : 'default';

    return (
        <button
            className={["Button", `Button_${btnType}`].join(' ')}
            onClick={onClick}  // onClick 전달된 함수 실행
        >
            {text}
        </button>
    );
};

export default Button;
