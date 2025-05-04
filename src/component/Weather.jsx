import React, { useEffect, useState } from 'react';
import './Weather.css';

const Weather = () => {
    const [weatherData, setWeatherData] = useState({
        date: '',
        time: '',
        temperature: '',
        precipitation: '',
        humidity: '',
        condition: '',
        workout: '',
        workoutIcon: '',
    });

    const serviceKey = 'ZVMI9CAVHX4nVsaidQ2TIXeCyuOA9vFXWwPIDFMOBKJCxwI%2BfrU%2FPsvSgCFqXLc5BUSZP5qKQJ6NJTnsKAATwg%3D%3D';
    const numOfRows = 100;
    const nx = 89; // 대구의 X 좌표
    const ny = 90; // 대구의 Y 좌표

    // 현재 시간 업데이트 함수
    const updateTime = () => {
        setWeatherData((prevState) => ({
            ...prevState,
            time: new Date().toTimeString().slice(0, 8),
        }));
    };

    useEffect(() => {
        const getBaseTime = () => {
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();

            if (minutes < 30) {
                hours -= 1;
            }

            return `${hours.toString().padStart(2, '0')}30`;
        };

        const baseDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const baseTime = getBaseTime();

        const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${serviceKey}&numOfRows=${numOfRows}&pageNo=1&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}&dataType=JSON`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                console.log('API 응답:', data);
                if (data.response && data.response.body && data.response.body.items) {
                    const items = Array.isArray(data.response.body.items.item)
                        ? data.response.body.items.item
                        : [data.response.body.items.item];

                    const newWeatherData = {
                        date: new Date().toISOString().slice(0, 10),
                        time: new Date().toTimeString().slice(0, 8),
                        temperature: '',
                        precipitation: '',
                        humidity: '',
                        condition: '',
                        workout: '',
                        workoutIcon: '',
                    };

                    let skyCode = '';
                    let ptyCode = '';

                    items.forEach((item) => {
                        if (item.category === 'T1H') {
                            newWeatherData.temperature = `${item.obsrValue}℃`;
                        } else if (item.category === 'RN1') {
                            newWeatherData.precipitation = `강수량 : ${item.obsrValue}mm`;
                        } else if (item.category === 'REH') {
                            newWeatherData.humidity = `습도 : ${item.obsrValue}%`;
                        } else if (item.category === 'SKY') {
                            skyCode = item.obsrValue;
                        } else if (item.category === 'PTY') {
                            ptyCode = item.obsrValue;
                        }
                    });

                    newWeatherData.condition = getConditionText(skyCode, ptyCode);
                    const { workout, workoutIcon } = getWorkoutRecommendation(newWeatherData.condition);
                    newWeatherData.workout = workout;
                    newWeatherData.workoutIcon = workoutIcon;

                    setWeatherData(newWeatherData);
                } else {
                    console.error('API response does not contain the expected data:', data);
                }
            })
            .catch((error) => {
                console.error('Error fetching weather data:', error);
            });

        const intervalId = setInterval(updateTime, 1000);
        return () => clearInterval(intervalId);
    }, []);

    // SKY 및 PTY 코드에 따른 날씨 상태 변환 함수
    const getConditionText = (skyCode, ptyCode) => {
        if (ptyCode === '1') return '비';
        if (ptyCode === '2') return '비/눈';
        if (ptyCode === '3') return '눈';
        if (ptyCode === '4') return '소나기';

        switch (String(skyCode)) {
            case '1':
                return '맑음';
            case '3':
                return '구름 많음';
            case '4':
                return '흐림';
            default:
                return '맑음';
        }
    };

    // 날씨 상태에 따른 운동 추천 함수 및 아이콘
    const getWorkoutRecommendation = (condition) => {
        switch (condition) {
            case '맑음':
                return { workout: '오늘은 맑으니 야외에서 조깅이나 자전거 타기를 해보세요!🏃‍♂️' };
            case '구름 많음':
                return { workout: '구름이 많지만 운동하기 좋아요! 가벼운 산책이나 등산을 추천합니다.🚶‍♂️'};
            case '흐림':
                return { workout: '흐린 날씨에는 실내에서 스트레칭이나 홈 트레이닝을 해보세요.🧘‍♀️'};
            case '비':
                return { workout: '오늘은 비가 오니 실내에서 요가나 필라테스를 추천합니다.🧘‍'};
            case '비/눈':
                return { workout: '비와 눈이 함께 내려요. 안전하게 실내에서 운동하세요!🏋️‍♂️'};
            case '눈':
                return { workout: '눈이 내리네요! 실내에서 가벼운 근력 운동을 해보세요.🏋️‍'};
            case '소나기':
                return { workout: '소나기가 예상되니 실내에서 유산소 운동을 추천합니다.🚴‍♂️'};
            default:
                return { workout: '오늘의 날씨에 맞는 운동을 찾아보세요!💪'};
        }
    };

    return (
        <div className="weather-wrap">
            <div>
                <p className="location">위치 : 대구광역시</p>
                <p className="time">시간 : {weatherData.time}</p>
                <p className="condition">날씨 : {weatherData.condition}</p>
            </div>
            <p className="tmp">기온 : {weatherData.temperature}</p>
            <p className="prc">{weatherData.precipitation}</p>
            <p className="hum">{weatherData.humidity}</p>
            <p className="workout">
                추천 운동💪 : {weatherData.workout} {weatherData.workoutIcon}
            </p>
        </div>
    );
};

export default Weather;
