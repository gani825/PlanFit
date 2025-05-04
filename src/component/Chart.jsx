import React, { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';

const _animationDuration = 2000;
const _animationDurationUpdate = 2000; /* 그래프 움직이는 시간 더 빠르게 하고싶으면 이걸수정 */
const _animationEasingUpdate = 'cubicOut';
const _valOnRadianMax = 200;
const _outerRadius = 110;
const _innerRadius = 70;

const Chart = ({ completedCount, totalCount }) => {
    const chartRef = useRef(null);

    function renderItem(params, api) {
        const valOnRadian = api.value(1);
        const coords = api.coord([api.value(0), valOnRadian]);
        const polarEndRadian = coords[3];

        return {
            type: 'group',
            children: [
                {
                    type: 'sector',
                    shape: {
                        cx: params.coordSys.cx,
                        cy: params.coordSys.cy,
                        r: _outerRadius,
                        r0: _innerRadius,
                        startAngle: 0,
                        endAngle: -polarEndRadian,
                        transition: ['endAngle'],
                        enterFrom: { endAngle: 0 },
                    },
                    style: {
                        fill: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 1,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(0, 0, 255, 1)' },
                                { offset: 1, color: 'rgba(173, 216, 230, 1)' },
                            ],
                        },
                    },
                },
                {
                    type: 'text',
                    extra: {
                        valOnRadian: valOnRadian,
                        transition: 'valOnRadian',
                        enterFrom: { valOnRadian: 0 },
                    },
                    style: {
                        text: makeText(valOnRadian),
                        fontSize: 30,
                        fontWeight: 700,
                        x: params.coordSys.cx,
                        y: params.coordSys.cy,
                        fill: 'rgb(0, 50, 190)',
                        align: 'center',
                        verticalAlign: 'middle',
                        enterFrom: { opacity: 0 },
                    },
                    during: function (apiDuring) {
                        apiDuring.setStyle('text', makeText(apiDuring.getExtra('valOnRadian')));
                    },
                },
            ],
        };
    }

    function makeText(valOnRadian) {
        return ((valOnRadian / _valOnRadianMax) * 100).toFixed(0) + '%';
    }

    const completionRate = totalCount ? (completedCount / totalCount) * 100 : 0;

    const option = {
        animationEasing: _animationEasingUpdate,
        animationDuration: _animationDuration,
        animationDurationUpdate: _animationDurationUpdate,
        animationEasingUpdate: _animationEasingUpdate,
        dataset: {
            source: [[1, (completionRate / 100) * _valOnRadianMax]],
        },
        tooltip: {},
        angleAxis: {
            type: 'value',
            startAngle: 0,
            show: false,
            min: 0,
            max: _valOnRadianMax,
        },
        radiusAxis: {
            type: 'value',
            show: false,
        },
        polar: {},
        series: [
            {
                type: 'custom',
                coordinateSystem: 'polar',
                renderItem: renderItem,
            },
        ],
    };

    useEffect(() => {
        const interval = setInterval(() => {
            chartRef.current.getEchartsInstance().setOption({
                dataset: {
                    source: [[1, (completionRate / 100) * _valOnRadianMax]],
                },
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [completionRate]);

    return <ReactECharts option={option} ref={chartRef} style={{ height: 250, width: 250 }} />;
};

export default Chart;


//
//
//
// import React, { useEffect, useRef } from 'react';
// import ReactECharts from 'echarts-for-react';
//
// const _animationDuration = 2000; // 애니메이션 지속 시간
// const _animationDurationUpdate = 2000;
// const _animationEasingUpdate = 'cubicOut'; // 부드러운 애니메이션 easing
// const _valOnRadianMax = 200;
// const _outerRadius = 110; // 크기를 줄이기 위해 반지름 조정 (기존의 절반)
// const _innerRadius = 70;
//
// const Chart = () => {
//     const chartRef = useRef(null);
//
//     function renderItem(params, api) {
//         const valOnRadian = api.value(1);
//         const coords = api.coord([api.value(0), valOnRadian]);
//         const polarEndRadian = coords[3];
//
//         return {
//             type: 'group',
//             children: [
//                 // 반원형 섹터로 게이지 표현
//                 {
//                     type: 'sector',
//                     shape: {
//                         cx: params.coordSys.cx,
//                         cy: params.coordSys.cy,
//                         r: _outerRadius,
//                         r0: _innerRadius,
//                         startAngle: 0,
//                         endAngle: -polarEndRadian,
//                         transition: ['endAngle'], // endAngle 값에 트랜지션 적용
//                         enterFrom: { endAngle: 0 }, // 시작 시 endAngle이 0에서 시작
//                     },
//                     style: {
//                         fill: {
//                             type: 'linear',
//                             x: 0,
//                             y: 0,
//                             x2: 1,
//                             y2: 1,
//                             colorStops: [
//                                 { offset: 0, color: 'rgba(0, 0, 255, 1)' },      // 시작 부분 진한 파란색
//                                 { offset: 1, color: 'rgba(173, 216, 230, 1)' }, // 끝 부분 연한 파란색
//                             ],
//                         },
//                     },
//                 },
//
//                 // 퍼센트 텍스트 표시
//                 {
//                     type: 'text',
//                     extra: {
//                         valOnRadian: valOnRadian,
//                         transition: 'valOnRadian',
//                         enterFrom: { valOnRadian: 0 },
//                     },
//                     style: {
//                         text: makeText(valOnRadian),
//                         fontSize: 30, // 텍스트 크기를 줄임
//                         fontWeight: 700,
//                         x: params.coordSys.cx,
//                         y: params.coordSys.cy,
//                         fill: 'rgb(0, 50, 190)',
//                         align: 'center',
//                         verticalAlign: 'middle',
//                         enterFrom: { opacity: 0 },
//                     },
//                     during: function (apiDuring) {
//                         apiDuring.setStyle('text', makeText(apiDuring.getExtra('valOnRadian')));
//                     },
//                 },
//             ],
//         };
//     }
//
//     function makeText(valOnRadian) {
//         return ((valOnRadian / _valOnRadianMax) * 100).toFixed(0) + '%';
//     }
//
//     const option = {
//         animationEasing: _animationEasingUpdate,
//         animationDuration: _animationDuration,
//         animationDurationUpdate: _animationDurationUpdate,
//         animationEasingUpdate: _animationEasingUpdate,
//         dataset: {
//             source: [[1, 156]],
//         },
//         tooltip: {},
//         angleAxis: {
//             type: 'value',
//             startAngle: 0,
//             show: false,
//             min: 0,
//             max: _valOnRadianMax,
//         },
//         radiusAxis: {
//             type: 'value',
//             show: false,
//         },
//         polar: {},
//         series: [
//             {
//                 type: 'custom',
//                 coordinateSystem: 'polar',
//                 renderItem: renderItem,
//             },
//         ],
//     };
//
//     useEffect(() => {
//         const interval = setInterval(() => {
//             const nextSource = [[1, Math.round(Math.random() * _valOnRadianMax)]];
//             chartRef.current.getEchartsInstance().setOption({
//                 dataset: {
//                     source: nextSource,
//                 },
//             });
//         }, 3000);
//
//         return () => clearInterval(interval);
//     }, []);
//
//     return <ReactECharts option={option} ref={chartRef} style={{ height: 250, width: 250 }} />;
// };
//
// export default Chart;
