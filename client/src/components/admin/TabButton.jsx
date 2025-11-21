import React from 'react';

const TabButton = ({ tabName, label, currentTab, setTab, onClick }) => (
    <button
        onClick={() => {
            setTab(tabName);
            if (onClick) onClick();
        }}
        className={`px-4 py-2 font-semibold rounded-lg transition-colors ${currentTab === tabName
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
    >
        {label}
    </button>
);

export default TabButton;
