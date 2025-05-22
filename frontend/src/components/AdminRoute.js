import React from 'react';
import {Navigate} from 'react-router-dom';

const AdminRoute = ({children}) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || userRole !== 'ROLE_ADMIN') {
        return <Navigate to="/login"/>;
    }

    return children;
};

export default AdminRoute; 