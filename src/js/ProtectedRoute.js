import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // 로그인 여부
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log(`ProtectedRoute`)
            console.log(currentUser)
            setUser(currentUser);
            setIsAuthenticated(true)
        });

        // 컴포넌트 언마운트 시 구독 해제
        return () => unsubscribe();
    }, [auth]);

    // 사용자가 인증되지 않았다면 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
        return <p>Loading...</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 사용자가 인증되었다면 자식 컴포넌트 렌더링
    return children;
};

export default ProtectedRoute;