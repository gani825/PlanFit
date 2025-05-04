import React, {useState, useEffect} from 'react';
import './ExercisePopup.css';

const exerciseData = {
    유산소운동: [
        {name: "달리기", energy: 7},
        {name: "걷기", energy: 4.5},
        {name: "사이클", energy: 7},
        {name: "스피닝", energy: 9},
        {name: "조깅", energy: 7},
        {name: "계단오르기 ", energy: 8},
        {name: "계단내려가기  ", energy: 3},
        {name: "수중 에어로빅", energy: 4},
        {name: "런닝머신(달리기)", energy: 9},
        {name: "등산  ", energy: 7},
        {name: "제자리뛰기 ", energy: 5.5},
        {name: "트랙걷기 ", energy: 4.5},
        {name: "운동장 걷기", energy: 4.5},
        {name: "배드민턴 랠리", energy: 4.5},
        {name: "에어로빅(저강도)", energy: 5},
        {name: "에어로빅(중강도)", energy: 6.5},
        {name: "에어로빅(고강도)", energy: 7.3},
        {name: "댄스스포츠 ", energy: 5.5},
        {name: "스포츠댄스 ", energy: 5.5},
        {name: "훌라후프 ", energy: 5.5},
    ],
    근력운동: [
        {name: "푸쉬업", energy: 5},
        {name: "스쿼트", energy: 5.5},
        {name: "레그 레이즈", energy: 5},
        {name: "바벨 숄더프레스", energy: 5.5},
        {name: "풀업", energy: 8},
        {name: "팔굽혀펴기(격렬하게)", energy: 8},
        {name: "푸쉬업(가볍게)", energy: 3},
        {name: "푸쉬업(격렬하게)", energy: 8},
        {name: "런지(보통으로)", energy: 3.8},
        {name: "와일드 런지", energy: 5.5},
        {name: "윗몸일으키기(가볍게)", energy: 2.8},
        {name: "윗몸일으키기(격렬하게)", energy: 8},
        {name: "레그 프레스", energy: 5},
        {name: "풋살", energy: 8},
        {name: "족구", energy: 5.5},
        {name: "점프 스쿼트", energy: 6},
        {name: "브릿지 ", energy: 3.5},
        {name: "턱걸이(가볍게)", energy: 3},
        {name: "턱걸이(격렬하게)", energy: 8},
        {name: "원 암 덤벨로우", energy: 5},
    ],
    유연성운동: [
        {name: "요가", energy: 2.5},
        {name: "스트레칭", energy: 2.5},
        {name: "타이치", energy: 4},
        {name: "플라잉 요가", energy: 4},
        {name: "아쉬탕가 요가", energy: 5},
        {name: "스트레칭(가볍게)", energy: 2.5},
        {name: "훌라후프 ", energy: 4},
        {name: "발레(일반적인)", energy: 5},
        {name: "발레(격렬하게)", energy: 6.8},
        {name: "밸리댄스 ", energy: 4.5},
        {name: "플라잉 요가", energy: 4.5},
        {name: "러시안트위스트 ", energy: 4},
        {name: "수중 걷기", energy: 3.5},
        {name: "필라테스", energy: 3},
        {name: "필라테스(기구)", energy: 5},
    ],
    기타: [
        {name: "댄스", energy: 4.5},
        {name: "줌바댄스", energy: 5},
        {name: "태권도", energy: 10},
        {name: "검도", energy: 6},
        {name: "복싱", energy: 7.8},
        {name: "당구 ", energy: 2.5},
        {name: "볼링", energy: 3},
        {name: "스크린골프 ", energy: 4},
        {name: "암벽등반", energy: 11},
        {name: "스케이팅 ", energy: 7},
        {name: "줄넘기(천천히)", energy: 8},
        {name: "줄넘기(빠르게)", energy: 9},
        {name: "버피테스트 ", energy: 7},
        {name: "국민체조", energy: 3.5},
    ],
};


