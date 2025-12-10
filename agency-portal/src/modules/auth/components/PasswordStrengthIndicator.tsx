import React, { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
    password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
    const strength = useMemo(() => {
        if (!password) return 0;

        let score = 0;
        // Length check
        if (password.length >= 8) score += 1;
        // Number check
        if (/\d/.test(password)) score += 1;
        // Special char check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
        // Uppercase check
        if (/[A-Z]/.test(password)) score += 1;

        return score;
    }, [password]);

    const strengthInfo = useMemo(() => {
        switch (true) {
            case strength === 0:
                return { label: 'Enter Password', color: 'bg-gray-200', width: '0%', textColor: 'text-gray-400' };
            case strength < 2:
                return { label: 'Weak', color: 'bg-red-500', width: '33%', textColor: 'text-red-500' };
            case strength < 4:
                return { label: 'Medium', color: 'bg-yellow-500', width: '66%', textColor: 'text-yellow-500' };
            default:
                return { label: 'Strong', color: 'bg-green-500', width: '100%', textColor: 'text-green-500' };
        }
    }, [strength]);

    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-500">Password Strength:</span>
                <span className={`text-xs font-bold ${strengthInfo.textColor}`}>{strengthInfo.label}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${strengthInfo.color} transition-all duration-300 ease-out`}
                    style={{ width: strengthInfo.width }}
                />
            </div>
            <p className="text-xs text-gray-400 mt-1">
                Use 8+ chars with mix of letters, numbers & symbols
            </p>
        </div>
    );
};

export default PasswordStrengthIndicator;
