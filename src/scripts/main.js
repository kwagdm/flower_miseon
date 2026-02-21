document.addEventListener('DOMContentLoaded', () => {
    const inputCard = document.querySelector('.card');
    const waitingScreen = document.getElementById('waiting-screen');
    const submitBtn = document.getElementById('submit-btn');
    const backBtn = document.querySelector('.back-link');
    const backHomeBtn = document.querySelector('.back-home');

    const resultScreen = document.getElementById('result-screen');

    // 처방받기 버튼 클릭 시 (Input -> Waiting -> Result)
    submitBtn.addEventListener('click', () => {
        inputCard.classList.add('hidden');
        waitingScreen.classList.remove('hidden');
        console.log("🌸 당신의 이야기를 분석 중입니다...");

        // 5초 후 결과 화면으로 전환 (시뮬레이션)
        setTimeout(() => {
            waitingScreen.classList.add('hidden');
            resultScreen.classList.remove('hidden');
            console.log("🌸 처방전 작성이 완료되었습니다.");
        }, 5000);
    });

    // 대기 화면에서 처음으로 돌아가기
    backBtn.addEventListener('click', () => {
        waitingScreen.classList.add('hidden');
        inputCard.classList.remove('hidden');
    });

    // 결과 화면에서 처음으로 돌아가기
    backHomeBtn.addEventListener('click', () => {
        resultScreen.classList.add('hidden');
        inputCard.classList.remove('hidden');
    });
});