const ExercisePopup = ({ onClose, onConfirm, editExercise }) => {
    const categories = Object.keys(exerciseData);
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [exerciseDetails, setExerciseDetails] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;

    const allExercises = categories.flatMap(category => exerciseData[category]);
    const filteredExercises = searchQuery
        ? allExercises.filter(exercise => exercise.name.includes(searchQuery))
        : exerciseData[selectedCategory];

    const totalPages = Math.ceil(filteredExercises.length / itemsPerPage);
    const paginatedExercises = filteredExercises.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        if (editExercise) {
            setSelectedExercises([editExercise]);
            setExerciseDetails({
                [editExercise.name]: {
                    ...editExercise,
                    time: editExercise.time || 0,
                },
            });
        }
    }, [editExercise]);

    const handleCheckboxChange = (exercise) => {
        setSelectedExercises((prev) =>
            prev.includes(exercise) ? prev.filter((item) => item !== exercise) : [...prev, exercise]
        );
    };

    const handleTimeChange = (exercise, time) => {
        setExerciseDetails((prevDetails) => {
            const updatedDetails = {
                ...prevDetails,
                [exercise.name]: {...exercise, time: parseInt(time, 10) || 0},
            };

            console.log("Exercise Details:", updatedDetails); // 상태 확인
            return updatedDetails;
        });
    };

    const calculateCalories = (exercise) => {
        const time = exerciseDetails[exercise.name]?.time || 0;
        return (exercise.energy * (time / 60)).toFixed(2);
    };

    const handleConfirm = () => {
        console.log("Selected Exercises on Confirm:", selectedExercises); // 상태 확인

        const exercisesWithDetails = selectedExercises.map((exercise) => ({
            ...exercise,
            time: exerciseDetails[exercise.name]?.time || 0,
            calories: calculateCalories(exercise),
        }));

        if (exercisesWithDetails.length === 0) {
            alert("선택된 운동이 없습니다. 운동을 선택해주세요.");
            return;
        }

        if (editExercise) {
            onConfirm(exercisesWithDetails[0]);
        } else {
            onConfirm(exercisesWithDetails);
        }

        onClose();
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // 검색 시 페이지를 첫 페이지로 초기화
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>운동 선택하기</h2>

                <input
                    type="text"
                    placeholder="운동 검색..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="search-input"
                />

                {!searchQuery && (
                    <div className="category-tabs">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setCurrentPage(1);
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                )}

                <div className="exercise-list">
                    {paginatedExercises.length > 0 ? (
                        paginatedExercises.map((exercise) => (
                            <div key={exercise.name} className="exercise-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedExercises.some((ex) => ex.name === exercise.name)}
                                        onChange={() => handleCheckboxChange(exercise)}
                                    />
                                    {exercise.name} - {exercise.energy} kcal/kg
                                </label>
                                <div className="exercise-details">
                                    <select
                                        value={exerciseDetails[exercise.name]?.time || ''}
                                        onChange={(e) => handleTimeChange(exercise, e.target.value)}
                                    >
                                        <option value="">운동 시간 선택</option>
                                        {[30, 60, 90, 120, 180, 240].map((minute) => (
                                            <option key={minute} value={minute}>
                                                {minute} 분
                                            </option>
                                        ))}
                                    </select>
                                    <p>소모 칼로리: {calculateCalories(exercise)} kcal</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>입력한 운동이 없습니다.</p>
                    )}
                </div>

                <div className="pagination">
                    {Array.from({length: totalPages}, (_, i) => (
                        <button
                            key={i + 1}
                            className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
                            onClick={() => handlePageChange(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <div className="fixed-buttons">
                    <button className="popup-button" onClick={handleConfirm} disabled={selectedExercises.length === 0}>
                        {editExercise ? '선택한 운동 수정하기' : `${selectedExercises.length}개의 운동 추가하기`}
                    </button>

                    <button className="popup-button close-button" onClick={onClose}>
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExercisePopup;