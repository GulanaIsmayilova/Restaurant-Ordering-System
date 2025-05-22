import React from 'react';
import {Navigate} from 'react-router-dom';

const StaffRoute = ({children}) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || !['ROLE_KITCHEN', 'ROLE_WAITER'].includes(userRole)) {
        return <Navigate to="/login"/>;
    }

    return children;
};

export default StaffRoute; 