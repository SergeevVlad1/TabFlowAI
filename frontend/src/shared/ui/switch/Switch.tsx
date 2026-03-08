import React from 'react';
import styles from './switch.module.scss';
import clsx from 'clsx';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
    disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, className, disabled }) => {
    return (
        <label className={clsx(styles.switch, className, disabled && styles.disabled)}>
            <input
                type="checkbox"
                className={styles.input}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <span className={clsx(styles.slider, checked && styles.checked)}></span>
        </label>
    );
};
