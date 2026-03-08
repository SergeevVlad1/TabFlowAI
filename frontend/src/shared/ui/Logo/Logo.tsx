import React from 'react';

interface LogoProps {
    size?: number;
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M10 12C10 10.8954 10.8954 10 12 10H28C29.1046 10 30 10.8954 30 12V28C30 29.1046 29.1046 30 28 30H12C10.8954 30 10 29.1046 10 28V12Z"
                fill="url(#logo-gradient)"
            />
            <path
                d="M10 20C10 18.8954 10.8954 18 12 18H28C29.1046 18 30 18.8954 30 20V28C30 29.1046 29.1046 30 28 30H12C10.8954 30 10 29.1046 10 28V20Z"
                fill="white"
                fillOpacity="0.2"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20 15C17.2386 15 15 17.2386 15 20C15 22.7614 17.2386 25 20 25C22.7614 25 25 22.7614 25 20C25 17.2386 22.7614 15 20 15ZM20 23C18.3431 23 17 21.6569 17 20C17 18.3431 18.3431 17 20 17C21.6569 17 23 18.3431 23 20C23 21.6569 21.6431 23 20 23Z"
                fill="white"
            />
            <defs>
                <linearGradient id="logo-gradient" x1="10" y1="10" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#7C4DFF" />
                    <stop offset="1" stopColor="#3BE3B5" />
                </linearGradient>
            </defs>
        </svg>
    );
};
