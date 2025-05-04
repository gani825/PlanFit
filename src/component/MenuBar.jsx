import './MenuBar.css'
import logo from '../img/logo.png'
import {NavLink} from "react-router-dom";


const MenuBar = () => {
    return (
        <div className="MenuBar">
            <img src={logo} alt="logo" />
            <div className="navigation">
                <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>홈</NavLink>
                <NavLink to="/calendar" className={({ isActive }) => isActive ? "active-link" : ""}>캘린더</NavLink>
                <NavLink to="/diary" className={({ isActive }) => isActive ? "active-link" : ""}>다이어리</NavLink>
                <NavLink to="/myPage" className={({ isActive }) => isActive ? "active-link" : ""}>마이페이지</NavLink>
                {/*<Link to="/">홈</Link>*/}
                {/*<Link to="/calendar">캘린더</Link>*/}
                {/*<Link to="/diary">다이어리</Link>*/}
                {/*<Link to="/myPage">마이페이지</Link>*/}
            </div>
        </div>
    )
};

export default MenuBar;
