import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import Home from './pages/Home';
import MyPage from './pages/MyPage';
import Login from './pages/Login';
import Join from './pages/Join';
import EditPassword from './pages/EditPassword';
import Diary from './pages/Diary';
import Calendar from './pages/Calendar';
import MenuBar from './component/MenuBar';
import { db, auth } from './js/firebaseApp';
import ProtectedRoute from './js/ProtectedRoute';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';

export const AuthContext = createContext();

function App() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUser(user);

                // 사용자 정보를 Realtime Database에서 가져오기
                const userRef = ref(db, 'users/' + user.uid);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    setUserInfo(snapshot.val());
                } else {
                    console.log("해당 사용자 정보가 존재하지 않습니다.");
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
                setUserInfo(null);
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const onLogin = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            setIsAuthenticated(true);
            navigate('/');  // 로그인 후 홈 페이지로 이동
        } catch (error) {
            alert('로그인 실패');
            console.log(error.code, error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setIsAuthenticated(false);
            setUserInfo(null);
            navigate('/login');
        } catch (error) {
            alert('로그아웃 실패');
            console.log(error.code, error.message);
        }
    };

    // 비밀번호 변경 함수 정의
    const onEditPassword = async (newPassword) => {
        try {
            if (user) {
                // Firebase Authentication에서 비밀번호 업데이트
                await updatePassword(user, newPassword);
                alert("비밀번호가 성공적으로 변경되었습니다.");
                navigate('/myPage');  // 비밀번호 변경 후 MyPage로 이동
            }
        } catch (error) {
            alert("비밀번호 변경에 실패했습니다.");
            console.log(error.code, error.message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, userInfo }}>
            <MenuBar />
            <div className="layout">
                <Routes>
                    <Route path="/" element={<Home />} /> {/* 기본적으로 홈 페이지가 보이도록 설정 */}
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/diary/*" element={<Diary />} />
                    <Route
                        path="/myPage"
                        element={
                            <ProtectedRoute>
                                <MyPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<Login onLogin={onLogin} />} />
                    <Route path="/join" element={<Join />} />
                    {/* EditPassword 컴포넌트에 onEditPassword 전달 */}
                    <Route path="/editPassword" element={<EditPassword onEditPassword={onEditPassword} />} />
                </Routes>
            </div>
        </AuthContext.Provider>
    );
}

export default App;



// import './App.css';
// import { Routes, Route, useNavigate } from 'react-router-dom';
// import { useState, useEffect, createContext } from 'react';
// import Home from './pages/Home';
// import MyPage from './pages/MyPage';
// import Login from './pages/Login';
// import Join from './pages/Join';
// import EditPassword from './pages/EditPassword';
// import Diary from './pages/Diary';
// import Calendar from './pages/Calendar';
// import MenuBar from './component/MenuBar';
// import { db, auth } from './js/firebaseApp';
// import ProtectedRoute from './js/ProtectedRoute';
// import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword } from 'firebase/auth';
// import { ref, get } from 'firebase/database';
//
// export const AuthContext = createContext();
//
// function App() {
//     const navigate = useNavigate();
//     const [user, setUser] = useState(null);
//     const [userInfo, setUserInfo] = useState(null);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//
//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, async (user) => {
//             if (user) {
//                 setIsAuthenticated(true);
//                 setUser(user);
//
//                 // 사용자 정보를 Realtime Database에서 가져오기
//                 const userRef = ref(db, 'users/' + user.uid);
//                 const snapshot = await get(userRef);
//                 if (snapshot.exists()) {
//                     setUserInfo(snapshot.val());
//                 } else {
//                     console.log("해당 사용자 정보가 존재하지 않습니다.");
//                 }
//             } else {
//                 setIsAuthenticated(false);
//                 setUser(null);
//                 setUserInfo(null);
//             }
//         });
//         return () => {
//             unsubscribe();
//         };
//     }, []);
//
//     const onLogin = async (email, password) => {
//         try {
//             const userCredential = await signInWithEmailAndPassword(auth, email, password);
//             setUser(userCredential.user);
//             setIsAuthenticated(true);
//             navigate('/');
//         } catch (error) {
//             alert('로그인 실패');
//             console.log(error.code, error.message);
//         }
//     };
//
//     const handleLogout = async () => {
//         try {
//             await signOut(auth);
//             setUser(null);
//             setIsAuthenticated(false);
//             setUserInfo(null);
//             navigate('/login');
//         } catch (error) {
//             alert('로그아웃 실패');
//             console.log(error.code, error.message);
//         }
//     };
//
//     // 비밀번호 변경 함수 정의
//     const onEditPassword = async (newPassword) => {
//         try {
//             if (user) {
//                 // Firebase Authentication에서 비밀번호 업데이트
//                 await updatePassword(user, newPassword);
//                 alert("비밀번호가 성공적으로 변경되었습니다.");
//                 navigate('/myPage');  // 비밀번호 변경 후 MyPage로 이동
//             }
//         } catch (error) {
//             alert("비밀번호 변경에 실패했습니다.");
//             console.log(error.code, error.message);
//         }
//     };
//
//     return (
//         <AuthContext.Provider value={{ user, isAuthenticated, userInfo }}>
//             <MenuBar />
//             <div className="layout">
//                 <Routes>
//                     <Route path="/" element={<Home />} />
//                     <Route path="/calendar" element={<Calendar />} />
//                     <Route path="/diary/*" element={<Diary />} />
//                     <Route
//                         path="/myPage"
//                         element={
//                             <ProtectedRoute>
//                                 <MyPage />
//                             </ProtectedRoute>
//                         }
//                     />
//                     <Route path="/login" element={<Login onLogin={onLogin} />} />
//                     <Route path="/join" element={<Join />} />
//                     {/* EditPassword 컴포넌트에 onEditPassword 전달 */}
//                     <Route path="/editPassword" element={<EditPassword onEditPassword={onEditPassword} />} />
//                 </Routes>
//             </div>
//         </AuthContext.Provider>
//     );
// }
//
// export default App;

