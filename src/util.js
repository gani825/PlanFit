

export const getFormattedDate = (targetDate) => {
    const year = targetDate.getFullYear()
    let month = targetDate.getMonth() + 1
    let date = targetDate.getDate()

    if (month < 10) {
        month = `0${month}`
    }
    if (date < 10) {
        date= `0${date}`
    }
    return `${year}-${month}-${date}`
}

export const getMonthRangeByDate = (date) => {
    /*date를 받아서 그 달의 시작과 끝을 timestamp로 반환하는 함수*/
    // 그 달의 시작일 (1일)
    const beginTimeStamp = new Date(
        date.getFullYear(),
        date.getMonth(),
        1).getTime();
    // 그 달의 마지막일의 11시 59분 59초
    const endTimeStamp = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0, 23, 59, 59).getTime()
    return {beginTimeStamp, endTimeStamp}
}
export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
};
