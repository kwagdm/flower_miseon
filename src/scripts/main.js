document.addEventListener('DOMContentLoaded', () => {
    const inputCard = document.querySelector('.card');
    const waitingScreen = document.getElementById('waiting-screen');
    const submitBtn = document.getElementById('submit-btn');
    const backBtn = document.querySelector('.back-btn');

    // 처방받기 버튼 클릭 시
    submitBtn.addEventListener('click', () => {
        inputCard.classList.add('hidden');
        waitingScreen.classList.remove('hidden');
        console.log("🌸 AI가 당신의 이야기를 분석하기 시작했습니다...");
    });

    // 뒤로가기 버튼 클릭 시 (다시 입력 화면으로)
    backBtn.addEventListener('click', () => {
        waitingScreen.classList.add('hidden');
        inputCard.classList.remove('hidden');
    });
});
